/**
 * Three.js Particle Morph Entry Animation — Single Page (DOM-Aware)
 *
 * KEY FIX: uses getBoundingClientRect() on the REAL hero image element
 * so particle targets align EXACTLY with where the DOM image sits onscreen.
 * Transition: canvas fades OUT, hero image fades IN at the same pixel position.
 */

class ParticleSystem3D {
  constructor() {
    this.container = document.getElementById('particle-entry');
    this.canvas    = document.getElementById('particle-canvas');
    if (!this.canvas || !this.container) return;

    // ── Scene (black for intro) ───────────────────────────────────────────────
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    const fov = 50;
    this.camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 5000);
    // Z where 1 WebGL unit == 1 CSS pixel
    this.pixelZ = (window.innerHeight / 2) / Math.tan((fov * Math.PI) / 360);
    this.camera.position.z = this.pixelZ + 1200;

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: false, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // cap DPR for perf

    this.geometry = null;
    this.material = null;
    this.particles = null;

    this.phase = 'idle';
    this.mouse = new THREE.Vector2();
    this.targetMouse = new THREE.Vector2();
    this.time = 0;

    // Store pixel dimensions of the hero image as measured from DOM
    this.heroDims = null;
    // Offset of hero image top-left in viewport coords (from getBoundingClientRect)
    this.heroRect = null;

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);

    this._bindEvents();
    this._loadPhotoAndBuild();

    // Cinematic "Hello" intro or SKIP if coming from backlink
    const navEntries = performance.getEntriesByType("navigation");
    const navType = navEntries.length > 0 ? navEntries[0].type : "navigate";
    // "back_forward" = browser Back/Forward button; "navigate" = link click
    const isFromInternal = document.referrer.includes('certifications.html') || 
                           document.referrer.includes('projects.html') || 
                           document.referrer.includes('home.html');
    const hasHash = !!window.location.hash;
    const isBackNavigation = navType === "back_forward";

    // SKIP INTRO if: coming back via browser Back button OR link from internal subpage OR hash routing
    if (isBackNavigation || (navType === "navigate" && isFromInternal) || hasHash) {
      const page = document.getElementById('portfolioPage');
      const pEntry = document.getElementById('particle-entry');
      const cinema = document.getElementById('cinematic-overlay');

      if (pEntry) pEntry.style.display = 'none';
      if (cinema) cinema.style.display = 'none';

      if (page) {
        page.style.opacity = '1';
        page.style.pointerEvents = 'auto';
        page.classList.add('visible');
      }

      // Immediately reveal hero image and all hero text elements
      const heroImgWrap = document.querySelector('.hero-image');
      if (heroImgWrap) heroImgWrap.style.opacity = '1';

      const heroEls = document.querySelectorAll(
        '.hero-massive-overlay, .hero-tagline-small, .hero-right-text, .hero-name, .hero-tagline, .hero-bottom-left, .hero-bottom-right'
      );
      heroEls.forEach(el => el.classList.add('hero-animated'));

      // Reveal the navbar immediately
      setTimeout(() => {
        const nav = document.querySelector('.bottom-nav');
        if (nav) nav.classList.add('visible');
      }, 100);

      if (this.renderer) {
        this.renderer.dispose();
      }

      if (hasHash) {
        setTimeout(() => {
          const target = document.querySelector(window.location.hash);
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
      return; // Halt entry animation completely
    }

    setTimeout(() => this._runIntro(), 400);
  }

  // ─── Events ────────────────────────────────────────────────────────────────
  _bindEvents() {
    window.addEventListener('resize', () => this._onResize(), { passive: true });
    window.addEventListener('mousemove', (e) => {
      this.targetMouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
      this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }, { passive: true });

    const btn = document.getElementById('enter-btn');
    if (btn) btn.addEventListener('click', () => this._startConvergence());
  }

  _onResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.pixelZ = (window.innerHeight / 2) / Math.tan((50 * Math.PI) / 360);
  }

  // ─── Load hero image, measure DOM rect, build particles ───────────────────
  _loadPhotoAndBuild() {
    const heroImgEl = document.getElementById('heroPortrait');
    const img = new Image();
    img.src = 'Hero.png';
    img.onerror = (e) => console.error('Failed to load Hero.png', e);

    img.onload = () => {
      // ── Crop transparent border ──
      const tempC = document.createElement('canvas');
      const tempX = tempC.getContext('2d');
      tempC.width  = img.width;
      tempC.height = img.height;
      tempX.drawImage(img, 0, 0);
      const raw = tempX.getImageData(0, 0, img.width, img.height).data;

      let minX = img.width, maxX = 0, minY = img.height, maxY = 0;
      for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
          if (raw[(y * img.width + x) * 4 + 3] > 20) {
            if (x < minX) minX = x; if (x > maxX) maxX = x;
            if (y < minY) minY = y; if (y > maxY) maxY = y;
          }
        }
      }
      const cropW = maxX - minX;
      const cropH = maxY - minY;

      // ── Scale to 85vh ──
      let targetH = window.innerHeight * 0.85;
      let scale   = targetH / cropH;
      let drawW   = Math.round(cropW * scale);
      let drawH   = Math.round(cropH * scale);
      if (drawW > window.innerWidth * 0.90) {
        drawW = Math.round(window.innerWidth * 0.90);
        scale = drawW / cropW;
        drawH = Math.round(cropH * scale);
      }

      // ── Render cropped image at display size ──
      const offC = document.createElement('canvas');
      const offX = offC.getContext('2d');
      offC.width   = drawW;
      offC.height  = drawH;
      offX.drawImage(img, minX, minY, cropW, cropH, 0, 0, drawW, drawH);
      const imgData     = offX.getImageData(0, 0, drawW, drawH).data;
      const croppedUrl  = offC.toDataURL('image/png');

      // ── Update the real DOM hero image so it matches particle target ──
      if (heroImgEl) {
        heroImgEl.src = croppedUrl;
        heroImgEl.style.cssText = `width:${drawW}px;height:${drawH}px;object-fit:contain;display:block;`;
      }

      this.heroDims = { w: drawW, h: drawH };

      // ── Build WebGL geometry ──
      // Step heavily reduced to generate drastically MORE particles as requested
      const step = window.innerWidth < 768 ? 4 : 3;

      const positions      = [];
      const targetPositions = [];
      const colors         = [];
      const sizes          = [];

      // Target coords are in WebGL space (origin = screen center, Y up)
      // The hero image is centered (50%) horizontally and bottom-anchored.
      // We must wait until the DOM is laid out to read the rect, but the img
      // may not be visible yet (portfolio-page is opacity:0).
      // Solution: compute target from known drawW/drawH + guess of rendered position.
      // The hero-orbit-center is position:absolute bottom:0 left:50%, so the image
      // bottom edge aligns with the hero section bottom (= 100vh bottom).
      // heroPortrait sits at: centerX = 50vw, bottom = 100vh => top = 100vh - drawH

      const heroLeft   = (window.innerWidth  - drawW) / 2;  // px from left
      const heroTop    = window.innerHeight  - drawH;        // px from top (bottom-anchored)

      // WebGL origin is viewport center, Y flipped
      const wglOriginX = window.innerWidth  / 2;
      const wglOriginY = window.innerHeight / 2;

      for (let y = 0; y < drawH; y += step) {
        for (let x = 0; x < drawW; x += step) {
          const idx = (Math.floor(y) * drawW + Math.floor(x)) * 4;
          const r = imgData[idx]     / 255;
          const g = imgData[idx + 1] / 255;
          const b = imgData[idx + 2] / 255;
          const a = imgData[idx + 3];
          if (a < 20) continue;

          // Target: pixel (heroLeft+x, heroTop+y) → WebGL coords
          const tX =  (heroLeft + x) - wglOriginX;
          const tY = -(heroTop  + y) + wglOriginY;

          // Start: random atmospheric sphere
          const rho   = 1500 + Math.random() * 2000;
          const theta = Math.random() * Math.PI * 2;
          const phi   = Math.acos(Math.random() * 2 - 1);
          const sX = rho * Math.sin(phi) * Math.cos(theta);
          const sY = rho * Math.sin(phi) * Math.sin(theta);
          const sZ = rho * Math.cos(phi);

          positions.push(sX, sY, sZ);
          targetPositions.push(tX, tY, 0);
          colors.push(r, g, b);
          sizes.push(1.0 + Math.random() * 3.0); // Random size from 1.0 to 4.0
        }
      }

      this.geometry = new THREE.BufferGeometry();
      this.geometry.setAttribute('position',       new THREE.Float32BufferAttribute(positions,       3));
      this.geometry.setAttribute('targetPosition', new THREE.Float32BufferAttribute(targetPositions, 3));
      this.geometry.setAttribute('color',          new THREE.Float32BufferAttribute(colors,          3));
      this.geometry.setAttribute('size',           new THREE.Float32BufferAttribute(sizes,           1));

      // ── Custom Shader ──
      this.material = new THREE.ShaderMaterial({
        uniforms: {
          uProgress:  { value: 0.0 },
          uTime:      { value: 0.0 },
          uPointSize: { value: window.innerWidth < 768 ? 4.0 : 2.0 },
          uStepSize:  { value: step + 1.5 }, // Exact gapless size matching algorithm step
          uFlash:     { value: 0.0 },
          uOpacity:   { value: 0.0 },
        },
        vertexShader: `
          attribute vec3 targetPosition;
          attribute vec3 color;
          attribute float size;
          varying vec3 vColor;
          uniform float uProgress;
          uniform float uTime;
          uniform float uPointSize;
          uniform float uStepSize;
          uniform float uFlash;

          void main() {
            vColor = color;
            // Gentle float during idle
            vec3 wobble = vec3(
              sin(position.y * 0.04 + uTime) * 8.0,
              cos(position.x * 0.04 + uTime) * 8.0,
              sin(position.z * 0.04 + uTime) * 8.0
            ) * (1.0 - uProgress);

            vec3 pos = mix(position + wobble, targetPosition, uProgress);
            vec4 mv  = modelViewMatrix * vec4(pos, 1.0);
            gl_Position  = projectionMatrix * mv;
            
            // Particles shrink/expand seamlessly into a fully solid gapless layout
            float finalSize = mix(size, uStepSize, uProgress);
            gl_PointSize = finalSize * (800.0 / -mv.z);
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          uniform float uFlash;
          uniform float uOpacity;

          void main() {
            vec2 xy = gl_PointCoord.xy - 0.5;
            if (length(xy) > 0.5) discard;

            vec3 grey  = vec3(dot(vColor, vec3(0.299, 0.587, 0.114)));
            vec3 vivid = mix(grey, vColor, 1.0 + uFlash * 2.0);
            vivid += uFlash * 0.6;

            gl_FragColor = vec4(clamp(vivid, 0.0, 1.0), uOpacity);
          }
        `,
        transparent: true,
        depthTest: false,
        blending: THREE.NormalBlending,
      });

      this.particles = new THREE.Points(this.geometry, this.material);
      this.scene.add(this.particles);
    };
  }

  // ─── Cinematic intro ───────────────────────────────────────────────────────
  _runIntro() {
    const hiEl    = document.getElementById('cinematic-overlay');
    const textEl  = document.getElementById('cinemaHi');
    const entryEl = this.container;
    const uiEl    = document.getElementById('entry-ui');

    const word = 'Hello';
    let charIdx = 0;
    textEl.textContent = '';
    textEl.style.opacity = '1';

    const typeChar = () => {
      if (charIdx <= word.length) {
        textEl.textContent = word.slice(0, charIdx++);
        setTimeout(typeChar, 120);
      } else {
        setTimeout(() => {
          gsap.to(hiEl, { opacity: 0, duration: 1.0, ease: 'power2.in', onComplete: () => { hiEl.style.display = 'none'; } });
          gsap.to(entryEl,          { backgroundColor: '#f2f2f2', duration: 1.8, ease: 'sine.inOut', delay: 0.3 });
          gsap.to(this.scene.background, { r: 0.949, g: 0.949, b: 0.949, duration: 1.8, ease: 'sine.inOut', delay: 0.3 });

          // Wait for material to exist (image may still be loading)
          const tryFade = () => {
            if (this.material) {
              gsap.to(this.material.uniforms.uOpacity, { value: 1.0, duration: 1.2, ease: 'power2.inOut', delay: 0.8 });
              gsap.to(uiEl, { opacity: 1, duration: 0.8, delay: 1.4, ease: 'power2.out',
                onStart: () => { uiEl.style.pointerEvents = 'auto'; }
              });
            } else {
              setTimeout(tryFade, 200);
            }
          };
          tryFade();
        }, 1400);
      }
    };
    typeChar();
  }

  // ─── ENTER button: converge particles → image ──────────────────────────────
  _startConvergence() {
    if (this.phase !== 'idle' || !this.material) return;
    this.phase = 'converging';

    document.getElementById('enter-btn').style.display = 'none';

    // Flash
    gsap.to(this.material.uniforms.uFlash, {
      value: 1.0, duration: 1.0, delay: 1.8, ease: 'power2.in',
      onUpdate: () => {
        if (this.material.uniforms.uFlash.value > 0.8 && this.material.blending !== THREE.AdditiveBlending) {
          this.material.blending = THREE.AdditiveBlending;
          this.material.needsUpdate = true;
        }
      },
      onComplete: () => {
        gsap.to(this.material.uniforms.uFlash, {
          value: 0.0, duration: 0.4, ease: 'power2.out',
          onUpdate: () => {
            if (this.material.uniforms.uFlash.value < 0.2 && this.material.blending !== THREE.NormalBlending) {
              this.material.blending = THREE.NormalBlending;
              this.material.needsUpdate = true;
            }
          }
        });
      }
    });

    // CSS flash overlay
    setTimeout(() => {
      const fl = document.createElement('div');
      fl.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:white;mix-blend-mode:screen;pointer-events:none;z-index:10;';
      this.container.appendChild(fl);
      gsap.fromTo(fl, { opacity: 0.8 }, { opacity: 0, duration: 0.5, ease: 'power2.out', onComplete: () => fl.remove() });
    }, 2800);

    // Converge particles
    gsap.to(this.material.uniforms.uProgress, {
      value: 1.0, duration: 3.5, ease: 'power3.inOut',
      onComplete: () => this._revealHero()
    });

    // Zoom camera to pixel-perfect distance
    gsap.to(this.camera.position, { z: this.pixelZ, duration: 3.5, ease: 'power3.inOut' });

    // Damp mouse drift
    gsap.to(this.targetMouse, { x: 0, y: 0, duration: 1.0 });
  }

  // ─── Animate loop ─────────────────────────────────────────────────────────
  animate() {
    if (this.phase === 'done') return;
    requestAnimationFrame(this.animate);
    this.time += 0.016;

    if (this.material) {
      this.material.uniforms.uTime.value = this.time;
      this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
      this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;
      const drag = 1.0 - (this.material.uniforms.uProgress.value * 0.95);
      this.scene.rotation.y =  this.mouse.x * drag;
      this.scene.rotation.x = -this.mouse.y * drag;
    }

    this.renderer.render(this.scene, this.camera);
  }

  // ─── KEY: seamless reveal via DOM cross-fade ───────────────────────────────
  _revealHero() {
    this.phase = 'done';

    // 1. Make sure the hero portrait is already at opacity 0 (it is by default)
    //    We will fade it IN simultaneously as we fade the canvas OUT.
    const heroPortrait = document.getElementById('heroPortrait');
    const heroImgWrap  = heroPortrait ? heroPortrait.closest('.hero-image') : null;
    const portfolioPage = document.getElementById('portfolioPage');

    // 2. First: instantly make the portfolio page visible (but hero elements still hidden)
    if (portfolioPage) {
      portfolioPage.style.transition = 'none';
      portfolioPage.style.opacity = '1';
      portfolioPage.style.pointerEvents = 'all';
      portfolioPage.classList.add('visible');
    }

    // 3. Cross-fade: fade out the WebGL canvas, fade in the real DOM hero image
    //    They overlap perfectly because:
    //    - Canvas particle targets computed from DOM image position
    //    - Camera zoomed to pixelZ so 1 WebGL unit = 1 CSS pixel
    //    - Both transitions happen at same time (0.5s)
    if (heroImgWrap) {
      heroImgWrap.style.transition = 'none';
      heroImgWrap.style.opacity = '0';
    }

    // Fade particles out + hero image in simultaneously
    gsap.to(this.material.uniforms.uOpacity, { value: 0, duration: 0.5, ease: 'power1.inOut' });
    if (heroImgWrap) {
      gsap.to(heroImgWrap, { opacity: 1, duration: 0.5, ease: 'power1.inOut' });
    }

    // 4. After hero image visible → fade out particle container entirely, animate hero text
    setTimeout(() => {
      // Fade out and remove particle canvas
      gsap.to(this.container, {
        opacity: 0, duration: 0.4, ease: 'power2.inOut',
        onComplete: () => {
          this.container.style.display = 'none';
          if (this.renderer) this.renderer.dispose();
          if (this.geometry) this.geometry.dispose();
          if (this.material) this.material.dispose();
        }
      });

      // Animate all hero text elements in staggered cascade
      const heroEls = document.querySelectorAll(
        '.hero-massive-overlay, .hero-tagline-small, .hero-right-text, .hero-name, .hero-tagline, .hero-bottom-left, .hero-bottom-right'
      );
      heroEls.forEach((el, i) => {
        setTimeout(() => el.classList.add('hero-animated'), 100 + i * 120);
      });

      // Slide nav in
      setTimeout(() => {
        const nav = document.querySelector('.bottom-nav');
        if (nav) nav.classList.add('visible');
      }, 700);

      // Init skills marquee + hero animations (defined before particle scripts)
      setTimeout(() => {
        if (typeof window._initLogoLoop === 'function') window._initLogoLoop();
        if (typeof animateHeroSection === 'function') animateHeroSection();
      }, 800);
    }, 520);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  sessionStorage.removeItem('portfolioEntryShown');
  if (typeof THREE !== 'undefined') {
    new ParticleSystem3D();
  } else {
    console.error('Three.js not loaded. Check script tag order.');
  }
});

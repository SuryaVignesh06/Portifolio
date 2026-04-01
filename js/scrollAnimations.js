/**
 * scrollAnimations.js
 * Premium GSAP ScrollTrigger animations — NON-DESTRUCTIVE.
 *
 * KEY RULE: Never use gsap.from() or gsap.set() to hide elements.
 * Instead, add a CSS class that starts elements hidden, and let GSAP
 * animate them in. If no class → element stays fully visible (safe).
 *
 * This file ONLY adds visual polish. It never removes or hides content.
 */

(function initScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    setTimeout(initScrollAnimations, 300);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ═══════════════════════════════════════════════════════════
     1. HERO — parallax depth layers on scroll
     The SURYA/VIGNESH overlay text drifts up slower than the page
  ═══════════════════════════════════════════════════════════ */
  const heroSolid = document.querySelector('.hero-massive-overlay.solid');
  const heroOutline = document.querySelector('.hero-massive-overlay.outline');

  if (heroSolid) {
    gsap.to(heroSolid, {
      yPercent: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: '#home',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      }
    });
  }

  if (heroOutline) {
    gsap.to(heroOutline, {
      yPercent: -12,
      ease: 'none',
      scrollTrigger: {
        trigger: '#home',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     2. HERO RIGHT TEXT — fades out as you scroll away from hero
  ═══════════════════════════════════════════════════════════ */
  const heroRight = document.querySelector('.hero-right-text');
  if (heroRight) {
    gsap.to(heroRight, {
      y: -30,
      opacity: 0.2,
      ease: 'none',
      scrollTrigger: {
        trigger: '#home',
        start: '40% top',
        end: 'bottom top',
        scrub: 1.2,
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     3. ABOUT HEADING — slides up with power ease
     Uses ScrollTrigger.onEnter so it only runs ONCE and
     never hides content that's already visible.
  ═══════════════════════════════════════════════════════════ */
  const aboutH2 = document.querySelector('.about-left-content h2');
  if (aboutH2) {
    ScrollTrigger.create({
      trigger: aboutH2,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.fromTo(aboutH2,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.9, ease: 'power4.out' }
        );
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     4. ABOUT SUBTITLE — "Engineer. Designer. Builder."
  ═══════════════════════════════════════════════════════════ */
  const aboutSubtitle = document.querySelector('.about-left-content > p.text-2xl');
  if (aboutSubtitle) {
    ScrollTrigger.create({
      trigger: aboutSubtitle,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.fromTo(aboutSubtitle,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.15 }
        );
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     5. ABOUT REVEAL LINES — staggered word-by-word reveal
  ═══════════════════════════════════════════════════════════ */
  const revealLines = document.querySelectorAll('.about-text-reveal .reveal-line');
  if (revealLines.length) {
    ScrollTrigger.create({
      trigger: '.about-text-reveal',
      start: 'top 80%',
      once: true,
      onEnter: () => {
        revealLines.forEach((line, i) => {
          gsap.fromTo(line,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out', delay: i * 0.1 }
          );
        });
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     6. ABOUT ACTION BUTTONS — Download CV, Copy Email, LinkedIn
     Stagger in from bottom. Never hidden by default.
  ═══════════════════════════════════════════════════════════ */
  const aboutBtnWrap = document.querySelector('.about-left-content .flex.flex-wrap.gap-4');
  if (aboutBtnWrap) {
    const btns = aboutBtnWrap.children;
    ScrollTrigger.create({
      trigger: aboutBtnWrap,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        Array.from(btns).forEach((btn, i) => {
          gsap.fromTo(btn,
            { opacity: 0, y: 25 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: i * 0.1 }
          );
        });
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     7. ABOUT SOCIAL ICONS — slide up with stagger
  ═══════════════════════════════════════════════════════════ */
  const socialWrap = document.querySelector('.about-left-content div[style*="display:flex"][style*="gap:20px"]');
  if (socialWrap) {
    const icons = socialWrap.querySelectorAll('a');
    ScrollTrigger.create({
      trigger: socialWrap,
      start: 'top 92%',
      once: true,
      onEnter: () => {
        icons.forEach((icon, i) => {
          gsap.fromTo(icon,
            { opacity: 0, y: 20, scale: 0.8 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.6)', delay: i * 0.08 }
          );
        });
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     8. SKILLS — title elastic bounce in
  ═══════════════════════════════════════════════════════════ */
  const skillsTitle = document.querySelector('#skills h2');
  if (skillsTitle) {
    ScrollTrigger.create({
      trigger: '#skills',
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.fromTo(skillsTitle,
          { opacity: 0, y: 60, scale: 0.88 },
          { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'elastic.out(1, 0.65)' }
        );
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     9. SKILLS MARQUEE — fade + slide in from left
  ═══════════════════════════════════════════════════════════ */
  const marquee = document.querySelector('.pure-css-marquee');
  if (marquee) {
    ScrollTrigger.create({
      trigger: marquee,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.fromTo(marquee,
          { opacity: 0, x: -50 },
          { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }
        );
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     10. CERTIFICATIONS — heading scale in
  ═══════════════════════════════════════════════════════════ */
  const certH2 = document.querySelector('#certifications h2');
  if (certH2) {
    ScrollTrigger.create({
      trigger: '#certifications',
      start: 'top 75%',
      once: true,
      onEnter: () => {
        gsap.fromTo(certH2,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out' }
        );
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     11. CERTIFICATIONS "View All" BUTTON — pop in
  ═══════════════════════════════════════════════════════════ */
  const certBtn = document.querySelector('#certifications a.skeuo-btn-dark');
  if (certBtn) {
    ScrollTrigger.create({
      trigger: certBtn,
      start: 'top 92%',
      once: true,
      onEnter: () => {
        gsap.fromTo(certBtn,
          { opacity: 0, scale: 0.85, y: 16 },
          { opacity: 1, scale: 1, y: 0, duration: 0.65, ease: 'back.out(1.7)' }
        );
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     12. EXPERIENCE SECTION — heading slides in from left
  ═══════════════════════════════════════════════════════════ */
  const expSection = document.getElementById('experience');
  if (expSection) {
    const expHeading = expSection.querySelector('h2');
    if (expHeading) {
      ScrollTrigger.create({
        trigger: expSection,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.fromTo(expHeading,
            { opacity: 0, x: -60 },
            { opacity: 1, x: 0, duration: 0.9, ease: 'power4.out' }
          );
        }
      });
    }
  }

  /* ═══════════════════════════════════════════════════════════
     13. SECTION ORANGE DIVIDER LINES — draw across section tops
  ═══════════════════════════════════════════════════════════ */
  document.querySelectorAll('section[id]').forEach(sec => {
    // Don't add to hero section
    if (sec.id === 'home') return;

    const line = document.createElement('div');
    Object.assign(line.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '0%',
      height: '2px',
      background: 'linear-gradient(90deg, transparent, rgba(235,122,20,0.45), transparent)',
      zIndex: '5',
      pointerEvents: 'none',
    });

    // Ensure section is positioned
    if (getComputedStyle(sec).position === 'static') {
      sec.style.position = 'relative';
    }
    sec.prepend(line);

    gsap.to(line, {
      width: '100%',
      duration: 1.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: sec,
        start: 'top 90%',
        once: true,
      }
    });
  });

  /* ═══════════════════════════════════════════════════════════
     14. STICKY READING PROGRESS BAR — orange gradient at top
  ═══════════════════════════════════════════════════════════ */
  const progress = document.createElement('div');
  Object.assign(progress.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '0%',
    height: '3px',
    background: 'linear-gradient(90deg, #eb7a14, #ff9a45)',
    zIndex: '999998',
    pointerEvents: 'none',
    boxShadow: '0 0 8px rgba(235,122,20,0.5)',
  });
  document.body.appendChild(progress);

  gsap.to(progress, {
    width: '100%',
    ease: 'none',
    scrollTrigger: {
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
    }
  });

  /* ═══════════════════════════════════════════════════════════
     15. "MORE TO DISCOVER" BUTTON — gentle floating bob
  ═══════════════════════════════════════════════════════════ */
  const discoverBtn = document.getElementById('moreDiscoverBtn');
  if (discoverBtn && discoverBtn.parentElement) {
    gsap.to(discoverBtn.parentElement, {
      y: -6,
      repeat: -1,
      yoyo: true,
      duration: 2.2,
      ease: 'sine.inOut',
      delay: 1.5,
    });
  }

  /* ═══════════════════════════════════════════════════════════
     16. FOOTER — slide up on scroll
  ═══════════════════════════════════════════════════════════ */
  const footer = document.getElementById('footerSection') || document.querySelector('footer');
  if (footer) {
    ScrollTrigger.create({
      trigger: footer,
      start: 'top 95%',
      once: true,
      onEnter: () => {
        gsap.fromTo(footer,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
        );
      }
    });
  }

})();

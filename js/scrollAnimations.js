/**
 * scrollAnimations.js
 * Premium GSAP ScrollTrigger animations for the portfolio.
 * Runs after DOM + GSAP are ready.
 */

(function initScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP / ScrollTrigger not loaded yet — retrying in 300ms');
    setTimeout(initScrollAnimations, 300);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ─────────────────────────────────────────────────────────
     0. SHARED UTILITY
  ───────────────────────────────────────────────────────── */
  // Set initial hidden state only after checking element exists
  function hide(sel, props) {
    const els = document.querySelectorAll(sel);
    if (els.length) gsap.set(els, props);
  }

  /* ─────────────────────────────────────────────────────────
     1. HERO NAME PARALLAX
     The big "SURYA VIGNESH" text scrolls slower than page
  ───────────────────────────────────────────────────────── */
  gsap.to('.hero-massive-overlay.solid', {
    yPercent: -18,
    ease: 'none',
    scrollTrigger: {
      trigger: '#home',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.4,
    }
  });

  gsap.to('.hero-massive-overlay.outline', {
    yPercent: -10,
    ease: 'none',
    scrollTrigger: {
      trigger: '#home',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    }
  });

  /* ─────────────────────────────────────────────────────────
     2. HERO RIGHT TEXT — subtle upward drift on scroll
  ───────────────────────────────────────────────────────── */
  gsap.to('.hero-right-text', {
    y: -40,
    opacity: 0.3,
    ease: 'none',
    scrollTrigger: {
      trigger: '#home',
      start: 'top top',
      end: '60% top',
      scrub: 1.2,
    }
  });

  /* ─────────────────────────────────────────────────────────
     3. ABOUT SECTION — cinematic word-by-word reveal
  ───────────────────────────────────────────────────────── */
  const revealLines = document.querySelectorAll('.about-text-reveal .reveal-line');
  if (revealLines.length) {
    hide('.about-text-reveal .reveal-line', {
      opacity: 0,
      y: 28,
      clipPath: 'inset(0 0 100% 0)',
    });

    gsap.to('.about-text-reveal .reveal-line', {
      opacity: 1,
      y: 0,
      clipPath: 'inset(0 0 0% 0)',
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: '.about-text-reveal',
        start: 'top 75%',
        toggleActions: 'play none none reverse',
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     4. ABOUT LEFT — heading slide-up
  ───────────────────────────────────────────────────────── */
  const aboutH2 = document.querySelector('.about-left-content h2');
  if (aboutH2) {
    gsap.from(aboutH2, {
      opacity: 0,
      y: 60,
      duration: 1,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: aboutH2,
        start: 'top 82%',
        toggleActions: 'play none none reverse',
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     5. ABOUT ACTION BUTTONS — stagger slide-up
  ───────────────────────────────────────────────────────── */
  const aboutBtns = document.querySelectorAll('.about-left-content .flex.flex-wrap.gap-4 > *');
  if (aboutBtns.length) {
    gsap.from(aboutBtns, {
      opacity: 0,
      y: 32,
      duration: 0.65,
      ease: 'power3.out',
      stagger: 0.12,
      scrollTrigger: {
        trigger: aboutBtns[0],
        start: 'top 88%',
        toggleActions: 'play none none reverse',
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     6. SKILLS SECTION heading — big elastic drop
  ───────────────────────────────────────────────────────── */
  const skillsTitle = document.querySelector('#skills h2');
  if (skillsTitle) {
    gsap.from(skillsTitle, {
      opacity: 0,
      y: 80,
      scale: 0.85,
      duration: 1.1,
      ease: 'elastic.out(1, 0.65)',
      scrollTrigger: {
        trigger: '#skills',
        start: 'top 78%',
        toggleActions: 'play none none reverse',
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     7. SKILLS marquee — fade & slide in
  ───────────────────────────────────────────────────────── */
  const marqueeWrap = document.querySelector('.pure-css-marquee');
  if (marqueeWrap) {
    gsap.from(marqueeWrap, {
      opacity: 0,
      x: -60,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: marqueeWrap,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     8. CERTIFICATIONS section label + heading
  ───────────────────────────────────────────────────────── */
  const certTitle = document.querySelector('#certifications h2');
  if (certTitle) {
    gsap.from(certTitle, {
      opacity: 0,
      scale: 0.9,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#certifications',
        start: 'top 72%',
        toggleActions: 'play none none reverse',
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     9. CERTIFICATIONS "View All" button — zoom in
  ───────────────────────────────────────────────────────── */
  const certBtn = document.querySelector('#certifications a.skeuo-btn-dark');
  if (certBtn) {
    gsap.from(certBtn, {
      opacity: 0,
      scale: 0.8,
      y: 20,
      duration: 0.7,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: certBtn,
        start: 'top 90%',
        toggleActions: 'play none none reverse',
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     10. EXPERIENCE SECTION — horizontal divider draws across
  ───────────────────────────────────────────────────────── */
  const expSection = document.getElementById('experience');
  if (expSection) {
    const expHeading = expSection.querySelector('h2');
    if (expHeading) {
      gsap.from(expHeading, {
        opacity: 0,
        x: -80,
        duration: 1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: expSection,
          start: 'top 78%',
          toggleActions: 'play none none reverse',
        }
      });
    }

    // Experience cards stagger in from bottom
    const expCards = expSection.querySelectorAll('[class*="card"], [class*="item"], [class*="entry"], li, .exp-item, .timeline-item, article');
    if (expCards.length) {
      gsap.from(expCards, {
        opacity: 0,
        y: 50,
        duration: 0.75,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: expSection,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        }
      });
    }
  }

  /* ─────────────────────────────────────────────────────────
     11. FLOATING SECTION DIVIDERS — thin lines draw in
     Adds a subtle animated rule above every section heading
  ───────────────────────────────────────────────────────── */
  document.querySelectorAll('section[id]').forEach(sec => {
    const line = document.createElement('div');
    Object.assign(line.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '0%',
      height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(235,122,20,0.5), transparent)',
      zIndex: '5',
      pointerEvents: 'none',
    });
    const pos = getComputedStyle(sec).position;
    if (pos === 'static') sec.style.position = 'relative';
    sec.prepend(line);

    gsap.to(line, {
      width: '100%',
      duration: 1.2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: sec,
        start: 'top 90%',
        toggleActions: 'play none none none',
      }
    });
  });

  /* ─────────────────────────────────────────────────────────
     12. ABOUT SECTION 3D CARD — subtle tilt on scroll
  ───────────────────────────────────────────────────────── */
  const aboutImg = document.querySelector('.about-3d-section');
  if (aboutImg) {
    gsap.to(aboutImg, {
      backgroundPositionY: '30%',
      ease: 'none',
      scrollTrigger: {
        trigger: aboutImg,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     13. STICKY PROGRESS BAR — orange reading indicator at top
  ───────────────────────────────────────────────────────── */
  const progress = document.createElement('div');
  Object.assign(progress.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '0%',
    height: '3px',
    background: 'linear-gradient(90deg, #eb7a14, #ff9a45)',
    zIndex: '999999',
    transformOrigin: 'left',
    pointerEvents: 'none',
    boxShadow: '0 0 10px rgba(235,122,20,0.6)',
  });
  document.body.appendChild(progress);

  gsap.to(progress, {
    width: '100%',
    ease: 'none',
    scrollTrigger: {
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
    }
  });

  /* ─────────────────────────────────────────────────────────
     14. HERO DISCOVER BUTTON — pulse attention animation
  ───────────────────────────────────────────────────────── */
  const discoverBtn = document.getElementById('moreDiscoverBtn');
  if (discoverBtn) {
    gsap.from(discoverBtn.parentElement, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      delay: 0.5,
      ease: 'power3.out',
    });

    // Subtle floating bob
    gsap.to(discoverBtn.parentElement, {
      y: -6,
      repeat: -1,
      yoyo: true,
      duration: 2.2,
      ease: 'sine.inOut',
      delay: 1.2,
    });
  }

  /* ─────────────────────────────────────────────────────────
     15. FOOTER — slide up reveal
  ───────────────────────────────────────────────────────── */
  const footer = document.getElementById('footerSection') || document.querySelector('footer');
  if (footer) {
    gsap.from(footer, {
      opacity: 0,
      y: 60,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: footer,
        start: 'top 92%',
        toggleActions: 'play none none reverse',
      }
    });
  }

})();

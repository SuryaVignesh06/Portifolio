/**
 * pageTransition.js
 * Cinematic black overlay with "Welcome to My World 👀" text
 * that plays when navigating to subpages (projects, certifications).
 */

(function () {
  // ── Create overlay DOM ────────────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.id = 'page-transition-overlay';
  overlay.innerHTML = `
    <div id="pt-content">
      <div id="pt-eyes">👀</div>
      <div id="pt-line1">WELCOME TO</div>
      <div id="pt-line2">MY WORLD</div>
    </div>
  `;
  document.body.appendChild(overlay);

  // ── Inject styles ─────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #page-transition-overlay {
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      opacity: 0;
      transform: scaleY(0);
      transform-origin: bottom center;
      transition: none;
    }

    #page-transition-overlay.pt-enter {
      animation: ptSlideIn 0.55s cubic-bezier(0.76, 0, 0.24, 1) forwards;
    }

    #page-transition-overlay.pt-exit {
      animation: ptSlideOut 0.5s cubic-bezier(0.76, 0, 0.24, 1) forwards;
    }

    @keyframes ptSlideIn {
      0%   { opacity: 1; transform: scaleY(0); transform-origin: bottom center; }
      100% { opacity: 1; transform: scaleY(1); transform-origin: bottom center; }
    }

    @keyframes ptSlideOut {
      0%   { opacity: 1; transform: scaleY(1); transform-origin: top center; }
      100% { opacity: 1; transform: scaleY(0); transform-origin: top center; }
    }

    #pt-content {
      text-align: center;
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.4s ease 0.25s, transform 0.4s ease 0.25s;
    }

    #page-transition-overlay.pt-enter #pt-content {
      opacity: 1;
      transform: translateY(0);
    }

    #pt-eyes {
      font-size: clamp(3rem, 8vw, 6rem);
      margin-bottom: 1rem;
      animation: ptEyeBlink 1.2s ease-in-out infinite;
      display: block;
    }

    @keyframes ptEyeBlink {
      0%, 90%, 100% { opacity: 1; }
      95% { opacity: 0; }
    }

    #pt-line1 {
      font-family: 'Bebas Neue', sans-serif;
      font-size: clamp(1rem, 3vw, 1.5rem);
      letter-spacing: 0.5em;
      color: rgba(255,255,255,0.5);
      text-transform: uppercase;
      margin-bottom: 0.3rem;
    }

    #pt-line2 {
      font-family: 'Bebas Neue', sans-serif;
      font-size: clamp(3.5rem, 10vw, 8rem);
      letter-spacing: 0.08em;
      color: #fff;
      line-height: 0.9;
      text-transform: uppercase;
    }
  `;
  document.head.appendChild(style);

  // ── Hook into subpage links ───────────────────────────────────────────────
  const SUBPAGE_LINKS = ['projects.html', 'certifications.html', 'home.html'];

  function isSubpageLink(href) {
    if (!href) return false;
    return SUBPAGE_LINKS.some(page => href.includes(page));
  }

  function playTransition(destination) {
    overlay.classList.remove('pt-exit');
    overlay.classList.add('pt-enter');
    overlay.style.pointerEvents = 'all';

    // Navigate after the animation completes
    setTimeout(() => {
      window.location.href = destination;
    }, 950);
  }

  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!isSubpageLink(href)) return;

    e.preventDefault();
    playTransition(href);
  }, true); // Use capture phase so we intercept before any other handlers

  // ── On page load: if coming from a subpage, play exit animation ──────────
  // (This handles the "welcome back" feel, already resolved by particleEntry.js,
  //  but we also animate the overlay out when landing on index.html from subpages)
  const navEntries = performance.getEntriesByType('navigation');
  const navType = navEntries.length > 0 ? navEntries[0].type : 'navigate';
  const isFromSubpage = document.referrer && SUBPAGE_LINKS.some(p => document.referrer.includes(p));

  if (navType === 'back_forward' || isFromSubpage) {
    // Briefly flash the overlay and exit — gives a clean "return" feel
    overlay.classList.add('pt-enter');
    overlay.style.pointerEvents = 'none';
    setTimeout(() => {
      overlay.classList.remove('pt-enter');
      overlay.classList.add('pt-exit');
      setTimeout(() => {
        overlay.classList.remove('pt-exit');
        overlay.style.opacity = '0';
      }, 520);
    }, 400);
  }
})();

/**
 * pageTransition.js
 * Circular iris-wipe from click point → Black screen → Typing animation
 * → Navigate to destination page.
 */

(function () {
  // ── Inject styles ─────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #pt-overlay {
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      opacity: 0;
      /* clip-path animated by JS */
    }

    #pt-overlay.active {
      pointer-events: all;
      opacity: 1;
    }

    #pt-text-wrap {
      text-align: center;
      opacity: 0;
      transform: translateY(16px);
      transition: opacity 0.45s ease, transform 0.45s ease;
    }

    #pt-overlay.text-visible #pt-text-wrap {
      opacity: 1;
      transform: translateY(0);
    }

    #pt-sub {
      font-family: 'Bebas Neue', sans-serif;
      font-size: clamp(0.9rem, 2.5vw, 1.2rem);
      letter-spacing: 0.55em;
      color: rgba(255,255,255,0.45);
      text-transform: uppercase;
      margin-bottom: 0.4rem;
      display: block;
    }

    #pt-main {
      font-family: 'Bebas Neue', sans-serif;
      font-size: clamp(3.5rem, 9vw, 7.5rem);
      letter-spacing: 0.06em;
      color: #fff;
      line-height: 0.88;
      text-transform: uppercase;
      white-space: nowrap;
      display: block;
    }

    #pt-cursor {
      display: inline-block;
      width: 3px;
      height: 0.85em;
      background: #eb7a14;
      margin-left: 6px;
      vertical-align: middle;
      animation: ptBlink 0.7s step-end infinite;
    }

    @keyframes ptBlink {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0; }
    }

    #pt-eyes {
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      display: block;
      margin-bottom: 1rem;
      opacity: 0;
      transform: scale(0.7);
      transition: opacity 0.35s ease 0.1s, transform 0.35s cubic-bezier(0.34,1.56,0.64,1) 0.1s;
    }

    #pt-overlay.text-visible #pt-eyes {
      opacity: 1;
      transform: scale(1);
    }
  `;
  document.head.appendChild(style);

  // ── Create overlay DOM ────────────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.id = 'pt-overlay';
  overlay.innerHTML = `
    <div id="pt-text-wrap">
      <span id="pt-eyes">👀</span>
      <span id="pt-sub">Welcome to</span>
      <span id="pt-main"><span id="pt-typed"></span><span id="pt-cursor"></span></span>
    </div>
  `;
  document.body.appendChild(overlay);

  const typedEl  = document.getElementById('pt-typed');
  const cursorEl = document.getElementById('pt-cursor');

  // ── Typing engine ─────────────────────────────────────────────────────────
  const FULL_TEXT = 'MY WORLD';

  function typeText(onDone) {
    let i = 0;
    typedEl.textContent = '';
    const iv = setInterval(() => {
      typedEl.textContent = FULL_TEXT.slice(0, ++i);
      if (i >= FULL_TEXT.length) {
        clearInterval(iv);
        onDone && setTimeout(onDone, 420); // short pause after done
      }
    }, 90); // typing speed per character
  }

  // ── Circular iris wipe ───────────────────────────────────────────────────
  // Uses clip-path: circle() expanding from click origin
  function irisFill(originX, originY, onComplete) {
    // Convert page coords → % relative to viewport
    const pctX = ((originX / window.innerWidth)  * 100).toFixed(1) + '%';
    const pctY = ((originY / window.innerHeight) * 100).toFixed(1) + '%';

    // Final radius must cover the farthest corner
    const maxR = Math.hypot(
      Math.max(originX, window.innerWidth  - originX),
      Math.max(originY, window.innerHeight - originY)
    );
    const finalR = (maxR / Math.min(window.innerWidth, window.innerHeight) * 100 + 10).toFixed(1) + '%';

    overlay.classList.add('active');
    overlay.style.clipPath = `circle(0% at ${pctX} ${pctY})`;

    // Force reflow then animate
    overlay.getBoundingClientRect();

    overlay.style.transition = `clip-path 0.65s cubic-bezier(0.76, 0, 0.24, 1)`;
    overlay.style.clipPath    = `circle(${finalR} at ${pctX} ${pctY})`;

    setTimeout(onComplete, 680);
  }

  // ── Main transition entry ─────────────────────────────────────────────────
  function playTransition(destination, clickX, clickY) {
    typedEl.textContent = '';

    irisFill(clickX, clickY, () => {
      // Show text
      overlay.classList.add('text-visible');

      // Start typing
      typeText(() => {
        // Wait a beat, then navigate
        setTimeout(() => {
          window.location.href = destination;
        }, 350);
      });
    });
  }

  // ── Intercept subpage links ───────────────────────────────────────────────
  const SUBPAGES = ['projects.html', 'certifications.html', 'home.html'];

  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || !SUBPAGES.some(p => href.includes(p))) return;

    e.preventDefault();
    e.stopPropagation();

    const rect = link.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;

    playTransition(href, cx, cy);
  }, true);

  // ── Also intercept programmatic clicks (e.g. startWorksTransition) ──────
  window._playPageTransition = function(destination, x, y) {
    playTransition(
      destination,
      x != null ? x : window.innerWidth  / 2,
      y != null ? y : window.innerHeight / 2
    );
  };

})();

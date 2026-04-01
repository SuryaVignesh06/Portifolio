/**
 * pageTransition.js
 * Circular iris-wipe from click point → Black screen → Bebas Neue
 * dual-line typing animation ("WELCOME TO" then "MY WORLD") → 2s pause → navigate.
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
      opacity: 1;
      clip-path: circle(0% at 50% 50%);
    }

    #pt-overlay.active {
      pointer-events: all;
    }

    #pt-text-wrap {
      text-align: center;
      opacity: 0;
      transform: translateY(22px);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }

    #pt-overlay.text-visible #pt-text-wrap {
      opacity: 1;
      transform: translateY(0);
    }

    /* ── Line 1: "WELCOME TO" ── */
    #pt-line1 {
      font-family: 'Bebas Neue', sans-serif;
      font-size: clamp(1.1rem, 3vw, 1.6rem);
      letter-spacing: 0.55em;
      color: rgba(255,255,255,0.45);
      text-transform: uppercase;
      display: block;
      margin-bottom: 0.25rem;
      min-height: 1.8em;
    }

    /* ── Line 2: "MY WORLD" ── */
    #pt-line2 {
      font-family: 'Bebas Neue', sans-serif;
      font-size: clamp(4rem, 12vw, 10rem);
      letter-spacing: 0.07em;
      color: #fff;
      line-height: 0.88;
      text-transform: uppercase;
      display: block;
      min-height: 1em;
    }

    /* ── Blinking cursor ── */
    .pt-caret {
      display: inline-block;
      width: 3px;
      height: 0.82em;
      background: #eb7a14;
      margin-left: 5px;
      vertical-align: middle;
      border-radius: 1px;
      animation: ptCaret 0.65s step-end infinite;
    }

    @keyframes ptCaret {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0; }
    }

    /* ── Eyes ── */
    #pt-eyes {
      font-size: clamp(2rem, 5vw, 3.8rem);
      display: block;
      margin-bottom: 1.1rem;
      opacity: 0;
      transform: scale(0.6) translateY(8px);
      transition: opacity 0.4s ease 0.05s,
                  transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s;
      user-select: none;
    }

    #pt-overlay.text-visible #pt-eyes {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  `;
  document.head.appendChild(style);

  // ── Create overlay DOM ────────────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.id = 'pt-overlay';
  overlay.innerHTML = `
    <div id="pt-text-wrap">
      <span id="pt-eyes">👀</span>
      <span id="pt-line1"><span id="pt-typed1"></span><span class="pt-caret" id="pt-caret1"></span></span>
      <span id="pt-line2"><span id="pt-typed2"></span><span class="pt-caret" id="pt-caret2" style="display:none;"></span></span>
    </div>
  `;
  document.body.appendChild(overlay);

  const typed1  = document.getElementById('pt-typed1');
  const typed2  = document.getElementById('pt-typed2');
  const caret1  = document.getElementById('pt-caret1');
  const caret2  = document.getElementById('pt-caret2');

  // ── Typing engine ─────────────────────────────────────────────────────────
  function typeString(el, text, speed, onDone) {
    let i = 0;
    el.textContent = '';
    const iv = setInterval(() => {
      el.textContent = text.slice(0, ++i);
      if (i >= text.length) {
        clearInterval(iv);
        if (onDone) setTimeout(onDone, 180);
      }
    }, speed);
  }

  // ── Iris fill ─────────────────────────────────────────────────────────────
  function irisFill(ox, oy, onComplete) {
    const pctX = ((ox / window.innerWidth)  * 100).toFixed(2) + '%';
    const pctY = ((oy / window.innerHeight) * 100).toFixed(2) + '%';

    const maxR = Math.hypot(
      Math.max(ox, window.innerWidth  - ox),
      Math.max(oy, window.innerHeight - oy)
    );
    const finalR = ((maxR / Math.min(window.innerWidth, window.innerHeight)) * 110).toFixed(2) + '%';

    overlay.classList.add('active');
    overlay.style.clipPath = `circle(0% at ${pctX} ${pctY})`;
    overlay.getBoundingClientRect(); // force reflow

    overlay.style.transition = `clip-path 0.7s cubic-bezier(0.76, 0, 0.24, 1)`;
    overlay.style.clipPath    = `circle(${finalR} at ${pctX} ${pctY})`;

    setTimeout(onComplete, 730);
  }

  // ── Main transition ───────────────────────────────────────────────────────
  function playTransition(destination, cx, cy) {
    // Reset
    typed1.textContent = '';
    typed2.textContent = '';
    caret1.style.display = 'inline-block';
    caret2.style.display = 'none';

    irisFill(cx, cy, () => {
      // Reveal text container
      overlay.classList.add('text-visible');

      // Step 1: type "WELCOME TO" on line 1
      typeString(typed1, 'WELCOME TO', 75, () => {
        // Move caret to line 2
        caret1.style.display = 'none';
        caret2.style.display = 'inline-block';

        // Step 2: type "MY WORLD" on line 2
        typeString(typed2, 'MY WORLD', 95, () => {
          // Step 3: hold for 2.2s, then navigate
          setTimeout(() => {
            window.location.href = destination;
          }, 2200);
        });
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
    playTransition(href, rect.left + rect.width / 2, rect.top + rect.height / 2);
  }, true);

  // ── Global API for programmatic navigation ────────────────────────────────
  window._playPageTransition = function (destination, x, y) {
    playTransition(
      destination,
      x != null ? x : window.innerWidth  / 2,
      y != null ? y : window.innerHeight / 2
    );
  };

})();

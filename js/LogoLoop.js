/**
 * Premium Logo Marquee Component (Vanilla JS Version)
 * Smooth kinetic scrolling with Lerped velocity and ResizeObserver support.
 * Logic adapted from the premium React component.
 */
class LogoLoop {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;

    this.options = {
      logos: [],
      speed: 120,
      direction: 'left', // 'left', 'right', 'up', 'down'
      logoHeight: 28,
      gap: 32,
      pauseOnHover: true,
      hoverSpeed: undefined,
      fadeOut: false,
      fadeOutColor: null,
      scaleOnHover: false,
      renderItem: null,
      ariaLabel: 'Partner logos',
      ...options
    };

    /**
     * Animation Configuration
     * SMOOTH_TAU: Factor for velocity easing (higher = more inertia)
     * COPY_HEADROOM: Extra copies to prevent gaps on high-res displays
     */
    this.config = {
      SMOOTH_TAU: 0.25,
      MIN_COPIES: 2,
      COPY_HEADROOM: 2
    };

    this.state = {
      seqWidth: 0,
      seqHeight: 0,
      copyCount: this.config.MIN_COPIES,
      isHovered: false,
      offset: 0,
      velocity: 0,
      lastTimestamp: null,
      rafId: null
    };

    this.lists = [];
    this.init();
  }

  init() {
    this.setupDOM();
    this.setupStyles();
    this.setupEvents();
    
    // Initial measurement
    this.updateDimensions();
    
    // Resize Observer for robust responsiveness
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.updateDimensions());
      this.resizeObserver.observe(this.container);
      if (this.seqElement) this.resizeObserver.observe(this.seqElement);
    } else {
      window.addEventListener('resize', () => this.updateDimensions());
    }

    // Image Loader: refresh dimensions once logos are actually loaded
    this.waitForImages();

    // === Visibility gate: pause rAF when fully off-screen ===
    this.state.isVisible = true;
    if (window.IntersectionObserver) {
      const visObs = new IntersectionObserver(
        (entries) => {
          this.state.isVisible = entries[0].isIntersecting;
          // Re-kick the loop if we just became visible and it stalled
          if (this.state.isVisible && !this.state.rafId) {
            this.state.lastTimestamp = null;
            this.state.rafId = requestAnimationFrame((ts) => this.animate(ts));
          }
        },
        { rootMargin: '100px' } // small headroom so it warms up just before entering view
      );
      visObs.observe(this.container);
    }

    // Start high-performance animation loop
    this.state.rafId = requestAnimationFrame((ts) => this.animate(ts));
  }

  setupDOM() {
    this.container.innerHTML = '';
    this.container.classList.add('logoloop');
    
    const isVertical = this.isVertical();
    this.container.classList.add(isVertical ? 'logoloop--vertical' : 'logoloop--horizontal');

    if (this.options.fadeOut) this.container.classList.add('logoloop--fade');
    if (this.options.scaleOnHover) this.container.classList.add('logoloop--scale-hover');
    this.container.setAttribute('role', 'region');
    this.container.setAttribute('aria-label', this.options.ariaLabel);

    this.track = document.createElement('div');
    this.track.className = 'logoloop__track';
    this.container.appendChild(this.track);
    
    this.renderLists();
  }

  setupStyles() {
    this.container.style.setProperty('--logoloop-gap', `${this.options.gap}px`);
    this.container.style.setProperty('--logoloop-logoHeight', `${this.options.logoHeight}px`);
    if (this.options.fadeOutColor) {
      this.container.style.setProperty('--logoloop-fadeColor', this.options.fadeOutColor);
    }
    // Limit repaint scope: browser knows nothing outside overflows
    this.container.style.contain = 'layout style';
  }

  renderLogoItem(item) {
    if (this.options.renderItem) {
      const li = document.createElement('li');
      li.className = 'logoloop__item';
      li.appendChild(this.options.renderItem(item));
      return li;
    }

    const li = document.createElement('li');
    li.className = 'logoloop__item';
    li.setAttribute('role', 'listitem');

    let content;
    if (item.node) {
      const span = document.createElement('span');
      span.className = 'logoloop__node';
      // If node is an SVG string or element
      if (typeof item.node === 'string') {
        span.innerHTML = item.node;
      } else if (item.node instanceof HTMLElement || item.node instanceof SVGElement) {
        span.appendChild(item.node);
      } else {
        span.textContent = item.title || '';
      }
      content = span;
    } else {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt || '';
      img.title = item.title || '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.draggable = false;
      content = img;
    }

    if (item.href) {
      const a = document.createElement('a');
      a.className = 'logoloop__link';
      a.href = item.href;
      a.target = '_blank';
      a.rel = 'noreferrer noopener';
      a.appendChild(content);
      li.appendChild(a);
    } else {
      li.appendChild(content);
    }

    return li;
  }

  renderLists() {
    this.track.innerHTML = '';
    this.lists = [];
    
    // Primary list for measurement
    const list = document.createElement('ul');
    list.className = 'logoloop__list';
    list.setAttribute('role', 'list');
    this.options.logos.forEach(logo => {
      list.appendChild(this.renderLogoItem(logo));
    });
    
    this.track.appendChild(list);
    this.seqElement = list;
    this.lists.push(list);
  }

  setupEvents() {
    this.track.addEventListener('mouseenter', () => {
      this.state.isHovered = true;
    });
    this.track.addEventListener('mouseleave', () => {
      this.state.isHovered = false;
    });
  }

  isVertical() {
    return this.options.direction === 'up' || this.options.direction === 'down';
  }

  getTargetVelocity() {
    const magnitude = Math.abs(this.options.speed);
    const isVertical = this.isVertical();
    let directionMultiplier;
    
    if (isVertical) {
      directionMultiplier = this.options.direction === 'up' ? 1 : -1;
    } else {
      directionMultiplier = this.options.direction === 'left' ? 1 : -1;
    }
    
    const speedMultiplier = this.options.speed < 0 ? -1 : 1;
    return magnitude * directionMultiplier * speedMultiplier;
  }

  updateDimensions() {
    const containerWidth = this.container.clientWidth;
    const containerHeight = this.container.clientHeight;
    
    const seqRect = this.seqElement.getBoundingClientRect();
    const sequenceWidth = seqRect.width;
    const sequenceHeight = seqRect.height;
    
    if (sequenceWidth === 0 && sequenceHeight === 0) return;

    let newCopyCount = this.config.MIN_COPIES;

    if (this.isVertical()) {
      // Sub-pixel precision: raw float, no rounding
      // Add gap so the measured boundary includes the space AFTER the last item
      this.state.seqHeight = sequenceHeight + this.options.gap;
      const viewport = containerHeight > 0 ? containerHeight : (this.container.parentElement?.clientHeight || 0);
      if (sequenceHeight > 0) {
        const copiesNeeded = Math.ceil(viewport / sequenceHeight) + this.config.COPY_HEADROOM;
        newCopyCount = Math.max(this.config.MIN_COPIES, copiesNeeded);
      }
    } else {
      // Sub-pixel precision: raw float, no rounding
      // Add gap so the loop point is flush with the gap between the last and first icon
      this.state.seqWidth = sequenceWidth + this.options.gap;
      if (sequenceWidth > 0) {
        const copiesNeeded = Math.ceil(containerWidth / sequenceWidth) + this.config.COPY_HEADROOM;
        newCopyCount = Math.max(this.config.MIN_COPIES, copiesNeeded);
      }
    }

    if (newCopyCount !== this.state.copyCount) {
      this.updateCopyCount(newCopyCount);
    }
  }

  updateCopyCount(count) {
    this.state.copyCount = count;
    while (this.lists.length < count) {
      const clone = this.seqElement.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      this.track.appendChild(clone);
      this.lists.push(clone);
    }
    while (this.lists.length > count) {
      const list = this.lists.pop();
      list.remove();
    }
  }

  waitForImages() {
    const images = this.container.querySelectorAll('img');
    if (images.length === 0) return;
    
    let pending = images.length;
    const onLoad = () => {
      pending--;
      if (pending === 0) this.updateDimensions();
    };

    images.forEach(img => {
      if (img.complete) onLoad();
      else {
        img.addEventListener('load', onLoad, { once: true });
        img.addEventListener('error', onLoad, { once: true });
      }
    });
  }

  animate(timestamp) {
    // === Visibility gate: drop frames when off-screen ===
    if (!this.state.isVisible) {
      this.state.rafId = null; // Let it go idle
      return;
    }

    if (this.state.lastTimestamp === null) {
      this.state.lastTimestamp = timestamp;
    }

    // Cap deltaTime to 100ms to prevent huge jumps after tab switches
    const deltaTime = Math.min(Math.max(0, timestamp - this.state.lastTimestamp) / 1000, 0.1);
    this.state.lastTimestamp = timestamp;

    const effectiveHoverSpeed = this.options.hoverSpeed !== undefined 
      ? this.options.hoverSpeed 
      : (this.options.pauseOnHover ? 0 : undefined);

    const target = (this.state.isHovered && effectiveHoverSpeed !== undefined) 
      ? effectiveHoverSpeed 
      : this.getTargetVelocity();

    // Lerp velocity smoothing — exponential decay for frame-rate independence
    const easingFactor = 1 - Math.exp(-deltaTime / this.config.SMOOTH_TAU);
    this.state.velocity += (target - this.state.velocity) * easingFactor;

    const seqSize = this.isVertical() ? this.state.seqHeight : this.state.seqWidth;

    if (seqSize > 0) {
      let nextOffset = this.state.offset + this.state.velocity * deltaTime;
      // Sub-pixel modulo: uses raw float seqSize for gapless loop
      nextOffset = ((nextOffset % seqSize) + seqSize) % seqSize;
      this.state.offset = nextOffset;

      const transformValue = this.isVertical()
        ? `translate3d(0, ${-this.state.offset}px, 0)`
        : `translate3d(${-this.state.offset}px, 0, 0)`;
      
      this.track.style.transform = transformValue;
    }

    this.state.rafId = requestAnimationFrame((ts) => this.animate(ts));
  }

  destroy() {
    if (this.state.rafId) cancelAnimationFrame(this.state.rafId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }
}

// Export for usage if using modules, otherwise it stays global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LogoLoop;
}

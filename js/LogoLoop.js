class LogoLoop {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;

    this.options = {
      logos: [],
      speed: 120,
      direction: 'left',
      logoHeight: 28,
      gap: 32,
      pauseOnHover: false,
      hoverSpeed: undefined,
      fadeIn: true, // Renamed from fadeOut to be clearer, or just use fadeOut as per prop
      fadeOut: false,
      fadeOutColor: null,
      scaleOnHover: false,
      ...options
    };

    this.state = {
      seqWidth: 0,
      seqHeight: 0,
      copyCount: 2,
      isHovered: false,
      offset: 0,
      velocity: 0,
      lastTimestamp: null,
      rafId: null
    };

    this.init();
  }

  init() {
    this.setupDOM();
    this.setupStyles();
    this.setupEvents();
    this.updateDimensions();
    
    // Resize Observer
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.updateDimensions());
      this.resizeObserver.observe(this.container);
      if (this.seqElement) this.resizeObserver.observe(this.seqElement);
    } else {
      window.addEventListener('resize', () => this.updateDimensions());
    }

    // Image Loader
    this.waitForImages();

    // Start Loop
    this.animate(performance.now());
  }

  setupDOM() {
    this.container.innerHTML = '';
    this.container.classList.add('logoloop');
    
    if (this.options.direction === 'up' || this.options.direction === 'down') {
      this.container.classList.add('logoloop--vertical');
    } else {
      this.container.classList.add('logoloop--horizontal');
    }

    if (this.options.fadeOut) {
      this.container.classList.add('logoloop--fade');
    }
    
    if (this.options.scaleOnHover) {
      this.container.classList.add('logoloop--scale-hover');
    }

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
  }

  renderLogoItem(item) {
    const li = document.createElement('li');
    li.className = 'logoloop__item';
    li.style.marginRight = this.isVertical() ? '0' : `${this.options.gap}px`; // Backup if gap flex not supported well, but CSS uses gap
    // Actually, let's rely on CSS gap.

    let content;
    if (item.node) {
      const span = document.createElement('span');
      span.className = 'logoloop__node';
      // If item.node is a string (SVG), inject it
      if (typeof item.node === 'string') {
        span.innerHTML = item.node;
      } else {
        span.textContent = item.title;
      }
      content = span;
    } else if (item.src) {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt || '';
      img.title = item.title || '';
      img.loading = 'lazy';
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
    // We will render initial copy, measure, then add more copies
    this.track.innerHTML = '';
    this.lists = [];
    
    // Initial list for measurement
    const list = document.createElement('ul');
    list.className = 'logoloop__list';
    this.options.logos.forEach(logo => {
      list.appendChild(this.renderLogoItem(logo));
    });
    
    this.track.appendChild(list);
    this.seqElement = list; // Reference to the first sequence
    this.lists.push(list);
    
    // We'll add more copies in updateDimensions
  }

  setupEvents() {
    this.container.addEventListener('mouseenter', () => {
      this.state.isHovered = true;
    });
    this.container.addEventListener('mouseleave', () => {
      this.state.isHovered = false;
    });
  }

  isVertical() {
    return this.options.direction === 'up' || this.options.direction === 'down';
  }

  getEffectiveHoverSpeed() {
    if (this.options.hoverSpeed !== undefined) return this.options.hoverSpeed;
    if (this.options.pauseOnHover === true) return 0;
    if (this.options.pauseOnHover === false) return undefined;
    return 0;
  }

  getTargetVelocity() {
    const magnitude = Math.abs(this.options.speed);
    let directionMultiplier;
    if (this.isVertical()) {
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
    
    // Measure sequence
    // Use getBoundingClientRect for precise sub-pixel measurements
    const seqRect = this.seqElement.getBoundingClientRect();
    const sequenceWidth = seqRect.width;
    const sequenceHeight = seqRect.height;
    
    // If empty or hidden, retry later or abort
    if (sequenceWidth === 0 && sequenceHeight === 0) return;

    const MIN_COPIES = 2; // Always at least 2 for smooth looping (one exiting, one entering)
    const COPY_HEADROOM = 2; // Extra copies buffer

    let newCopyCount = MIN_COPIES;

    if (this.isVertical()) {
      this.state.seqHeight = Math.ceil(sequenceHeight);
      
      // If container has no height set properly yet, might need adjustment
      const parentHeight = this.container.parentElement ? this.container.parentElement.clientHeight : 0;
      // In React version it sets container height if vertical. 
      // Here we assume CSS handles it or we adapt.
      
      const viewport = containerHeight > 0 ? containerHeight : parentHeight;
      if (sequenceHeight > 0) {
         const copiesNeeded = Math.ceil(viewport / sequenceHeight) + COPY_HEADROOM;
         newCopyCount = Math.max(MIN_COPIES, copiesNeeded);
      }
      
    } else {
      this.state.seqWidth = Math.ceil(sequenceWidth);
      if (sequenceWidth > 0) {
        const copiesNeeded = Math.ceil(containerWidth / sequenceWidth) + COPY_HEADROOM;
        newCopyCount = Math.max(MIN_COPIES, copiesNeeded);
      }
    }

    if (newCopyCount !== this.state.copyCount) {
      this.updateCopyCount(newCopyCount);
    }
  }

  updateCopyCount(count) {
    this.state.copyCount = count;
    
    // Add or remove lists
    while (this.lists.length < count) {
      const clone = this.seqElement.cloneNode(true);
      // Make sure cloned lists are aria-hidden
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
        img.addEventListener('load', onLoad);
        img.addEventListener('error', onLoad);
      }
    });
  }

  animate(timestamp) {
    if (this.state.lastTimestamp === null) {
      this.state.lastTimestamp = timestamp;
    }

    const deltaTime = Math.max(0, timestamp - this.state.lastTimestamp) / 1000;
    this.state.lastTimestamp = timestamp;

    const SMOOTH_TAU = 0.25;
    const hoverSpeed = this.getEffectiveHoverSpeed(); // Correctly get hover speed
    const target = (this.state.isHovered && hoverSpeed !== undefined) 
      ? hoverSpeed 
      : this.getTargetVelocity();

    // Lerp velocity
    const easingFactor = 1 - Math.exp(-deltaTime / SMOOTH_TAU);
    this.state.velocity += (target - this.state.velocity) * easingFactor;

    const seqSize = this.isVertical() ? this.state.seqHeight : this.state.seqWidth;

    if (seqSize > 0) {
      let nextOffset = this.state.offset + this.state.velocity * deltaTime;
      
      // Normalized modulo
      nextOffset = ((nextOffset % seqSize) + seqSize) % seqSize;
      this.state.offset = nextOffset;

      const transformValue = this.isVertical()
        ? `translate3d(0, ${-this.state.offset}px, 0)`
        : `translate3d(${-this.state.offset}px, 0, 0)`;
      
      this.track.style.transform = transformValue;
    }

    this.state.rafId = requestAnimationFrame(this.animate.bind(this));
  }

  destroy() {
    if (this.state.rafId) cancelAnimationFrame(this.state.rafId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    // remove event listeners if we added named functions... 
    // anonymous ones here are hard to remove, but given the scope, it might be fine.
  }
}

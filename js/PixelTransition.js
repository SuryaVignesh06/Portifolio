class PixelTransition {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        if (!this.container) return;

        this.options = {
            gridSize: 7, // increased from 7 for better resolution on larger cards if needed
            pixelColor: 'currentColor',
            animationStepDuration: 0.3,
            once: false,
            aspectRatio: '100%',
            ...options
        };

        this.pixelGridEl = this.container.querySelector('.pixelated-image-card__pixels');
        this.activeEl = this.container.querySelector('.pixelated-image-card__active');
        this.defaultEl = this.container.querySelector('.pixelated-image-card__default');

        this.isActive = false;
        this.delayedCall = null;
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;

        this.init();
    }

    init() {
        this.setupGrid();
        this.setupEvents();
    }

    setupGrid() {
        if (!this.pixelGridEl) return;

        this.pixelGridEl.innerHTML = '';
        const { gridSize, pixelColor } = this.options;

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const pixel = document.createElement('div');
                pixel.classList.add('pixelated-image-card__pixel');
                pixel.style.backgroundColor = pixelColor;

                const size = 100 / gridSize;
                pixel.style.width = `${size}%`;
                // Use +0.1% to prevent sub-pixel gaps
                pixel.style.height = `${size + 0.1}%`;
                pixel.style.left = `${col * size}%`;
                pixel.style.top = `${row * size}%`;

                this.pixelGridEl.appendChild(pixel);
            }
        }
    }

    setupEvents() {
        const handleEnter = () => {
            if (!this.isActive) this.animatePixels(true);
        };

        const handleLeave = () => {
            if (this.isActive && !this.options.once) this.animatePixels(false);
        };

        const handleClick = () => {
            if (!this.isActive) this.animatePixels(true);
            else if (this.isActive && !this.options.once) this.animatePixels(false);
        };

        if (!this.isTouchDevice) {
            this.container.addEventListener('mouseenter', handleEnter);
            this.container.addEventListener('mouseleave', handleLeave);
            this.container.addEventListener('focus', handleEnter);
            this.container.addEventListener('blur', handleLeave);
        } else {
            this.container.addEventListener('click', handleClick);
        }
    }

    animatePixels(activate) {
        this.isActive = activate;

        if (!this.pixelGridEl || !this.activeEl) return;

        const pixels = this.pixelGridEl.querySelectorAll('.pixelated-image-card__pixel');
        if (!pixels.length) return;

        gsap.killTweensOf(pixels);
        if (this.delayedCall) {
            this.delayedCall.kill();
        }

        // Ensure pixels are hidden before starting
        gsap.set(pixels, { display: 'none' });

        const totalPixels = pixels.length;
        const { animationStepDuration } = this.options;
        const staggerDuration = animationStepDuration / totalPixels;

        // 1. Appear pixels randomly
        gsap.to(pixels, {
            display: 'block',
            duration: 0,
            stagger: {
                each: staggerDuration,
                from: 'random'
            }
        });

        // 2. toggle content visibility halfway (or slightly adjusted)
        this.delayedCall = gsap.delayedCall(animationStepDuration, () => {
            if (activate) {
                this.activeEl.style.display = 'flex'; // Use flex to center content
                this.activeEl.style.zIndex = '3';
                // this.defaultEl.style.display = 'none'; // Optional: keep default under to avoid flicker
            } else {
                this.activeEl.style.display = 'none';
                this.activeEl.style.zIndex = '1';
                // this.defaultEl.style.display = 'block';
            }
            this.activeEl.setAttribute('aria-hidden', !activate);
            this.defaultEl.setAttribute('aria-hidden', activate);
        });

        // 3. Disappear pixels randomly after they have all appeared
        gsap.to(pixels, {
            display: 'none',
            duration: 0,
            delay: animationStepDuration,
            stagger: {
                each: staggerDuration,
                from: 'random'
            }
        });
    }
}

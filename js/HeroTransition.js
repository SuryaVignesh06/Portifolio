/**
 * HeroTransition.js
 * Handles the particle scattering effect from the Hero Image to the About Section.
 */
class HeroTransition {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.particles = [];
        this.heroImg = document.getElementById('heroPortrait');
        this.targetLabel = document.querySelector('.about-section-label');
        this.isActive = false;
        this.isHoming = false;
        this.phase = 'idle'; // idle, scatter, homing
        
        this.maxParticles = window.innerWidth > 768 ? 4000 : 1500;
        this.sampleStep = 4;
        
        this.setupCanvas();
        this.init();
    }

    setupCanvas() {
        this.canvas.id = 'transition-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100vw';
        this.canvas.style.height = '100vh';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9998';
        this.canvas.style.opacity = '0';
        document.body.appendChild(this.canvas);
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    async init() {
        if (!this.heroImg) return;
        
        // Ensure image is loaded
        if (!this.heroImg.complete) {
            await new Promise(resolve => this.heroImg.onload = resolve);
        }
        
        this.sampleParticles();
        this.setupTriggers();
        this.animate();
    }

    sampleParticles() {
        const rect = this.heroImg.getBoundingClientRect();
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCanvas.width = rect.width;
        tempCanvas.height = rect.height;
        tempCtx.drawImage(this.heroImg, 0, 0, rect.width, rect.height);
        
        const imageData = tempCtx.getImageData(0, 0, rect.width, rect.height).data;
        const sampled = [];

        for (let y = 0; y < rect.height; y += this.sampleStep) {
            for (let x = 0; x < rect.width; x += this.sampleStep) {
                const index = (y * rect.width + x) * 4;
                const a = imageData[index + 3];
                
                if (a > 128) {
                    sampled.push({
                        origX: rect.left + x,
                        origY: rect.top + y,
                        x: rect.left + x,
                        y: rect.top + y,
                        vx: 0,
                        vy: 0,
                        r: imageData[index],
                        g: imageData[index + 1],
                        b: imageData[index + 2],
                        a: a / 255
                    });
                }
            }
        }

        // Shuffle and cap particles
        sampled.sort(() => Math.random() - 0.5);
        this.particles = sampled.slice(0, this.maxParticles);
    }

    setupTriggers() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.startTransition();
                } else if (entry.boundingClientRect.top > 0) {
                    this.reverseTransition();
                }
            });
        }, { threshold: 0.15 });

        const about = document.getElementById('about');
        if (about) observer.observe(about);
    }

    startTransition() {
        if (this.phase === 'homing') return;
        this.phase = 'scatter';
        this.canvas.style.opacity = '1';
        gsap.to(this.heroImg, { opacity: 0, duration: 0.3 });
        
        // Explosion/Scatter
        this.particles.forEach(p => {
            p.vx = (Math.random() - 0.5) * 15;
            p.vy = (Math.random() - 0.5) * 10 + 5; // Tendency to go down
        });

        setTimeout(() => {
            this.phase = 'homing';
            gsap.to(this.targetLabel, { opacity: 1, duration: 0.5, delay: 0.3 });
        }, 400);
    }

    reverseTransition() {
        this.phase = 'returning';
        gsap.to(this.targetLabel, { opacity: 0, duration: 0.3 });
        
        setTimeout(() => {
            if (this.phase !== 'returning') return;
            this.canvas.style.opacity = '0';
            gsap.to(this.heroImg, { opacity: 1, duration: 0.3 });
            this.phase = 'idle';
            // Reset particles
            this.particles.forEach(p => {
                p.x = p.origX;
                p.y = p.origY;
                p.vx = 0;
                p.vy = 0;
            });
        }, 600);
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const targetRect = this.targetLabel ? this.targetLabel.getBoundingClientRect() : null;
        const targetX = targetRect ? targetRect.left + targetRect.width / 2 : this.canvas.width / 2;
        const targetY = targetRect ? targetRect.top + targetRect.height / 2 : this.canvas.height / 2;

        this.particles.forEach(p => {
            if (this.phase === 'scatter') {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.2; // Gravity
                p.vx *= 0.98;
                p.vy *= 0.98;
            } else if (this.phase === 'homing') {
                p.vx += (targetX - p.x) * 0.06;
                p.vy += (targetY - p.y) * 0.06;
                p.vx *= 0.88;
                p.vy *= 0.88;
                p.x += p.vx;
                p.y += p.vy;
            } else if (this.phase === 'returning') {
                p.vx += (p.origX - p.x) * 0.1;
                p.vy += (p.origY - p.y) * 0.1;
                p.vx *= 0.85;
                p.vy *= 0.85;
                p.x += p.vx;
                p.y += p.vy;
            }

            this.ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.a})`;
            this.ctx.fillRect(p.x, p.y, 2, 2);
        });

        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // HeroTransition disabled — canvas particle scatter on scroll removed for cleaner look
    // window.heroTransition = new HeroTransition();
});

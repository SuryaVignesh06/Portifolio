/**
 * TextParticles.js
 * Creates an interactive particle system over the massive "SURYA VIGNESH" hero text.
 * Particles disperse on mouse hover and spring back to their original positions.
 */

class TextParticles {
    constructor() {
        this.container = document.querySelector('.hero');
        this.solidOverlay = document.querySelector('.hero-massive-overlay.solid');
        if (!this.container || !this.solidOverlay) return;

        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.particles = [];
        
        // Mouse state
        this.mouse = {
            x: -9999,
            y: -9999,
            radius: 180 // Increased interaction radius for more interactivity
        };
        
        this.animate = this.animate.bind(this);

        this.setupCanvas();
        this.init();
    }

    setupCanvas() {
        this.canvas.id = 'text-particle-canvas';
        this.canvas.style.position = 'absolute';
        
        // Match the sizing of the .hero-massive-overlay exactly
        // The solid overlay has top: 3vh
        this.canvas.style.top = '3vh';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        
        // Z-index 0 to sit perfectly behind the hero image (which is z-index 1 or 5)
        // so particles don't cover the face!
        this.canvas.style.zIndex = '0';
        this.canvas.style.pointerEvents = 'none'; // Let mouse events pass through
        
        this.container.appendChild(this.canvas);
        
        this.resize();
        window.addEventListener('resize', () => {
            this.resize();
            this.sampleText(); // Re-sample if screen size changes
        });

        // Track mouse inside the hero container
        document.addEventListener('mousemove', (e) => {
            // Need mouse coordinates relative to the canvas
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        // Move mouse out of frame when leaving window
        document.addEventListener('mouseleave', () => {
            this.mouse.x = -9999;
            this.mouse.y = -9999;
        });
    }

    resize() {
        const rect = this.solidOverlay.getBoundingClientRect();
        this.canvas.width = rect.width;
        // The solid overlay wraps the text nicely, so we use its height
        this.canvas.height = rect.height; 
    }

    init() {
        // Wait for fonts to load before sampling
        document.fonts.ready.then(() => {
            // Slight delay to ensure DOM is fully rendered
            setTimeout(() => {
                this.sampleText();
                this.animate();
            }, 500);
        });
    }

    sampleText() {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;

        // Replicate the exact font styling of h2.name-surya and h2.name-vignesh
        tempCtx.fillStyle = '#000000';
        tempCtx.textBaseline = 'top';

        // Wait to get accurate vw sizes
        const vw = window.innerWidth / 100;
        
        // SURYA settings
        const suryaFontSize = 22 * vw; // 22vw from CSS
        tempCtx.font = `${suryaFontSize}px Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif`;
        tempCtx.textAlign = 'left';
        
        // Calculate Y positions roughly. Massive h2 has line-height 1.0. 
        // Margin/padding: padding-left: 2vw
        let currentY = 0;
        const paddingLeft = 2 * vw;
        
        // Draw SURYA
        tempCtx.fillText('SURYA', paddingLeft, currentY);
        
        // VIGNESH settings
        currentY += suryaFontSize; // Move down
        const vigneshFontSize = 16 * vw; // 16vw from CSS
        tempCtx.font = `${vigneshFontSize}px Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif`;
        tempCtx.textAlign = 'right';
        
        // padding-right: 2vw
        const paddingRight = 2 * vw;
        const widthRight = tempCanvas.width - paddingRight;
        
        // Draw VIGNESH
        tempCtx.fillText('VIGNESH', widthRight, currentY);

        // Extract Pixels
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;
        this.particles = [];

        // Sample every N pixels (determines particle density)
        // More dense for "nano particles"
        const step = window.innerWidth > 768 ? 2 : 3;

        for (let y = 0; y < tempCanvas.height; y += step) {
            for (let x = 0; x < tempCanvas.width; x += step) {
                const index = (y * tempCanvas.width + x) * 4;
                const alpha = imageData[index + 3];

                if (alpha > 128) { // If pixel is mostly solid
                    this.particles.push({
                        homeX: x,
                        homeY: y,
                        x: x,
                        y: y,
                        vx: 0,
                        vy: 0,
                        baseSize: Math.random() * 0.8 + 0.4 // Nano particles (0.4 to 1.2px)
                    });
                }
            }
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Shadow effect: slightly washed out/transparent black
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            // 1. Mouse Repulsion Physics
            let dx = p.x - this.mouse.x;
            let dy = p.y - this.mouse.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.mouse.radius) {
                // Closer to mouse = stronger push
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (this.mouse.radius - distance) / this.mouse.radius;
                
                // Acceleration (more interactive, stronger push)
                p.vx += forceDirectionX * force * 15; 
                p.vy += forceDirectionY * force * 15;
            }

            // 2. Spring back to home physics (softer spring for shadowy/smokey feel)
            p.vx += (p.homeX - p.x) * 0.04; 
            p.vy += (p.homeY - p.y) * 0.04;

            // 3. Friction/Damping (more floaty)
            p.vx *= 0.88;
            p.vy *= 0.88;

            // 4. Update Position
            p.x += p.vx;
            p.y += p.vy;

            // 5. Draw as circle for smoother nano-look, but fillRect is faster for thousands.
            // Since they are nano, fillRect is visually indistinguishable from circles and much faster.
            this.ctx.fillRect(p.x, p.y, p.baseSize, p.baseSize);
        }

        requestAnimationFrame(this.animate);
    }
}

// Global initialization inside the portfolio reveal
if (typeof window.animateHeroSection !== 'undefined') {
    const originalAnimateHeroSection = window.animateHeroSection;
    window.animateHeroSection = function() {
        originalAnimateHeroSection();
        // Init text particles after hero reveals
        setTimeout(() => {
            if (!window.textParticles) {
                window.textParticles = new TextParticles();
            }
        }, 500);
    };
} else {
    // Fallback if not hooked into existing flow
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            window.textParticles = new TextParticles();
        }, 2000);
    });
}

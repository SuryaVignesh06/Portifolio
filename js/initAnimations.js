// Initialize PixelTransition
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.pixel-card').forEach(card => {
        new PixelTransition(card, {
            gridSize: 20, // Higher resolution
            pixelColor: '#17181c', // Dark theme color for smoother blend
            animationStepDuration: 0.5,
            activeBackground: '#17181c'
        });
    });
});

// Initialize LogoLoop
document.addEventListener('DOMContentLoaded', () => {
    // Complete Skills List with Icons
    // Using Simple Icons CDN
    const skillsLogos = [
        { id: 'java', title: 'Java', src: 'https://cdn.simpleicons.org/openjdk/white' },
        { id: 'python', title: 'Python', src: 'https://cdn.simpleicons.org/python/white' },
        { id: 'javascript', title: 'JavaScript', src: 'https://cdn.simpleicons.org/javascript/white' },
        { id: 'typescript', title: 'TypeScript', src: 'https://cdn.simpleicons.org/typescript/white' },
        { id: 'react', title: 'React', src: 'https://cdn.simpleicons.org/react/white' },
        { id: 'nextdotjs', title: 'Next.js', src: 'https://cdn.simpleicons.org/nextdotjs/white' },
        { id: 'tailwindcss', title: 'Tailwind CSS', src: 'https://cdn.simpleicons.org/tailwindcss/white' },
        { id: 'html', title: 'HTML5', src: 'https://cdn.simpleicons.org/html5/white' },
        { id: 'css', title: 'CSS3', src: 'https://cdn.simpleicons.org/css3/white' },
        { id: 'c', title: 'C', src: 'https://cdn.simpleicons.org/c/white' },
        { id: 'figma', title: 'UI/UX (Figma)', src: 'https://cdn.simpleicons.org/figma/white' }
    ];

    const logos = skillsLogos.map(skill => ({
        // Using 'node' to render custom HTML for the button-like behavior + Icon
        node: `
       <button class="skill-btn skill-logo-btn" data-skill="${skill.id === 'figma' ? 'uiux' : skill.id}" aria-label="${skill.title}" style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: transparent; border: none; padding: 10px; height: auto;">
         <img src="${skill.src}" alt="${skill.title}" style="width: 40px; height: 40px; margin-bottom: 8px; filter: brightness(0.9);">
         <span style="font-size: 0.9rem; letter-spacing: 0.1em; color: rgba(255,255,255,0.8);">${skill.title}</span>
       </button>
     `
    }));

    const loop = new LogoLoop('#skillsTrack', {
        logos: logos,
        speed: 40,
        direction: 'left',
        logoHeight: 90,
        gap: 60,
        pauseOnHover: true,
        fadeOut: true,
        fadeOutColor: '#000000',
    });

    // Delegated Event Listener for Skill Popups
    const track = document.getElementById('skillsTrack');
    if (track) {
        track.addEventListener('click', (e) => {
            const btn = e.target.closest('.skill-btn');
            if (btn) {
                if (typeof skillsData !== 'undefined' && typeof popup !== 'undefined') {
                    const skill = btn.dataset.skill;

                    let skillInfo = skillsData[skill];

                    // Fallbacks
                    if (!skillInfo) {
                        if (skill === 'typescript') skillInfo = skillsData['javascript'];
                        if (skill === 'nextdotjs') skillInfo = skillsData['react'];
                        if (skill === 'tailwindcss') skillInfo = skillsData['css'];
                    }

                    if (skillInfo) {
                        popupTitle.textContent = skillInfo.title;
                        popupLevel.textContent = skillInfo.level;

                        popupDetails.innerHTML = '';
                        skillInfo.details.forEach(detail => {
                            const item = document.createElement('div');
                            item.className = 'popup-item';
                            item.textContent = detail;
                            popupDetails.appendChild(item);
                        });

                        popup.classList.add('active');
                        popupOverlay.classList.add('active');
                    }
                }
            }
        });
    }
});

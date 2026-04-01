import initCircularGallery from './CircularGallery.js';

const projects = [
  {
    image: 'Crack.png',
    text: 'CrackAI',
    category: 'AI · Learning Platform',
    desc: 'AI-powered adaptive learning platform using Gemini 2.5 Flash API. Features automated quiz generation from chat history using NLP, subject-specific guardrails, progress analytics, and note management. Built with Python, Flask, SQLAlchemy, and JavaScript.',
    link: 'https://www.linkedin.com/posts/chikkala-venkata-surya-vignesh-82690631b_python-flask-generativeai-activity-7415690027587776512-rXt_',
    linkText: 'View Project'
  },

  {
    image: 'Bindass.png',
    text: 'Bindass',
    category: 'UI/UX Design',
    desc: 'Music streaming application focused on seamless music discovery and distraction-free listening. Designed scalable UI systems, intuitive navigation, refined micro-interactions, and optimized content layout for maximum engagement.',
    link: 'https://www.linkedin.com/posts/chikkala-venkata-surya-vignesh-82690631b_uiuxdesign-productdesign-musicapp-activity-7402325095362232320-05jF',
    linkText: 'View Case Study'
  },
  {
    image: 'San.png',
    text: 'Sanskriti',
    category: 'Cultural Platform',
    desc: 'Web platform celebrating Indian culture and heritage through music, dance, documentaries, and live experiences. Built with clean layouts, intuitive navigation, and scalable UI/UX principles.',
    link: 'https://my-site-kd37rpqd-venkatasuryavignes.wix-vibe.com',
    linkText: 'Visit Website'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('project-circular-gallery');
  if (!container) return;

  const headerEl = document.getElementById('project-header');
  const titleEl = document.getElementById('project-title');
  const catEl = document.getElementById('project-category');
  const descEl = document.getElementById('project-desc');
  const linkGroupEl = document.getElementById('project-link-group');
  const linkEl = document.getElementById('project-link');

  let activeIndex = -1;

  const updateUI = (index) => {
    if (index === activeIndex) return;
    activeIndex = index;
    const project = projects[index];

    // Fade out
    headerEl.style.opacity = '0';
    headerEl.style.transform = 'translateY(-10px)';
    descEl.style.opacity = '0';
    linkGroupEl.style.opacity = '0';
    linkGroupEl.style.transform = 'translateY(10px)';

    setTimeout(() => {
      // Update content
      titleEl.textContent = project.text;
      catEl.textContent = project.category;
      descEl.textContent = project.desc;
      linkEl.href = project.link;
      linkEl.innerHTML = `${project.linkText} <span class="arrow">→</span>`;

      // Fade in
      headerEl.style.opacity = '1';
      headerEl.style.transform = 'translateY(0)';
      descEl.style.opacity = '1';
      linkGroupEl.style.opacity = '1';
      linkGroupEl.style.transform = 'translateY(0)';
    }, 300);
  };

  initCircularGallery(container, {
    items: projects,
    bend: 1.5,
    textColor: '#ffffff',
    borderRadius: 0.05,
    font: 'bold 30px Bebas Neue, sans-serif',
    scrollSpeed: 2,
    scrollEase: 0.05,
    onItemChange: updateUI
  });
});

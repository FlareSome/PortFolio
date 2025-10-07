// --- UTILITIES ---
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;','\'':'&#39;'}[m]; });
}

// --- MOCK DATA ---
const PROJECTS = [
    { id: 1, title: 'Saas Analytics Dashboard', short: 'Real-time data visualization platform built with D3 and React.', tech: ['React', 'D3.js', 'Node.js'] },
    { id: 2, title: 'GraphQL E-commerce API', short: 'Headless API using Apollo Server and PostgreSQL for high-volume transactions.', tech: ['GraphQL', 'Node.js', 'PostgreSQL', 'Docker'] },
    { id: 3, title: 'Component Library & Design System', short: 'A centralized, accessible component library built with TypeScript and Tailwind CSS.', tech: ['TypeScript', 'Tailwind CSS', 'Storybook'] },
    { id: 4, title: 'Open-Source Project Tracker', short: 'A Kanban board for tracking community contributions with a REST API.', tech: ['React', 'Express', 'MongoDB'] },
    { id: 5, title: 'AI-Powered Content Generator', short: 'Integrated Google Gemini API for structured, creative content generation.', tech: ['Gemini API', 'React', 'Firebase'] },
    { id: 6, title: 'Real-time Chat Application', short: 'A WebSocket-based chat service with public and private rooms.', tech: ['Node.js', 'Socket.IO', 'Redis'] },
    { id: 7, title: 'Serverless Portfolio Host', short: 'Personal portfolio deployed on a fast, cost-effective serverless architecture.', tech: ['Next.js', 'Vercel', 'CI/CD'] },
    { id: 8, title: 'Blockchain Explorer Interface', short: 'A simple UI to query and visualize data from a testnet blockchain.', tech: ['React', 'Web3.js', 'Ethers'] },
    { id: 9, title: 'Automated Testing Suite', short: 'Implemented end-to-end testing across 100+ critical paths using Cypress.', tech: ['Cypress', 'Jest', 'CI/CD'] },
];

// --- DOM ELEMENTS & STATE ---
let filtered = [...PROJECTS];

const projectsGrid = document.getElementById('projectsGrid');
const projectRange = document.getElementById('projectRange');
const searchInput = document.getElementById('search');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const yearSpan = document.getElementById('year');
const experienceYearsSpan = document.getElementById('experienceYears');

// --- MODAL FUNCTIONS (Replaces alert()) ---
const modal = document.getElementById('customModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');

function showMessageModal(title, message) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.classList.remove('hidden');
    modal.classList.add('flex', 'opacity-0');
    // Use GSAP for animation if available
    if (typeof gsap !== 'undefined') {
        gsap.to(modal, { opacity: 1, duration: 0.3 });
        gsap.fromTo(modal.firstElementChild, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' });
    } else {
        modal.style.opacity = 1;
    }
    document.body.style.overflow = 'hidden';
}

function closeMessageModal() {
    // Use GSAP for animation if available
    if (typeof gsap !== 'undefined') {
        gsap.to(modal.firstElementChild, { y: 10, opacity: 0, duration: 0.2, ease: 'power1.in' });
        gsap.to(modal, { opacity: 0, duration: 0.3, onComplete: () => {
            modal.classList.remove('flex');
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }});
    } else {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// --- PROJECT RENDERING & LOGIC (Horizontal Scroll) ---

function renderProjects() {
  const visible = filtered;

  // Update info texts
  projectRange.textContent = `Showing all ${filtered.length} projects`;

  projectsGrid.innerHTML = ''; // Clear

  visible.forEach((p, index) => {
    const card = document.createElement('article');
    // Classes for horizontal scrolling: flex-shrink-0, fixed width, snap-center
    card.className = 'glass rounded-xl p-6 shadow-xl hover:shadow-2xl cursor-pointer focus-ring proj-card transition-all flex-shrink-0 w-80 sm:w-96 snap-center';
    card.innerHTML = `
      <div class="h-32 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-500/5 to-transparent flex items-center justify-center border border-dashed border-slate-700/10 dark:border-slate-400/10">
        <div class="text-sm text-slate-400">Demo Placeholder</div>
      </div>
      <h3 class="mt-4 text-xl font-bold text-slate-800 dark:text-slate-100">${escapeHtml(p.title)}</h3>
      <p class="mt-1 text-sm text-slate-500">${escapeHtml(p.short)}</p>
      <div class="mt-4 flex flex-wrap gap-2">${p.tech.map(t => `<span class="text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 font-medium">${escapeHtml(t)}</span>`).join('')}</div>
      <div class="mt-6 flex gap-3">
        <button class="flex-1 py-2 rounded-full border border-indigo-400/30 text-indigo-400 hover:bg-indigo-500/10 preview-btn transition-colors">Details</button>
        <button onclick="showMessageModal('Code Repository','This link would open the public GitHub repository for ${escapeHtml(p.title)}. (Placeholder)')" class="py-2 px-4 rounded-full bg-indigo-600 text-white code-btn shadow-md shadow-indigo-500/30 hover:bg-indigo-700 transition-colors">Code</button>
      </div>
    `;
    projectsGrid.appendChild(card);

    // Motion: fade-in and slight rise (Only if GSAP is available)
    if (typeof gsap !== 'undefined') {
        gsap.from(card, { opacity: 0, y: 16, duration: 0.5, ease: "power2.out", delay: 0.04 * index });
    }
  });

  // Attach detail handlers (using the new modal)
  document.querySelectorAll('.preview-btn').forEach((b, i) => {
    b.onclick = () => showMessageModal(visible[i].title, 'Full project details and live demo would be available here. This modal serves as a professional placeholder.');
  });
}

// Search/filtering
searchInput.addEventListener('input', e => {
  const q = e.target.value.trim().toLowerCase();
  filtered = PROJECTS.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.short.toLowerCase().includes(q) ||
    p.tech.some(t => t.toLowerCase().includes(q))
  );
  renderProjects();
});


// --- THEME TOGGLE (with professional SVG) ---
const SUN_ICON = '<path d="M12 12c-3.313 0-6-2.687-6-6s2.687-6 6-6 6 2.687 6 6-2.687 6-6 6zm10 0h-2c0-5.514-4.486-10-10-10v2c4.418 0 8 3.582 8 8zm-22 0h2c0-5.514-4.486-10 10-10v2c-4.418 0-8 3.582-8 8z"/><path d="M12 2v2h-1v-2h1zm4 10h2v-1h-2v1zm-8 0h-2v-1h2v1zm3 8h2v-1h-2v1zM6 16l-1.414 1.414.707.707 1.414-1.414-.707-.707zm10 0l1.414 1.414-.707.707-1.414-1.414.707-.707zM17 6l1.414-1.414-.707-.707-1.414 1.414.707.707zM7 6l-1.414-1.414-.707.707 1.414 1.414.707-.707z"/>';
const MOON_ICON = '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>'; // Lucide Moon

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.classList.remove('dark');
    themeIcon.innerHTML = SUN_ICON;
  } else {
    document.documentElement.classList.add('dark');
    themeIcon.innerHTML = MOON_ICON;
  }
}

// Initial theme setup (load from localStorage or default to dark)
const initialTheme = (localStorage.getItem('theme') || 'dark');
applyTheme(initialTheme);

themeToggle.addEventListener('click', () => {
  const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
  applyTheme(newTheme);
  localStorage.setItem('theme', newTheme);
  // subtle animation on toggle
  if (typeof gsap !== 'undefined') {
    gsap.from(themeToggle, { scale: 0.8, duration: 0.25, ease: "back.out(1.7)" });
  }
});

// Contact form submission (replaces alert with modal)
document.getElementById('sendBtn').addEventListener('click', () => {
  const name = document.getElementById('nameInput').value.trim();
  const email = document.getElementById('emailInput').value.trim();

  const form = document.getElementById('contactForm');
  if (!form.checkValidity()) {
      showMessageModal('Validation Error', 'Please fill out all required fields (Name, Email, Message) correctly.');
      return;
  }

  // Simulate sending logic (replace with your real email API/integration)
  if (typeof gsap !== 'undefined') {
    gsap.to('#sendBtn', { scale: 0.98, duration: 0.1, yoyo: true, repeat: 1, onComplete: () => {
        showMessageModal('Message Sent!', `Thank you for reaching out, ${name}. I have received your message and will respond to ${email} shortly.`);
        form.reset();
    }});
  } else {
    showMessageModal('Message Sent!', `Thank you for reaching out, ${name}. I have received your message and will respond to ${email} shortly.`);
    form.reset();
  }
});

// --- INITIALIZATION ---
// NOTE: This runs on window load to ensure GSAP is defined before using it for initial animations.
window.addEventListener('load', () => {

  // Set current year and experience years
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
  if (experienceYearsSpan) {
    const startYear = 2020;
    const currentYear = new Date().getFullYear();
    const years = Math.max(1, currentYear - startYear);
    experienceYearsSpan.textContent = years;
  }

  // 1. Render projects
  renderProjects();

  // 2. Smooth Scrolling for Navigation Links
  // This intercepts clicks on links starting with '#' and implements smooth scroll behavior
  document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        // Use smooth scrolling to bring the element into view
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start' // Scroll to the top of the section
        });
      }
    });
  });

  // 3. Initial GSAP Animations
  if (typeof gsap !== 'undefined') {
    // Check if ScrollTrigger is loaded (optional but good practice)
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // Check if reduced motion is preferred before running animations
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!media.matches) {
        gsap.from('header', { y: -16, opacity: 0, duration: 0.6, ease: 'power2.out' });
        gsap.from('#hero h1', { y: 20, opacity: 0, duration: 0.8, delay: 0.1, ease: 'power3.out' });
        gsap.from('#hero p', { y: 10, opacity: 0, duration: 0.6, delay: 0.2 });
        gsap.from('#hero .glass', { scale: 0.95, opacity: 0, duration: 0.6, delay: 0.3, stagger: 0.1 });
    }
  }
});

// If GSAP is defined globally (e.g., loaded directly without defer), ensure the clear still works
if (typeof gsap !== 'undefined') {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) {
      gsap.globalTimeline.clear();
    }
}

// --- Configuration and Data (Existing Portfolio Logic) ---
const PROJECTS_PER_PAGE = 6;
let currentPage = 1;

const projectsData = [
    { id: 1, title: "FinTech Dashboard", description: "A high-performance trading dashboard built with React and D3.js for real-time data visualization.", tags: ["React", "TypeScript", "D3.js"], url: "#" },
    { id: 2, title: "E-Commerce Microservices", description: "Backend infrastructure for a scalable e-commerce platform using Node.js, Express, and PostgreSQL.", tags: ["Node.js", "Microservices", "PostgreSQL"], url: "#" },
    { id: 3, title: "AI-Powered Content Generator", description: "A Next.js application leveraging external LLMs to generate structured marketing copy for clients.", tags: ["Next.js", "AI/ML", "API Integration"], url: "#" },
    { id: 4, title: "Serverless Analytics Platform", description: "Deployed on Google Cloud Functions, this platform handles millions of events daily with minimal cost.", tags: ["GCP", "Serverless", "BigQuery"], url: "#" },
    { id: 5, title: "Real-Time Chat App", description: "A WebSocket-based communication tool with secure authentication and persistent message history.", tags: ["WebSockets", "Vue.js", "Go"], url: "#" },
    { id: 6, title: "Design System Library", description: "Development and documentation of a reusable component library for consistent brand presence across all products.", tags: ["Storybook", "Tailwind CSS", "React"], url: "#" },
    { id: 7, title: "IoT Data Visualization", description: "Visualization of data streams from thousands of IoT devices using a custom optimized canvas renderer.", tags: ["Canvas", "JS", "Data Streaming"], url: "#" },
    { id: 8, title: "Personal Blogging Engine", description: "A simple, fast static site generator (SSG) tailored for technical writing and developer tutorials.", tags: ["Static Generation", "Markdown", "CI/CD"], url: "#" },
    { id: 9, title: "Mobile App Prototype (PWA)", description: "A Progressive Web Application (PWA) for field service management with offline capabilities.", tags: ["PWA", "IndexedDB", "Offline First"], url: "#" },
    { id: 10, title: "Legacy System Migration", description: "Successful migration of a monolithic application from Ruby on Rails to a modern Typescript/Node stack.", tags: ["Migration", "Architecture", "Refactoring"], url: "#" },
    { id: 11, title: "Blockchain Integration POC", description: "Proof of concept for integrating supply chain logistics with a private blockchain ledger.", tags: ["Blockchain", "Web3", "Solidity"], url: "#" },
    { id: 12, title: "Automated Testing Suite", description: "Implementation of end-to-end and unit tests using Cypress and Jest, boosting coverage to 95%.", tags: ["Cypress", "Jest", "TDD"], url: "#" },
    { id: 13, title: "VR E-learning Module", description: "Development of an interactive 3D learning module using Three.js and WebGL.", tags: ["Three.js", "WebGL", "Education"], url: "#" },
];

const totalPages = Math.ceil(projectsData.length / PROJECTS_PER_PAGE);

// --- DOM Elements ---
const introLoader = document.getElementById('intro-loader');
const appContainer = document.getElementById('app-container');
const projectsGrid = document.getElementById('projects-grid');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('page-info');
const mainHeader = document.getElementById('main-header');
const themeToggleBtn = document.getElementById('theme-toggle'); // New DOM element

// --- Theme Management Functions ---

/**
 * Reads the --three-js-color CSS variable and converts it to a Three.js compatible hex number.
 * @returns {number} The hex color code.
 */
function getThreeJsColorHex() {
    // Get the computed value of the CSS variable
    const colorStr = getComputedStyle(document.body).getPropertyValue('--three-js-color').trim();
    // The variable is stored as '0xRRGGBB', so we need to parse it.
    if (colorStr.startsWith('0x')) {
        return parseInt(colorStr, 16);
    }
    // Fallback to blue if something goes wrong
    return 0x3B82F6;
}

/**
 * Updates the color of the 3D sphere to match the current theme.
 */
function updateBallColor() {
    // Check if THREE objects have been initialized
    if (typeof THREE === 'undefined' || !ballMesh || !particleSystem) return;

    const newColor = getThreeJsColorHex();

    // Update shell (wireframe) color
    if (ballMesh.material.color) {
        // NOTE: Setting material needs to happen on the main thread
        ballMesh.material.color.setHex(newColor);
    }

    // Update particle system color
    if (particleSystem.material.color) {
        particleSystem.material.color.setHex(newColor);
    }
}

/**
 * Toggles the website theme between 'dark' and 'light'.
 */
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme); // Save preference

    updateBallColor(); // Update the 3D ball color instantly
    renderProjects(); // Re-render projects to apply tag color changes
    updateThemeIcon(newTheme); // Update the icon
}

/**
 * Loads the user's preferred theme from local storage or sets a default.
 */
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

/**
 * Updates the icon on the theme toggle button.
 * @param {string} theme - The current theme ('dark' or 'light').
 */
function updateThemeIcon(theme) {
    if (!themeToggleBtn) return;

    const isDark = theme === 'dark';
    // Moon for dark theme, Sun for light theme
    const iconSvg = isDark
        ? `<svg class="w-6 h-6" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 12.001 12.001 0 0019.354 14.354z"></path></svg>`
        : `<svg class="w-6 h-6" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`;

    themeToggleBtn.innerHTML = iconSvg;
}


// --- Simplified 3D Floating Ball Animation Logic (using Three.js) ---

const CANVAS_ID = 'ballAnimationCanvas';
const BALL_RADIUS = 100;
const PARTICLE_SIZE = 3;

let scene, camera, renderer;
let ballMesh;
let particleSystem;
let animationFrameId = null;

/**
 * Initializes the particle system and the translucent shell mesh.
 */
function initBallObjects() {
    // Check if THREE is defined (loaded from CDN)
    if (typeof THREE === 'undefined') {
        return;
    }

    // Get the initial color from CSS variables (defaults to dark theme color)
    const initialColor = getThreeJsColorHex();

    // 1. Translucent Ball Shell (Wireframe structure)
    const shellGeometry = new THREE.SphereGeometry(BALL_RADIUS * 0.95, 24, 24);
    const shellMaterial = new THREE.MeshBasicMaterial({
        color: initialColor,
        transparent: true,
        opacity: 0.15,
        wireframe: true
    });
    ballMesh = new THREE.Mesh(shellGeometry, shellMaterial);
    scene.add(ballMesh);

    // 2. Particle System (The covering)
    const particleGeometry = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);
    const particleMaterial = new THREE.PointsMaterial({
        color: initialColor,
        size: PARTICLE_SIZE,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.9,
    });

    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
}

/**
 * The main animation loop for the Three.js scene.
 */
function animateBall() {
    if (typeof THREE === 'undefined' || !renderer) return;

    animationFrameId = requestAnimationFrame(animateBall);

    const time = Date.now() * 0.0005;

    // 1. Floating & Rotation Motion
    scene.rotation.y += 0.003;
    scene.rotation.x = Math.sin(time * 0.1) * 0.1;

    // 2. Render the scene
    renderer.render(scene, camera);
}

/**
 * Sets up the Three.js environment.
 */
function setupBallAnimation() {
    const canvas = document.getElementById(CANVAS_ID);
    if (!canvas || typeof THREE === 'undefined') {
         return;
    }

    // Ensure canvas has dimensions
    const size = 250;
    canvas.width = size;
    canvas.height = size;

    const width = canvas.width;
    const height = canvas.height;

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 180;

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0); // Transparent background

    // Initialize the 3D objects
    initBallObjects();

    // Start the animation loop
    animateBall();
}


// --- Scroll Hide/Show Logic for Header ---
let lastScrollY = 0;
const scrollThreshold = 100;

function handleScroll() {
    const currentScrollY = window.scrollY;

    if (currentScrollY > scrollThreshold) {
        if (currentScrollY > lastScrollY) {
            // Scrolling down: hide header
            mainHeader.classList.add('header-hidden');
        } else {
            // Scrolling up: show header
            mainHeader.classList.remove('header-hidden');
        }
    } else {
        // At the top of the page, always show the header
        mainHeader.classList.remove('header-hidden');
    }

    lastScrollY = currentScrollY;
}


// --- Core Functions (Pagination/Loaders) ---

/**
 * Renders the projects for the current page.
 * NOTE: Tailwind classes for color/bg are dynamically determined based on the current theme.
 */
function renderProjects() {
    const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
    const endIndex = startIndex + PROJECTS_PER_PAGE;
    const projectsToRender = projectsData.slice(startIndex, endIndex);

    // 1. Clear previous projects
    projectsGrid.innerHTML = '';

    // Determine color classes based on current theme
    const isDark = document.body.getAttribute('data-theme') === 'dark';

    // Dynamic classes based on theme switch for project cards
    const tagBgClass = isDark ? 'bg-gray-700 text-blue-300' : 'bg-red-100 text-red-600';
    const linkColorClass = isDark ? 'text-blue-400 hover:text-blue-300' : 'text-red-500 hover:text-red-400';
    const cardAccentClass = isDark ? 'border-blue-500' : 'border-red-500';
    const cardBaseClass = isDark ? 'bg-gray-800' : 'bg-white';
    const cardTextColor = isDark ? 'text-white' : 'text-gray-900';
    const cardDescriptionColor = isDark ? 'text-gray-400' : 'text-gray-600';


    // 2. Render new projects
    projectsToRender.forEach((project, index) => {
        const projectCard = document.createElement('div');
        // Using dynamic classes for themed components
        projectCard.className = `project-card p-6 rounded-xl shadow-2xl border-t-4 transition-colors-shadow duration-500 ${cardBaseClass} ${cardAccentClass}`;

        // Add dynamic hover shadow based on theme
        projectCard.style.setProperty('box-shadow', `0 20px 25px -5px var(--color-card-shadow)`);

        projectCard.innerHTML = `
            <h3 class="text-2xl font-bold mb-2 ${cardTextColor}">
                ${project.title}
            </h3>
            <p class="text-sm ${cardDescriptionColor} mb-4">${project.description}</p>
            <div class="flex flex-wrap gap-2 mb-4">
                ${project.tags.map(tag => `<span class="px-3 py-1 text-xs font-semibold rounded-full ${tagBgClass}">${tag}</span>`).join('')}
            </div>
            <a href="${project.url}" class="font-medium inline-flex items-center transition-colors ${linkColorClass}">
                View Details
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
        `;

        // Add a small delay for staggered appearance
        setTimeout(() => {
            projectCard.classList.add('is-visible');
        }, index * 100);

        projectsGrid.appendChild(projectCard);
    });

    // 3. Update pagination controls
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}


/**
 * Handles the next page click.
 */
function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        renderProjects();
    }
}

/**
 * Handles the previous page click.
 */
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderProjects();
    }
}


// --- Event Listeners and Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // 0. Load Theme Preference
    loadTheme();

    // 1. Setup the 3D floating animation (restored)
    setupBallAnimation();

    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Run Intro Animation
    setTimeout(() => {
        introLoader.classList.add('intro-hidden');
    }, 1500);

    // Hide the loader and show main content after transition
    introLoader.addEventListener('transitionend', () => {
        if (introLoader.classList.contains('intro-hidden')) {
            introLoader.style.display = 'none';
            appContainer.style.opacity = '1';

            // Trigger Hero Section animations
            setTimeout(() => { document.getElementById('hero-subtitle').style.transform = 'translateY(0)'; document.getElementById('hero-subtitle').style.opacity = '1'; }, 100);
            setTimeout(() => { document.getElementById('hero-title').style.transform = 'translateX(0)'; document.getElementById('hero-title').style.opacity = '1'; }, 300);
            setTimeout(() => { document.getElementById('hero-paragraph').style.transform = 'translateY(0)'; document.getElementById('hero-paragraph').style.opacity = '1'; }, 500);
            setTimeout(() => { document.getElementById('hero-button').style.transform = 'scale(1)'; document.getElementById('hero-button').style.opacity = '1'; }, 700);

            // Ensure ball color is correct after theme load
            updateBallColor();
        }
    });

    // 2. Initialize Pagination
    renderProjects();

    // 3. Pagination Button Handlers
    prevBtn.addEventListener('click', prevPage);
    nextBtn.addEventListener('click', nextPage);

    // 4. Theme Toggle Handler (New)
    if(themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // 5. Contact Form Submission (Mock)
    const contactForm = document.querySelector('#contact form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Simulate form submission success
            contactForm.reset();
            const contactMessage = document.getElementById('contact-message');
            if(contactMessage) {
                 contactMessage.classList.remove('hidden');
                 setTimeout(() => {
                    contactMessage.classList.add('hidden');
                }, 4000);
            }
        });
    }

    // 6. Scroll Event Handler for Header
    window.addEventListener('scroll', handleScroll);
});

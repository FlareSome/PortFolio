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
        console.error("Three.js not loaded. Skipping 3D initialization.");
        return;
    }
    // 1. Translucent Ball Shell (Wireframe structure)
    const shellGeometry = new THREE.SphereGeometry(BALL_RADIUS * 0.95, 24, 24);
    const shellMaterial = new THREE.MeshBasicMaterial({
        color: 0x3B82F6,
        transparent: true,
        opacity: 0.15,
        wireframe: true
    });
    ballMesh = new THREE.Mesh(shellGeometry, shellMaterial);
    scene.add(ballMesh);

    // 2. Particle System (The blue covering)
    const particleGeometry = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x3B82F6,
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
    if (!canvas || typeof THREE === 'undefined') return;

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

    // Start the animation loop when the window is loaded
    window.onload = function () {
        animateBall();
    }
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
 */
function renderProjects() {
    const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
    const endIndex = startIndex + PROJECTS_PER_PAGE;
    const projectsToRender = projectsData.slice(startIndex, endIndex);

    // 1. Clear previous projects
    projectsGrid.innerHTML = '';

    // 2. Render new projects
    projectsToRender.forEach((project, index) => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card bg-gray-800 p-6 rounded-xl shadow-2xl border-t-4 border-blue-500 hover:shadow-blue-900/70 transition-colors-shadow duration-500';
        projectCard.innerHTML = `
            <h3 class="text-2xl font-bold text-white mb-2">${project.title}</h3>
            <p class="text-gray-400 mb-4">${project.description}</p>
            <div class="flex flex-wrap gap-2 mb-4">
                ${project.tags.map(tag => `<span class="px-3 py-1 text-xs font-semibold bg-gray-700 text-blue-300 rounded-full">${tag}</span>`).join('')}
            </div>
            <a href="${project.url}" class="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center transition-colors">
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
    // Setup the 3D floating animation
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
        }
    });

    // 2. Initialize Pagination
    renderProjects();

    // 3. Pagination Button Handlers
    prevBtn.addEventListener('click', prevPage);
    nextBtn.addEventListener('click', nextPage);

    // 4. Contact Form Submission (Mock)
    const contactForm = document.querySelector('#contact form');
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Simulate form submission success
        contactForm.reset();
        document.getElementById('contact-message').classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('contact-message').classList.add('hidden');
        }, 4000);
    });

    // 5. Scroll Event Handler for Header
    window.addEventListener('scroll', handleScroll);
});

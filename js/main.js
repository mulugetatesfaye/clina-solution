// ============================================
// CLINA SOLUTION - MAIN JAVASCRIPT
// ============================================

// --- Three.js 3D Background Scene ---
class ThreeBackground {
    constructor() {
        this.canvas = document.getElementById('bg-canvas');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.geometry = null;
        this.mouse = { x: 0, y: 0 };
        this.init();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 50;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create particles
        this.createParticles();
        // Create wireframe geometries
        this.createGeometries();

        // Mouse tracking
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // Resize handler
        window.addEventListener('resize', () => this.onResize());

        // Start animation
        this.animate();
    }

    createParticles() {
        const particleCount = 2000;
        this.geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            // Position
            positions[i * 3] = (Math.random() - 0.5) * 150;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 150;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 150;

            // Color (gradient between purple and cyan)
            const colorChoice = Math.random();
            if (colorChoice < 0.33) {
                colors[i * 3] = 0.424;     // R - purple
                colors[i * 3 + 1] = 0.388; // G
                colors[i * 3 + 2] = 1.0;   // B
            } else if (colorChoice < 0.66) {
                colors[i * 3] = 0.0;       // R - cyan
                colors[i * 3 + 1] = 0.851; // G
                colors[i * 3 + 2] = 1.0;   // B
            } else {
                colors[i * 3] = 1.0;       // R - pink
                colors[i * 3 + 1] = 0.396; // G
                colors[i * 3 + 2] = 0.518; // B
            }

            // Size
            sizes[i] = Math.random() * 2 + 0.5;
        }

        this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Particle material
        const material = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.particles = new THREE.Points(this.geometry, material);
        this.scene.add(this.particles);

        // Connection lines
        const lineGeometry = new THREE.BufferGeometry();
        const linePositions = [];

        for (let i = 0; i < 200; i++) {
            const start = Math.floor(Math.random() * particleCount);
            const end = Math.floor(Math.random() * particleCount);
            linePositions.push(
                positions[start * 3], positions[start * 3 + 1], positions[start * 3 + 2],
                positions[end * 3], positions[end * 3 + 1], positions[end * 3 + 2]
            );
        }

        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x6C63FF,
            transparent: true,
            opacity: 0.05
        });

        this.lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        this.scene.add(this.lines);
    }

    createGeometries() {
        // Floating wireframe icosahedron
        const icoGeometry = new THREE.IcosahedronGeometry(8, 1);
        const icoMaterial = new THREE.MeshBasicMaterial({
            color: 0x6C63FF,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });
        this.icosahedron = new THREE.Mesh(icoGeometry, icoMaterial);
        this.icosahedron.position.set(20, 10, -10);
        this.scene.add(this.icosahedron);

        // Floating wireframe torus
        const torusGeometry = new THREE.TorusGeometry(6, 2, 16, 100);
        const torusMaterial = new THREE.MeshBasicMaterial({
            color: 0x00D9FF,
            wireframe: true,
            transparent: true,
            opacity: 0.1
        });
        this.torus = new THREE.Mesh(torusGeometry, torusMaterial);
        this.torus.position.set(-20, -10, -15);
        this.scene.add(this.torus);

        // Floating wireframe octahedron
        const octGeometry = new THREE.OctahedronGeometry(5, 0);
        const octMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF6584,
            wireframe: true,
            transparent: true,
            opacity: 0.12
        });
        this.octahedron = new THREE.Mesh(octGeometry, octMaterial);
        this.octahedron.position.set(-15, 15, -5);
        this.scene.add(this.octahedron);

        // Floating wireframe torus knot
        const knotGeometry = new THREE.TorusKnotGeometry(4, 1.5, 100, 16);
        const knotMaterial = new THREE.MeshBasicMaterial({
            color: 0x6C63FF,
            wireframe: true,
            transparent: true,
            opacity: 0.08
        });
        this.torusKnot = new THREE.Mesh(knotGeometry, knotMaterial);
        this.torusKnot.position.set(15, -15, -20);
        this.scene.add(this.torusKnot);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.001;

        // Rotate particles based on mouse
        this.particles.rotation.y += 0.0003;
        this.particles.rotation.x += 0.0001;
        this.particles.rotation.y += this.mouse.x * 0.001;
        this.particles.rotation.x += this.mouse.y * 0.001;

        // Animate geometries
        if (this.icosahedron) {
            this.icosahedron.rotation.x = time * 0.2;
            this.icosahedron.rotation.y = time * 0.3;
            this.icosahedron.position.y = 10 + Math.sin(time * 0.5) * 5;
        }

        if (this.torus) {
            this.torus.rotation.x = time * 0.15;
            this.torus.rotation.z = time * 0.1;
            this.torus.position.y = -10 + Math.cos(time * 0.4) * 4;
        }

        if (this.octahedron) {
            this.octahedron.rotation.x = time * 0.25;
            this.octahedron.rotation.y = time * 0.2;
            this.octahedron.position.y = 15 + Math.sin(time * 0.6) * 3;
        }

        if (this.torusKnot) {
            this.torusKnot.rotation.x = time * 0.1;
            this.torusKnot.rotation.y = time * 0.15;
            this.torusKnot.position.y = -15 + Math.cos(time * 0.3) * 4;
        }

        // Animate lines
        if (this.lines) {
            this.lines.rotation.y = this.particles.rotation.y;
            this.lines.rotation.x = this.particles.rotation.x;
        }

        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// --- Custom Cursor ---
class CustomCursor {
    constructor() {
        this.cursor = document.getElementById('cursor');
        this.follower = document.getElementById('cursor-follower');
        this.pos = { x: 0, y: 0 };
        this.followerPos = { x: 0, y: 0 };
        this.init();
    }

    init() {
        document.addEventListener('mousemove', (e) => {
            this.pos.x = e.clientX;
            this.pos.y = e.clientY;
        });

        // Hover effects
        const hoverElements = document.querySelectorAll('a, button, .service-card, .portfolio-card, .team-card, .filter-btn');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => this.follower.classList.add('hover'));
            el.addEventListener('mouseleave', () => this.follower.classList.remove('hover'));
        });

        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Smooth follower
        this.followerPos.x += (this.pos.x - this.followerPos.x) * 0.15;
        this.followerPos.y += (this.pos.y - this.followerPos.y) * 0.15;

        this.cursor.style.left = this.pos.x - 4 + 'px';
        this.cursor.style.top = this.pos.y - 4 + 'px';

        this.follower.style.left = this.followerPos.x - 20 + 'px';
        this.follower.style.top = this.followerPos.y - 20 + 'px';
    }
}

// --- Preloader ---
class Preloader {
    constructor() {
        this.preloader = document.getElementById('preloader');
        this.init();
    }

    init() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.preloader.classList.add('hidden');
                this.animateHero();
            }, 1800);
        });
    }

    animateHero() {
        // Trigger hero animations
        document.querySelectorAll('.hero-content > *').forEach((el, i) => {
            el.style.animationDelay = `${i * 0.1}s`;
        });
    }
}

// --- Navigation ---
class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.mobileToggle = document.getElementById('mobile-toggle');
        this.navMenu = document.getElementById('nav-menu');
        this.init();
    }

    init() {
        // Scroll effect
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
            this.updateActiveLink();
        });

        // Smooth scroll
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    this.navMenu.classList.remove('active');
                    this.mobileToggle.classList.remove('active');
                }
            });
        });

        // Mobile menu
        this.mobileToggle.addEventListener('click', () => {
            this.navMenu.classList.toggle('active');
            this.mobileToggle.classList.toggle('active');
        });
    }

    updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 200;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
}

// --- Scroll Reveal Animations ---
class ScrollReveal {
    constructor() {
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Add reveal classes to elements
        document.querySelectorAll('.section-header, .service-card, .portfolio-card, .team-card, .value-card, .about-text, .contact-info, .contact-form-wrapper').forEach(el => {
            el.classList.add('reveal');
            observer.observe(el);
        });
    }
}

// --- Counter Animation ---
class CounterAnimation {
    constructor() {
        this.init();
    }

    init() {
        const counters = document.querySelectorAll('.stat-number');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const start = performance.now();

        const update = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);

            element.textContent = current + '+';

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    }
}

// --- Portfolio Filter ---
class PortfolioFilter {
    constructor() {
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.cards = document.querySelectorAll('.portfolio-card');
        this.init();
    }

    init() {
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active button
                this.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.getAttribute('data-filter');

                this.cards.forEach(card => {
                    const category = card.getAttribute('data-category');

                    if (filter === 'all' || category === filter) {
                        card.style.display = 'block';
                        card.style.animation = 'fadeIn 0.5s ease-out';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
}

// --- Testimonial Slider ---
class TestimonialSlider {
    constructor() {
        this.cards = document.querySelectorAll('.testimonial-card');
        this.dots = document.querySelectorAll('.testimonial-dots .dot');
        this.current = 0;
        this.interval = null;
        this.init();
    }

    init() {
        this.dots.forEach(dot => {
            dot.addEventListener('click', () => {
                this.showSlide(parseInt(dot.getAttribute('data-index')));
                this.resetInterval();
            });
        });

        this.startAutoPlay();
    }

    showSlide(index) {
        this.cards.forEach(card => card.classList.remove('active'));
        this.dots.forEach(dot => dot.classList.remove('active'));

        this.current = index;
        this.cards[index].classList.add('active');
        this.dots[index].classList.add('active');
    }

    nextSlide() {
        const next = (this.current + 1) % this.cards.length;
        this.showSlide(next);
    }

    startAutoPlay() {
        this.interval = setInterval(() => this.nextSlide(), 5000);
    }

    resetInterval() {
        clearInterval(this.interval);
        this.startAutoPlay();
    }
}

// --- Back to Top ---
class BackToTop {
    constructor() {
        this.button = document.getElementById('back-to-top');
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                this.button.classList.add('visible');
            } else {
                this.button.classList.remove('visible');
            }
        });

        this.button.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// --- Contact Form ---
class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();

            const btn = this.form.querySelector('.btn-submit');
            const originalText = btn.innerHTML;

            btn.innerHTML = '<span>Sending...</span> <i class="fas fa-spinner fa-spin"></i>';
            btn.disabled = true;

            // Simulate form submission
            setTimeout(() => {
                btn.innerHTML = '<span>Message Sent!</span> <i class="fas fa-check"></i>';
                btn.style.background = 'linear-gradient(135deg, #28C840, #00D9FF)';

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                    this.form.reset();
                }, 2000);
            }, 1500);
        });
    }
}

// --- 3D Tilt Effect for Service Cards ---
class TiltEffect {
    constructor() {
        this.cards = document.querySelectorAll('[data-tilt]');
        this.init();
    }

    init() {
        this.cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 15;
                const rotateY = (centerX - x) / 15;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }
}

// --- Gradient Orbs Animation ---
class GradientOrbs {
    constructor() {
        this.init();
    }

    init() {
        const orbs = document.querySelectorAll('.gradient-orb');
        orbs.forEach(orb => {
            orb.style.animationDelay = `${Math.random() * 5}s`;
        });
    }
}

// --- Typing Effect for Hero ---
class TypingEffect {
    constructor() {
        this.init();
    }

    init() {
        // Optional: Add typing effect to specific elements
        // This is kept simple for performance
    }
}

// --- Parallax on Scroll ---
class ParallaxScroll {
    constructor() {
        this.init();
    }

    init() {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;

            // Parallax for hero elements
            document.querySelectorAll('.float-card').forEach((card, i) => {
                const speed = (i + 1) * 0.05;
                card.style.transform = `translateY(${scrolled * speed}px)`;
            });

            // Parallax for section headers
            document.querySelectorAll('.section-header').forEach(header => {
                const rect = header.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const offset = (rect.top / window.innerHeight) * 50;
                    header.style.transform = `translateY(${offset}px)`;
                }
            });
        });
    }
}

// --- Initialize Everything ---
document.addEventListener('DOMContentLoaded', () => {
    // Add gradient orbs
    const orbs = [
        '<div class="gradient-orb orb-1"></div>',
        '<div class="gradient-orb orb-2"></div>',
        '<div class="gradient-orb orb-3"></div>'
    ];
    document.body.insertAdjacentHTML('beforeend', orbs.join(''));

    // Initialize all modules
    new ThreeBackground();
    new CustomCursor();
    new Preloader();
    new Navigation();
    new ScrollReveal();
    new CounterAnimation();
    new PortfolioFilter();
    new TestimonialSlider();
    new BackToTop();
    new ContactForm();
    new TiltEffect();
    new GradientOrbs();
    new ParallaxScroll();

    console.log('%c🚀 Clina Solution Website Loaded Successfully!', 'color: #6C63FF; font-size: 16px; font-weight: bold;');
});
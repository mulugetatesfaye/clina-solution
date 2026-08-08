/* ============================================
   CLINA SOLUTION — PREMIUM INTERACTION ENGINE
   ============================================ */

// --- Three.js 3D Scene (Abstract Digital Core) ---
class ThreeScene {
    constructor() {
        this.canvas = document.getElementById('bg-canvas');
        if (!this.canvas) return;

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.mouse = { x: 0, y: 0 };
        this.targetMouse = { x: 0, y: 0 };
        this.scrollY = 0;
        this.core = null;
        this.particles = null;
        this.rings = [];

        // Check WebGL support
        if (!this.checkWebGL()) return;

        this.init();
    }

    checkWebGL() {
        try {
            const c = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
        this.camera.position.set(0, 0, 30);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Build scene
        this.createCore();
        this.createParticles();
        this.createRings();

        // Events
        document.addEventListener('mousemove', (e) => {
            this.targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY;
        }, { passive: true });

        window.addEventListener('resize', () => this.onResize());

        this.animate();
    }

    createCore() {
        // Central icosahedron — the "digital core"
        const geometry = new THREE.IcosahedronGeometry(3, 1);
        const material = new THREE.MeshBasicMaterial({
            color: 0xC8FF2E,
            wireframe: true,
            transparent: true,
            opacity: 0.12
        });
        this.core = new THREE.Mesh(geometry, material);
        this.core.position.set(8, -2, -5);
        this.scene.add(this.core);

        // Inner solid core
        const innerGeo = new THREE.IcosahedronGeometry(1.5, 0);
        const innerMat = new THREE.MeshBasicMaterial({
            color: 0xC8FF2E,
            transparent: true,
            opacity: 0.03
        });
        const innerCore = new THREE.Mesh(innerGeo, innerMat);
        this.core.add(innerCore);
    }

    createParticles() {
        const count = 800;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10;

            // Accent color with variation
            const brightness = 0.3 + Math.random() * 0.7;
            colors[i * 3] = 0.78 * brightness;     // R
            colors[i * 3 + 1] = 1.0 * brightness;   // G
            colors[i * 3 + 2] = 0.18 * brightness;  // B
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.15,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    createRings() {
        // Orbital rings around the core
        for (let i = 0; i < 3; i++) {
            const radius = 5 + i * 2.5;
            const geometry = new THREE.TorusGeometry(radius, 0.02, 8, 80);
            const material = new THREE.MeshBasicMaterial({
                color: 0xC8FF2E,
                transparent: true,
                opacity: 0.04 + i * 0.01
            });
            const ring = new THREE.Mesh(geometry, material);
            ring.position.copy(this.core.position);
            ring.rotation.x = Math.PI / 2 + i * 0.3;
            ring.rotation.y = i * 0.5;
            this.scene.add(ring);
            this.rings.push(ring);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.001;

        // Smooth mouse follow
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

        // Camera subtle movement
        this.camera.position.x = this.mouse.x * 2;
        this.camera.position.y = this.mouse.y * 1.5;
        this.camera.lookAt(0, 0, 0);

        // Core rotation
        if (this.core) {
            this.core.rotation.x = time * 0.1;
            this.core.rotation.y = time * 0.15;
        }

        // Ring rotation
        this.rings.forEach((ring, i) => {
            ring.rotation.z = time * (0.05 + i * 0.02);
        });

        // Particle slow drift
        if (this.particles) {
            this.particles.rotation.y = time * 0.01;
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
class Cursor {
    constructor() {
        this.dot = document.getElementById('cursor-dot');
        this.ring = document.getElementById('cursor-ring');
        if (!this.dot || !this.ring) return;

        this.pos = { x: 0, y: 0 };
        this.ringPos = { x: 0, y: 0 };

        document.addEventListener('mousemove', (e) => {
            this.pos.x = e.clientX;
            this.pos.y = e.clientY;
        });

        // Hover targets
        const targets = document.querySelectorAll('a, button, .service-item, .work-card, .tech-category, .industry-item, input, textarea, select');
        targets.forEach(el => {
            el.addEventListener('mouseenter', () => this.ring.classList.add('hover'));
            el.addEventListener('mouseleave', () => this.ring.classList.remove('hover'));
        });

        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        this.ringPos.x += (this.pos.x - this.ringPos.x) * 0.12;
        this.ringPos.y += (this.pos.y - this.ringPos.y) * 0.12;

        this.dot.style.transform = `translate(${this.pos.x - 3}px, ${this.pos.y - 3}px)`;
        this.ring.style.transform = `translate(${this.ringPos.x - 18}px, ${this.ringPos.y - 18}px)`;
    }
}

// --- Preloader ---
class Preloader {
    constructor() {
        this.el = document.getElementById('preloader');
        if (!this.el) return;

        window.addEventListener('load', () => {
            setTimeout(() => {
                this.el.classList.add('hidden');
                // Trigger hero reveals
                this.triggerHeroReveal();
            }, 1600);
        });
    }

    triggerHeroReveal() {
        const heroReveals = document.querySelectorAll('.hero .reveal');
        heroReveals.forEach((el, i) => {
            setTimeout(() => {
                el.classList.add('visible');
            }, i * 120);
        });
    }
}

// --- Header ---
class Header {
    constructor() {
        this.header = document.getElementById('header');
        this.toggle = document.getElementById('menu-toggle');
        this.mobileNav = document.getElementById('mobile-nav');
        this.overlay = document.getElementById('mobile-nav-overlay');
        this.links = document.querySelectorAll('.header__link');

        if (!this.header) return;

        // Scroll state
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const current = window.scrollY;
            if (current > 60) {
                this.header.classList.add('scrolled');
            } else {
                this.header.classList.remove('scrolled');
            }
            lastScroll = current;

            // Update active nav link
            this.updateActiveLink();
        }, { passive: true });

        // Mobile menu
        if (this.toggle) {
            this.toggle.addEventListener('click', () => this.toggleMobile());
        }
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeMobile());
        }

        // Close mobile nav on link click
        document.querySelectorAll('.mobile-nav__link, .mobile-nav__cta').forEach(link => {
            link.addEventListener('click', () => this.closeMobile());
        });

        // Smooth scroll for all anchor links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    toggleMobile() {
        const isOpen = this.mobileNav.classList.contains('open');
        if (isOpen) {
            this.closeMobile();
        } else {
            this.mobileNav.classList.add('open');
            this.mobileNav.setAttribute('aria-hidden', 'false');
            this.toggle.classList.add('active');
            this.toggle.setAttribute('aria-expanded', 'true');
        }
    }

    closeMobile() {
        this.mobileNav.classList.remove('open');
        this.mobileNav.setAttribute('aria-hidden', 'true');
        this.toggle.classList.remove('active');
        this.toggle.setAttribute('aria-expanded', 'false');
    }

    updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 200;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                this.links.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
}

// --- Scroll Reveal ---
class ScrollReveal {
    constructor() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        document.querySelectorAll('.reveal').forEach(el => {
            // Skip hero reveals (handled by preloader)
            if (!el.closest('.hero')) {
                this.observer.observe(el);
            }
        });
    }
}

// --- Counter Animation ---
class Counters {
    constructor() {
        const counters = document.querySelectorAll('.stat__number[data-target]');
        if (!counters.length) return;

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animate(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(c => this.observer.observe(c));
    }

    animate(el) {
        const target = parseInt(el.dataset.target);
        const duration = 2000;
        const start = performance.now();

        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4); // ease-out quart
            el.textContent = Math.round(eased * target) + '+';
            if (progress < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    }
}

// --- Testimonial Slider ---
class Testimonials {
    constructor() {
        this.cards = document.querySelectorAll('.testimonial-card');
        this.dots = document.querySelectorAll('.testimonial-nav__dot');
        if (!this.cards.length) return;

        this.current = 0;
        this.interval = null;

        this.dots.forEach(dot => {
            dot.addEventListener('click', () => {
                this.goTo(parseInt(dot.dataset.index));
                this.reset();
            });
        });

        this.start();
    }

    goTo(index) {
        this.cards[this.current].classList.remove('active');
        this.dots[this.current].classList.remove('active');
        this.current = index;
        this.cards[this.current].classList.add('active');
        this.dots[this.current].classList.add('active');
    }

    next() {
        this.goTo((this.current + 1) % this.cards.length);
    }

    start() {
        this.interval = setInterval(() => this.next(), 6000);
    }

    reset() {
        clearInterval(this.interval);
        this.start();
    }
}

// --- Contact Form ---
class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();

            const btn = this.form.querySelector('button[type="submit"]');
            const original = btn.innerHTML;
            btn.innerHTML = 'Sending <span class="btn__arrow">→</span>';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = 'Message Sent ✓';
                btn.style.background = '#28C840';
                btn.style.color = '#fff';

                setTimeout(() => {
                    btn.innerHTML = original;
                    btn.style.background = '';
                    btn.style.color = '';
                    btn.disabled = false;
                    this.form.reset();
                }, 2500);
            }, 1200);
        });
    }
}

// --- Back to Top ---
class BackToTop {
    constructor() {
        this.btn = document.getElementById('back-to-top');
        if (!this.btn) return;

        window.addEventListener('scroll', () => {
            this.btn.classList.toggle('visible', window.scrollY > 600);
        }, { passive: true });

        this.btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// --- Magnetic Buttons (subtle pull toward cursor) ---
class MagneticButtons {
    constructor() {
        const buttons = document.querySelectorAll('.btn--primary');
        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }
}

// --- Initialize Everything ---
document.addEventListener('DOMContentLoaded', () => {
    new ThreeScene();
    new Cursor();
    new Preloader();
    new Header();
    new ScrollReveal();
    new Counters();
    new Testimonials();
    new ContactForm();
    new BackToTop();
    new MagneticButtons();
});
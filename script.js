/**
 * Interactive behaviors for the Vintage Portfolio
 */

document.addEventListener('DOMContentLoaded', () => {

    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Theme Toggle Logic
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme');

    // Check for saved theme preference, otherwise check system preference
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }
    });

    // Sticky Navbar shadow on scroll
    const header = document.querySelector('.main-header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Reveal elements on scroll (Intersection Observer)
    const revealElements = document.querySelectorAll('.about-text, .blueprint-box, .project-card, .timeline-item, .contact-form');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('reveal');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    // Initial setup for reveal classes
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        revealOnScroll.observe(el);
    });

    // Add CSS class dynamically to handle the revealed state
    const style = document.createElement('style');
    style.innerHTML = `
        .reveal {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // Form submission handling (Prevent default to keep it static for now)
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button');
            const originalText = btn.textContent;

            btn.textContent = 'Courier Dispatched...';
            btn.style.backgroundColor = 'var(--clr-accent)';
            btn.style.color = 'var(--clr-bg-dark)';

            setTimeout(() => {
                btn.textContent = 'Message Sent';
                form.reset();

                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.backgroundColor = '';
                    btn.style.color = '';
                }, 3000);
            }, 1500);
        });
    }

    // Certificate Modal Logic
    const certButtons = document.querySelectorAll('.cert-btn');
    const modal = document.getElementById('cert-modal');
    const certImage = document.getElementById('cert-image');
    const closeModal = document.querySelector('.close-modal');

    if (certButtons.length > 0 && modal && certImage && closeModal) {
        // Open Modal
        certButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const imgSrc = btn.getAttribute('data-cert-src');
                if (imgSrc) {
                    certImage.src = imgSrc;
                    modal.classList.add('show');
                    document.body.style.overflow = 'hidden'; // Prevent background scrolling
                }
            });
        });

        // Close Modal via button
        closeModal.addEventListener('click', () => {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto'; // Restore scrolling
            setTimeout(() => certImage.src = '', 300); // Clear src after animation
        });

        // Close Modal on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                document.body.style.overflow = 'auto';
                setTimeout(() => certImage.src = '', 300);
            }
        });

        // Close Modal on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                modal.classList.remove('show');
                document.body.style.overflow = 'auto';
                setTimeout(() => certImage.src = '', 300);
            }
        });
    }

    // Project Modal Logic
    const projectButtons = document.querySelectorAll('.project-more-btn');
    const projectModal = document.getElementById('project-modal');
    const projectDetailsBody = document.getElementById('project-details-body');
    const closeProjectModal = document.querySelector('.close-project-modal');

    if (projectButtons.length > 0 && projectModal && projectDetailsBody && closeProjectModal) {

        const openProject = (projectId) => {
            const template = document.getElementById(`${projectId}-template`);
            if (template) {
                // Clear previous and inject new content
                projectDetailsBody.innerHTML = '';
                const clone = template.content.cloneNode(true);
                projectDetailsBody.appendChild(clone);

                // Re-initialize feather icons in the modal
                if (window.feather) {
                    window.feather.replace();
                }

                projectModal.classList.add('show');
                document.body.style.overflow = 'hidden';
            }
        };

        const closeProject = () => {
            projectModal.classList.remove('show');
            document.body.style.overflow = 'auto';
        };

        projectButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const projectId = btn.getAttribute('data-project-id');
                openProject(projectId);
            });
        });

        closeProjectModal.addEventListener('click', closeProject);

        projectModal.addEventListener('click', (e) => {
            if (e.target === projectModal) {
                closeProject();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && projectModal.classList.contains('show')) {
                closeProject();
            }
        });
    }

    // Contact Form & EmailJS Integration
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formStatus = document.getElementById('form-status');

    if (contactForm && submitBtn && formStatus) {
        // Initialize EmailJS with your Public Key
        // REPLACE 'YOUR_PUBLIC_KEY' with your actual EmailJS Public Key
        emailjs.init({
            publicKey: "YOUR_PUBLIC_KEY",
        });

        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();

            // UI State: Loading
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoader = submitBtn.querySelector('.btn-loader');

            submitBtn.disabled = true;
            btnText.textContent = 'Sending...';
            btnLoader.style.display = 'inline-flex';
            formStatus.style.display = 'none';
            formStatus.className = 'form-status';

            // Send Email using EmailJS
            // REPLACE 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with your actual IDs
            emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', this)
                .then(() => {
                    // Success
                    formStatus.textContent = 'Message sent successfully. I will get back to you soon.';
                    formStatus.classList.add('success');
                    contactForm.reset();
                })
                .catch((error) => {
                    // Error
                    console.error('EmailJS Error:', error);
                    formStatus.textContent = 'Oops! Something went wrong. Please try again later.';
                    formStatus.classList.add('error');
                })
                .finally(() => {
                    // Restore UI State
                    submitBtn.disabled = false;
                    btnText.textContent = 'Send Message';
                    btnLoader.style.display = 'none';

                    // Smooth scroll to status message
                    formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                });
        });
    }

});

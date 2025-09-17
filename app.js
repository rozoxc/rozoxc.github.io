// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initTypingAnimation();
    initScrollAnimations();
    initSkillBars();
    initStatCounters();
    initContactForm();
    initSmoothScrolling();
});

// Navigation functionality
function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    // Hamburger menu toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(15, 15, 15, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 255, 65, 0.1)';
        } else {
            navbar.style.background = 'rgba(26, 26, 26, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Active nav link highlighting
    window.addEventListener('scroll', throttle(function() {
        let current = '';
        const sections = document.querySelectorAll('section');
        const scrollPos = window.pageYOffset;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }, 100));
}

// Typing animation in hero section
function initTypingAnimation() {
    const typedTextElement = document.getElementById('typed-text');
    const roles = [
        'Ethical Hacker',
        'Security Consultant', 
        'Vulnerability Assessment Expert',
        'Red Team Operator'
    ];
    
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;
    
    function typeAnimation() {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            typedTextElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            typedTextElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }
        
        if (!isDeleting && charIndex === currentRole.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 500; // Pause before next word
        }
        
        setTimeout(typeAnimation, typeSpeed);
    }
    
    // Start typing animation
    typeAnimation();
}

// Scroll animations using Intersection Observer
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, observerOptions);

    // Observe elements for fade-in animation
    const animateElements = document.querySelectorAll('.service-card, .project-card, .contact-item');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // Observe section headers
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach(header => {
        header.classList.add('fade-in');
        observer.observe(header);
    });
}

// Skill bars animation
function initSkillBars() {
    const skillObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillBars = entry.target.querySelectorAll('.skill-progress');
                skillBars.forEach(bar => {
                    const width = bar.getAttribute('data-width');
                    requestAnimationFrame(() => {
                        bar.style.width = width + '%';
                        bar.classList.add('skill-animate');
                    });
                });
            }
        });
    }, { threshold: 0.5 });

    const skillsSection = document.querySelector('.skills');
    if (skillsSection) {
        skillObserver.observe(skillsSection);
    }
}

// Animated counters for statistics
function initStatCounters() {
    const statObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(stat => {
                    const target = parseInt(stat.getAttribute('data-target'));
                    animateCounter(stat, target, 2000);
                });
            }
        });
    }, { threshold: 0.5 });

    const aboutSection = document.querySelector('.about');
    if (aboutSection) {
        statObserver.observe(aboutSection);
    }
}

function animateCounter(element, target, duration) {
    let start = 0;
    const increment = target / (duration / 16);

    function update() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(update);
        } else {
            element.textContent = target;
        }
    }

    requestAnimationFrame(update);
}

// Contact form functionality
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form elements
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const subject = document.getElementById('subject');
            const message = document.getElementById('message');
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            
            // Clear previous errors
            clearFormErrors();
            
            // Validate form
            let isValid = true;
            
            if (!name.value.trim()) {
                showFormError(name, 'Name is required');
                isValid = false;
            }
            
            if (!email.value.trim()) {
                showFormError(email, 'Email is required');
                isValid = false;
            } else if (!isValidEmail(email.value)) {
                showFormError(email, 'Please enter a valid email');
                isValid = false;
            }
            
            if (!subject.value.trim()) {
                showFormError(subject, 'Subject is required');
                isValid = false;
            }
            
            if (!message.value.trim()) {
                showFormError(message, 'Message is required');
                isValid = false;
            } else if (message.value.trim().length < 10) {
                showFormError(message, 'Message must be at least 10 characters');
                isValid = false;
            }
            
            if (isValid) {
                // Simulate form submission
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;
                
                setTimeout(() => {
                    showSuccessMessage('Message sent successfully! I\'ll get back to you soon.');
                    contactForm.reset();
                    submitBtn.textContent = 'Send Message';
                    submitBtn.disabled = false;
                }, 1500);
            }
        });
    }
}

// Form validation helper functions
function showFormError(input, message) {
    const formGroup = input.parentElement;
    const existingError = formGroup.querySelector('.error-message');
    
    if (existingError) existingError.remove();
    
    const errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = '#ff4757';
    errorElement.style.fontSize = '0.875rem';
    errorElement.style.marginTop = '0.25rem';
    errorElement.style.display = 'block';
    
    formGroup.appendChild(errorElement);
    input.style.borderColor = '#ff4757';
}

function clearFormErrors() {
    document.querySelectorAll('.error-message').forEach(err => err.remove());
    document.querySelectorAll('.form-control').forEach(input => {
        input.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    });
}

function showSuccessMessage(message) {
    const contactForm = document.getElementById('contact-form');
    const existingSuccess = document.querySelector('.success-message');
    if (existingSuccess) existingSuccess.remove();

    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.textContent = message;
    successElement.style.background = 'rgba(0, 255, 65, 0.1)';
    successElement.style.border = '1px solid rgba(0, 255, 65, 0.3)';
    successElement.style.color = '#00ff41';
    successElement.style.padding = '1rem';
    successElement.style.borderRadius = '8px';
    successElement.style.marginBottom = '2rem';
    successElement.style.textAlign = 'center';
    successElement.style.animation = 'fadeIn 0.4s ease';

    contactForm.insertBefore(successElement, contactForm.firstChild);
    
    setTimeout(() => successElement.remove(), 5000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Smooth scrolling for navigation links & hero buttons
function initSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Ensure href is not just '#'
            const hash = this.getAttribute('href');
            if (hash.length > 1) {
                e.preventDefault();
                const targetSection = document.querySelector(hash);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
}

// Utility: Throttle
function throttle(fn, wait) {
    let last = 0;
    return function(...args) {
        const now = Date.now();
        if (now - last >= wait) {
            last = now;
            fn.apply(this, args);
        }
    };
}

// Project buttons functionality
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('project-btn')) {
        e.preventDefault();
        
        const projectCard = e.target.closest('.project-card');
        const projectTitle = projectCard.querySelector('.project-title').textContent;
        showProjectModal(projectTitle, projectCard);
    }

    if (e.target.classList.contains('download-btn')) {
        e.preventDefault();
        const button = e.target;
        const originalText = button.textContent;
        button.textContent = 'Downloading...';
        button.disabled = true;
        setTimeout(() => {
            button.textContent = 'Downloaded!';
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
            }, 2000);
        }, 1500);
    }
});

// Project modal functionality
function showProjectModal(title, projectCard) {
    const description = projectCard.querySelector('.project-description').textContent;
    const techTags = Array.from(projectCard.querySelectorAll('.tech-tag')).map(tag => tag.textContent);

    const modal = document.createElement('div');
    modal.className = 'project-modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>${description}</p>
                    <div class="modal-tech">
                        <h4>Technologies Used:</h4>
                        <div class="tech-list">
                            ${techTags.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                        </div>
                    </div>
                    <div class="modal-details">
                        <h4>Project Details:</h4>
                        <p>This project demonstrates advanced cybersecurity techniques and methodologies. For detailed information and case studies, please contact me directly.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn--primary contact-btn">Contact for Details</button>
                    <button class="btn btn--outline modal-close-btn">Close</button>
                </div>
            </div>
        </div>
    `;

    injectModalStyles();
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    function closeModal() {
        modal.remove();
        document.body.style.overflow = '';
    }

    modal.querySelectorAll('.modal-close, .modal-close-btn').forEach(btn => btn.addEventListener('click', closeModal));
    modal.querySelector('.modal-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
    modal.querySelector('.contact-btn').addEventListener('click', () => {
        closeModal();
        document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
    });

    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

function injectModalStyles() {
    if (document.getElementById('modal-styles')) return;
    const style = document.createElement('style');
    style.id = 'modal-styles';
    style.textContent = `
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; padding: 2rem; z-index: 1000; }
        .modal-content { background: #1a1a1a; border-radius: 12px; border: 1px solid rgba(0,255,65,0.3); max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto; animation: modalSlideIn 0.3s ease; }
        @keyframes modalSlideIn { from { opacity:0; transform: translateY(-50px) scale(0.9); } to { opacity:1; transform: translateY(0) scale(1); } }
        .modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; }
        .modal-header h3 { color: #00ff41; font-size: 1.4rem; margin:0; }
        .modal-close { background:none; border:none; color:#ccc; font-size:1.8rem; cursor:pointer; transition:0.3s; }
        .modal-close:hover { color:#00ff41; }
        .modal-body { padding:2rem; color:#ccc; }
        .modal-tech h4, .modal-details h4 { color:#00ff41; margin-bottom:1rem; font-size:1.2rem; }
        .tech-list { display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:2rem; }
        .modal-footer { padding:1rem 2rem 2rem; display:flex; gap:1rem; justify-content:flex-end; }
        @media(max-width:768px){ .modal-content{ margin:1rem; } .modal-footer{ flex-direction:column; } }
    `;
    document.head.appendChild(style);
}

// Parallax effect for hero section
window.addEventListener('scroll', debounce(function() {
    const scrolled = window.pageYOffset;
    const matrixBg = document.querySelector('.matrix-bg');
    if (matrixBg) {
        const rate = scrolled * -0.2;
        matrixBg.style.transform = `translate3d(0, ${rate}px, 0)`;
    }
}, 10));

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
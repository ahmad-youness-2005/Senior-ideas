// Global variables
let currentUser = null;
let ideas = JSON.parse(localStorage.getItem('ideas')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];

// Allowed admin emails
const ALLOWED_ADMIN_EMAILS = [
    'younes.ahmad2024@gmail.com',
    'Adamyf2005@hotmail.com',
    'Hussein.m.jaber23@gmail.com',
    'ay589641@gmail.com',
    'Y2005baba@gmail.com'
];

// DOM Elements
const navAuth = document.getElementById('nav-auth');
const navUser = document.getElementById('nav-user');
const userName = document.getElementById('user-name');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const getStartedBtn = document.getElementById('get-started-btn');
const learnMoreBtn = document.getElementById('learn-more-btn');

// Modals
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');

// Forms
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const ideaForm = document.getElementById('idea-form');


// Messages
const successMessage = document.getElementById('success-message');
const successText = document.getElementById('success-text');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    setupEventListeners();
    loadIdeas();
});

// Check authentication status
function checkAuthStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateNavForLoggedInUser();
    }
}

// Update navigation for logged in user
function updateNavForLoggedInUser() {
    navAuth.style.display = 'none';
    navUser.style.display = 'flex';
    userName.textContent = currentUser.name;
}

// Update navigation for logged out user
function updateNavForLoggedOutUser() {
    navAuth.style.display = 'flex';
    navUser.style.display = 'none';
    currentUser = null;
    localStorage.removeItem('currentUser');
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    loginBtn.addEventListener('click', () => openModal(loginModal));
    signupBtn.addEventListener('click', () => openModal(signupModal));
    logoutBtn.addEventListener('click', logout);
    
    // Hero buttons
    getStartedBtn.addEventListener('click', () => {
        if (currentUser) {
            document.getElementById('submit').scrollIntoView({ behavior: 'smooth' });
        } else {
            openModal(signupModal);
        }
    });
    
    learnMoreBtn.addEventListener('click', () => {
        document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Modal close buttons
    document.getElementById('login-close').addEventListener('click', () => closeModal(loginModal));
    document.getElementById('signup-close').addEventListener('click', () => closeModal(signupModal));
    
    // Auth form switches
    document.getElementById('switch-to-signup').addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(loginModal);
        openModal(signupModal);
    });
    
    document.getElementById('switch-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(signupModal);
        openModal(loginModal);
    });
    
    // Form submissions
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    ideaForm.addEventListener('submit', handleIdeaSubmission);
    
    // Mobile menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
}

// Modal functions
function openModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        updateNavForLoggedInUser();
        closeModal(loginModal);
        showMessage('Login successful!', 'success');
        loginForm.reset();
    } else {
        showMessage('Invalid email or password', 'error');
    }
}

// Handle signup
function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    
    // Validation
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        showMessage('User with this email already exists', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: 'user-' + Date.now(),
        name: name,
        email: email,
        password: password,
        isAdmin: ALLOWED_ADMIN_EMAILS.includes(email),
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    updateNavForLoggedInUser();
    closeModal(signupModal);
    showMessage('Account created successfully!', 'success');
    signupForm.reset();
}

// Handle logout
function logout() {
    updateNavForLoggedOutUser();
    showMessage('Logged out successfully', 'success');
}

// Handle idea submission
function handleIdeaSubmission(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showMessage('Please login to submit an idea', 'error');
        openModal(loginModal);
        return;
    }
    
    const formData = new FormData(ideaForm);
    const idea = {
        id: 'idea-' + Date.now(),
        title: formData.get('title'),
        category: formData.get('category'),
        description: formData.get('description'),
        impact: formData.get('impact'),
        contact: formData.get('contact'),
        author: currentUser.name,
        authorEmail: currentUser.email,
        createdAt: new Date().toISOString(),
        status: 'pending'
    };
    
    ideas.push(idea);
    localStorage.setItem('ideas', JSON.stringify(ideas));
    
    ideaForm.reset();
    showMessage('Idea submitted successfully!', 'success');
}


// Utility functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showMessage(message, type) {
    const messageElement = type === 'success' ? successMessage : errorMessage;
    const textElement = type === 'success' ? successText : errorText;
    
    textElement.textContent = message;
    messageElement.style.display = 'flex';
    
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 4000);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add some interactive animations
document.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero');
    const speed = scrolled * 0.5;
    
    if (parallax) {
        parallax.style.transform = `translateY(${speed}px)`;
    }
});

// Add loading animation for form submissions
function addLoadingState(button) {
    const originalText = button.textContent;
    button.textContent = 'Loading...';
    button.disabled = true;
    
    return () => {
        button.textContent = originalText;
        button.disabled = false;
    };
}

// Enhanced form validation
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            input.style.borderColor = '#e5e7eb';
        }
    });
    
    return isValid;
}

// Add form validation to all forms
[loginForm, signupForm, ideaForm].forEach(form => {
    if (form) {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
                showMessage('Please fill in all required fields', 'error');
            }
        });
    }
});

// Add real-time validation
document.querySelectorAll('input, select, textarea').forEach(input => {
    input.addEventListener('blur', function() {
        if (this.hasAttribute('required') && !this.value.trim()) {
            this.style.borderColor = '#ef4444';
        } else {
            this.style.borderColor = '#e5e7eb';
        }
    });
    
    input.addEventListener('input', function() {
        if (this.style.borderColor === 'rgb(239, 68, 68)') {
            this.style.borderColor = '#e5e7eb';
        }
    });
});

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal[style*="block"]');
        if (openModal) {
            closeModal(openModal);
        }
    }
});

// Add accessibility improvements
function addAriaLabels() {
    const hamburger = document.getElementById('hamburger');
    if (hamburger) {
        hamburger.setAttribute('aria-label', 'Toggle navigation menu');
        hamburger.setAttribute('aria-expanded', 'false');
    }
    
    // Update aria-expanded when menu is toggled
    const navMenu = document.getElementById('nav-menu');
    if (navMenu) {
        const hamburger = document.getElementById('hamburger');
        hamburger.addEventListener('click', () => {
            const isActive = navMenu.classList.contains('active');
            hamburger.setAttribute('aria-expanded', isActive);
        });
    }
}

// Initialize accessibility features
addAriaLabels();
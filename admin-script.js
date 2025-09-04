// Admin Panel JavaScript
let currentAdmin = null;
let ideas = [];
let users = [];

// DOM Elements
const adminLogin = document.getElementById('admin-login');
const adminDashboard = document.getElementById('admin-dashboard');
const adminLoginForm = document.getElementById('admin-login-form');
const logoutBtn = document.getElementById('logout-btn');
const ideasContainer = document.getElementById('ideas-container');
const ideaSearch = document.getElementById('idea-search');
const categoryFilter = document.getElementById('category-filter');
const sortFilter = document.getElementById('sort-filter');
const exportBtn = document.getElementById('export-btn');
const gridViewBtn = document.getElementById('grid-view');
const listViewBtn = document.getElementById('list-view');
const ideaModal = document.getElementById('idea-modal');
const ideaModalClose = document.getElementById('idea-modal-close');
const modalIdeaTitle = document.getElementById('modal-idea-title');
const modalIdeaContent = document.getElementById('modal-idea-content');

// Stats elements
const totalIdeas = document.getElementById('total-ideas');
const todayIdeas = document.getElementById('today-ideas');
const totalUsers = document.getElementById('total-users');
const activeCategories = document.getElementById('active-categories');

// Messages
const successMessage = document.getElementById('success-message');
const successText = document.getElementById('success-text');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    // Clear any existing admin session to force fresh login
    localStorage.removeItem('currentAdmin');
    
    loadData();
    checkAdminAuth();
    setupEventListeners();
});

// Allowed admin emails
const ALLOWED_ADMIN_EMAILS = [
    'younes.ahmad2024@gmail.com',
    'Adamyf2005@hotmail.com',
    'Hussein.m.jaber23@gmail.com',
    'ay589641@gmail.com',
    'Y2005baba@gmail.com'
];

// Load data from localStorage
function loadData() {
    ideas = JSON.parse(localStorage.getItem('ideas')) || [];
    users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Ensure all admin users exist and update their passwords
    ALLOWED_ADMIN_EMAILS.forEach((email, index) => {
        const existingAdmin = users.find(u => u.email === email);
        if (!existingAdmin) {
            const adminUser = {
                id: `admin-${index + 1}`,
                name: `Admin User ${index + 1}`,
                email: email,
                password: 'admin123',
                isAdmin: true,
                createdAt: new Date().toISOString()
            };
            users.push(adminUser);
        } else {
            // Update existing admin user to ensure correct password and admin status
            existingAdmin.password = 'admin123';
            existingAdmin.isAdmin = true;
        }
    });
    
    // Save updated users array
    localStorage.setItem('users', JSON.stringify(users));
}

// Check if admin is already logged in
function checkAdminAuth() {
    const savedAdmin = localStorage.getItem('currentAdmin');
    if (savedAdmin) {
        const admin = JSON.parse(savedAdmin);
        if (admin.isAdmin && ALLOWED_ADMIN_EMAILS.includes(admin.email)) {
            currentAdmin = admin;
            showDashboard();
        } else {
            // Clear invalid admin session
            localStorage.removeItem('currentAdmin');
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    adminLoginForm.addEventListener('submit', handleAdminLogin);
    
    // Logout
    logoutBtn.addEventListener('click', handleLogout);
    
    // Search and filters
    ideaSearch.addEventListener('input', filterIdeas);
    categoryFilter.addEventListener('change', filterIdeas);
    sortFilter.addEventListener('change', filterIdeas);
    
    // View controls
    gridViewBtn.addEventListener('click', () => switchView('grid'));
    listViewBtn.addEventListener('click', () => switchView('list'));
    
    // Export
    exportBtn.addEventListener('click', exportIdeas);
    
    // Modal
    ideaModalClose.addEventListener('click', () => closeModal(ideaModal));
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === ideaModal) {
            closeModal(ideaModal);
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(ideaModal);
        }
    });
}

// Handle admin login
function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    
    console.log('Login attempt:', { email, password });
    console.log('Allowed emails:', ALLOWED_ADMIN_EMAILS);
    console.log('Users in system:', users);
    
    // Check if email is in allowed list
    if (!ALLOWED_ADMIN_EMAILS.includes(email)) {
        showMessage('Access denied. Your email is not authorized for admin access.', 'error');
        return;
    }
    
    const admin = users.find(u => u.email === email && u.password === password && u.isAdmin);
    console.log('Found admin:', admin);
    
    if (admin) {
        currentAdmin = admin;
        localStorage.setItem('currentAdmin', JSON.stringify(admin));
        showDashboard();
        showMessage('Welcome to the admin panel!', 'success');
    } else {
        // More specific error message
        const userExists = users.find(u => u.email === email);
        if (userExists) {
            showMessage('Invalid password for this email address', 'error');
        } else {
            showMessage('Admin user not found. Please refresh the page and try again.', 'error');
        }
    }
}

// Handle logout
function handleLogout() {
    currentAdmin = null;
    localStorage.removeItem('currentAdmin');
    showLogin();
    showMessage('Logged out successfully', 'success');
}

// Show login screen
function showLogin() {
    adminLogin.style.display = 'block';
    adminDashboard.style.display = 'none';
    adminLoginForm.reset();
}

// Show dashboard
function showDashboard() {
    adminLogin.style.display = 'none';
    adminDashboard.style.display = 'block';
    updateStats();
    loadIdeas();
}

// Update dashboard statistics
function updateStats() {
    // Total ideas
    totalIdeas.textContent = ideas.length;
    
    // Today's ideas
    const today = new Date().toDateString();
    const todayIdeasCount = ideas.filter(idea => 
        new Date(idea.createdAt).toDateString() === today
    ).length;
    todayIdeas.textContent = todayIdeasCount;
    
    // Total users
    totalUsers.textContent = users.length;
    
    // Active categories
    const categories = new Set(ideas.map(idea => idea.category));
    activeCategories.textContent = categories.size;
}

// Load and display ideas
function loadIdeas() {
    ideasContainer.innerHTML = '';
    
    if (ideas.length === 0) {
        ideasContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #64748b;">
                <i class="fas fa-lightbulb" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                <h3>No ideas submitted yet</h3>
                <p>Ideas will appear here once users start submitting them.</p>
            </div>
        `;
        return;
    }
    
    // Sort ideas based on selected option
    const sortedIdeas = sortIdeas([...ideas]);
    
    sortedIdeas.forEach(idea => {
        const ideaElement = createIdeaElement(idea);
        ideasContainer.appendChild(ideaElement);
    });
}

// Sort ideas based on selected option
function sortIdeas(ideasArray) {
    const sortBy = sortFilter.value;
    
    switch (sortBy) {
        case 'newest':
            return ideasArray.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        case 'oldest':
            return ideasArray.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        case 'category':
            return ideasArray.sort((a, b) => a.category.localeCompare(b.category));
        case 'author':
            return ideasArray.sort((a, b) => a.author.localeCompare(b.author));
        default:
            return ideasArray;
    }
}

// Create idea element
function createIdeaElement(idea) {
    const div = document.createElement('div');
    div.className = 'idea-card';
    div.addEventListener('click', () => showIdeaDetail(idea));
    
    const isGridView = ideasContainer.classList.contains('grid-view');
    
    div.innerHTML = `
        <div class="idea-header">
            <h3 class="idea-title">${escapeHtml(idea.title)}</h3>
            <span class="idea-category">${idea.category}</span>
        </div>
        <div class="idea-content">
            <p class="idea-description">${escapeHtml(idea.description)}</p>
            ${idea.impact ? `<p style="margin-bottom: 10px; color: #64748b;"><strong>Expected Impact:</strong> ${escapeHtml(idea.impact)}</p>` : ''}
        </div>
        <div class="idea-meta">
            <span class="idea-date">${formatDate(idea.createdAt)}</span>
            <span class="idea-author">By: ${escapeHtml(idea.author)}</span>
            ${idea.contact ? `<span class="idea-contact">Contact: ${escapeHtml(idea.contact)}</span>` : ''}
        </div>
    `;
    
    return div;
}

// Filter ideas
function filterIdeas() {
    const searchTerm = ideaSearch.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    
    const filteredIdeas = ideas.filter(idea => {
        const matchesSearch = idea.title.toLowerCase().includes(searchTerm) ||
                           idea.description.toLowerCase().includes(searchTerm) ||
                           idea.author.toLowerCase().includes(searchTerm) ||
                           (idea.impact && idea.impact.toLowerCase().includes(searchTerm));
        
        const matchesCategory = !selectedCategory || idea.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });
    
    displayFilteredIdeas(filteredIdeas);
}

// Display filtered ideas
function displayFilteredIdeas(filteredIdeas) {
    ideasContainer.innerHTML = '';
    
    if (filteredIdeas.length === 0) {
        ideasContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #64748b;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                <h3>No ideas match your search</h3>
                <p>Try adjusting your search criteria or filters.</p>
            </div>
        `;
        return;
    }
    
    const sortedIdeas = sortIdeas(filteredIdeas);
    
    sortedIdeas.forEach(idea => {
        const ideaElement = createIdeaElement(idea);
        ideasContainer.appendChild(ideaElement);
    });
}

// Switch between grid and list view
function switchView(view) {
    if (view === 'grid') {
        ideasContainer.classList.remove('list-view');
        ideasContainer.classList.add('grid-view');
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
    } else {
        ideasContainer.classList.remove('grid-view');
        ideasContainer.classList.add('list-view');
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
    }
}

// Show idea detail modal
function showIdeaDetail(idea) {
    modalIdeaTitle.textContent = idea.title;
    
    modalIdeaContent.innerHTML = `
        <div style="margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <span class="idea-category" style="font-size: 0.9rem;">${idea.category}</span>
                <span style="color: #64748b; font-size: 0.9rem;">${formatDate(idea.createdAt)}</span>
            </div>
            <h3 style="color: #1e293b; margin-bottom: 15px;">Description</h3>
            <p style="color: #64748b; line-height: 1.6; margin-bottom: 20px;">${escapeHtml(idea.description)}</p>
            
            ${idea.impact ? `
                <h3 style="color: #1e293b; margin-bottom: 15px;">Expected Impact</h3>
                <p style="color: #64748b; line-height: 1.6; margin-bottom: 20px;">${escapeHtml(idea.impact)}</p>
            ` : ''}
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
                <h3 style="color: #1e293b; margin-bottom: 15px;">Author Information</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div>
                        <strong>Name:</strong><br>
                        <span style="color: #64748b;">${escapeHtml(idea.author)}</span>
                    </div>
                    <div>
                        <strong>Email:</strong><br>
                        <span style="color: #64748b;">${escapeHtml(idea.authorEmail)}</span>
                    </div>
                    ${idea.contact ? `
                        <div>
                            <strong>Contact:</strong><br>
                            <span style="color: #64748b;">${escapeHtml(idea.contact)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    openModal(ideaModal);
}

// Export ideas to CSV
function exportIdeas() {
    if (ideas.length === 0) {
        showMessage('No ideas to export', 'error');
        return;
    }
    
    const csvContent = generateCSV(ideas);
    downloadCSV(csvContent, 'senior-ideas-export.csv');
    showMessage('Ideas exported successfully!', 'success');
}

// Generate CSV content
function generateCSV(ideasArray) {
    const headers = ['Title', 'Category', 'Description', 'Expected Impact', 'Author', 'Author Email', 'Contact', 'Date Submitted'];
    const csvRows = [headers.join(',')];
    
    ideasArray.forEach(idea => {
        const row = [
            `"${idea.title.replace(/"/g, '""')}"`,
            `"${idea.category}"`,
            `"${idea.description.replace(/"/g, '""')}"`,
            `"${(idea.impact || '').replace(/"/g, '""')}"`,
            `"${idea.author.replace(/"/g, '""')}"`,
            `"${idea.authorEmail}"`,
            `"${(idea.contact || '').replace(/"/g, '""')}"`,
            `"${formatDate(idea.createdAt)}"`
        ];
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

// Download CSV file
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

// Auto-refresh data every 30 seconds
setInterval(() => {
    if (currentAdmin) {
        loadData();
        updateStats();
        loadIdeas();
    }
}, 30000);

// Add real-time updates when data changes
window.addEventListener('storage', (e) => {
    if (e.key === 'ideas' && currentAdmin) {
        loadData();
        updateStats();
        loadIdeas();
    }
});
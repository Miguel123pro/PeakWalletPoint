// Simple, clean sidebar.js - Replace your current sidebar.js with this

document.addEventListener('DOMContentLoaded', function () {
    // Remove any existing toggle buttons first
    const existingToggle = document.querySelector('.sidebar-toggle');
    if (existingToggle) {
        existingToggle.remove();
    }

    // Create new toggle button with proper positioning
    createProperToggleButton();
    setupSidebarFunctionality();
});

// Create the toggle button and add to body
function createProperToggleButton() {
    const sidebar = document.querySelector('.sidebar');

    // Create the toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'sidebar-toggle-fixed';
    toggleBtn.innerHTML = '<span>‹</span>';
    toggleBtn.setAttribute('aria-label', 'Toggle sidebar');

    // Add styles directly to avoid CSS conflicts
    toggleBtn.style.cssText = `
        position: fixed;
        top: 30px;
        left: 60px;
        width: 28px;
        height: 28px;
        background: var(--surface);
        border: 2px solid var(--border-default);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 1000;
        color: var(--text-secondary);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        transition: all 200ms ease;
        font-size: 12px;
        font-weight: 700;
    `;

    // Add to document body so it's not affected by sidebar overflow
    document.body.appendChild(toggleBtn);

    // Position adjustment based on sidebar state
    updateTogglePosition();

    return toggleBtn;
}

function setupSidebarFunctionality() {
    const appContainer = document.querySelector('.app-container');
    const toggleBtn = document.querySelector('.sidebar-toggle-fixed');

    if (!toggleBtn) return;

    // Toggle functionality
    toggleBtn.addEventListener('click', function () {
        appContainer.classList.toggle('sidebar-expanded');

        // Update button position and icon
        updateTogglePosition();

        // Save preference
        localStorage.setItem('sidebar-expanded',
            appContainer.classList.contains('sidebar-expanded'));
    });

    // Hover effects
    toggleBtn.addEventListener('mouseenter', function () {
        this.style.background = 'var(--accent-blue)';
        this.style.borderColor = 'var(--accent-blue)';
        this.style.color = 'white';
        this.style.transform = 'scale(1.1)';
    });

    toggleBtn.addEventListener('mouseleave', function () {
        this.style.background = 'var(--surface)';
        this.style.borderColor = 'var(--border-default)';
        this.style.color = 'var(--text-secondary)';
        this.style.transform = 'scale(1)';
    });

    // Restore saved state
    const savedState = localStorage.getItem('sidebar-expanded');
    if (savedState === 'true' || (savedState === null && window.innerWidth > 1200)) {
        appContainer.classList.add('sidebar-expanded');
        updateTogglePosition();
    }

    // Keyboard shortcut
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            toggleBtn.click();
        }
    });

    // Window resize handler
    window.addEventListener('resize', function () {
        updateTogglePosition();

        if (window.innerWidth <= 768) {
            toggleBtn.style.display = 'none';
            appContainer.classList.remove('sidebar-expanded');
        } else {
            toggleBtn.style.display = 'flex';
            if (window.innerWidth > 1200 &&
                localStorage.getItem('sidebar-expanded') !== 'false') {
                appContainer.classList.add('sidebar-expanded');
                updateTogglePosition();
            }
        }
    });
}

function updateTogglePosition() {
    const toggleBtn = document.querySelector('.sidebar-toggle-fixed');
    const appContainer = document.querySelector('.app-container');

    if (!toggleBtn) return;

    const isExpanded = appContainer.classList.contains('sidebar-expanded');

    if (isExpanded) {
        // When expanded, position on the right edge of sidebar
        toggleBtn.style.left = '268px'; // 280px - 12px
        toggleBtn.innerHTML = '<span style="transform: rotate(180deg);">‹</span>';
    } else {
        // When collapsed, position on the right edge of collapsed sidebar
        toggleBtn.style.left = '60px'; // 72px - 12px
        toggleBtn.innerHTML = '<span>‹</span>';
    }
}

// Setup navigation tooltips and interactions
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        // Set tooltip from span text
        const spanText = item.querySelector('span');
        if (spanText) {
            item.setAttribute('data-tooltip', spanText.textContent);
        }

        // Click handler
        item.addEventListener('click', function () {
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            // Update page title
            const pageTitle = document.getElementById('pageTitle');
            if (pageTitle && spanText) {
                pageTitle.textContent = spanText.textContent;
            }
        });
    });
}

// Initialize navigation
setupNavigation();
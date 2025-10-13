// Clean, professional sidebar.js with better toggle design

document.addEventListener('DOMContentLoaded', function () {
    // Remove any existing toggle buttons first
    const existingToggle = document.querySelector('.sidebar-toggle-fixed');
    if (existingToggle) {
        existingToggle.remove();
    }

    // Create new toggle button with better design
    createToggleButton();
    setupSidebarFunctionality();
    setupNavigation();
});

// Create a clean toggle button on the right edge of sidebar
function createToggleButton() {
    const sidebar = document.querySelector('.sidebar');

    // Create the toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'sidebar-toggle-fixed';
    toggleBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12L6 8L10 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    toggleBtn.setAttribute('aria-label', 'Toggle sidebar');

    // Cleaner, more modern styling
    toggleBtn.style.cssText = `
        position: fixed;
        top: 50%;
        left: 60px;
        transform: translateY(-50%);
        width: 32px;
        height: 48px;
        background: var(--surface);
        border: 1px solid var(--border-default);
        border-radius: 0 8px 8px 0;
        border-left: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 1000;
        color: var(--text-secondary);
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
        transition: all 250ms ease;
    `;

    // Add to body so it's always visible
    document.body.appendChild(toggleBtn);

    // Update position based on state
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
        this.style.boxShadow = '2px 0 12px rgba(59, 130, 246, 0.3)';
    });

    toggleBtn.addEventListener('mouseleave', function () {
        this.style.background = 'var(--surface)';
        this.style.borderColor = 'var(--border-default)';
        this.style.color = 'var(--text-secondary)';
        this.style.boxShadow = '2px 0 8px rgba(0, 0, 0, 0.1)';
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
        }
    });
}

function updateTogglePosition() {
    const toggleBtn = document.querySelector('.sidebar-toggle-fixed');
    const appContainer = document.querySelector('.app-container');

    if (!toggleBtn) return;

    const isExpanded = appContainer.classList.contains('sidebar-expanded');

    // Smooth transition between states
    if (isExpanded) {
        toggleBtn.style.left = '228px'; // 240px - 12px
        toggleBtn.querySelector('svg').style.transform = 'rotate(180deg)';
    } else {
        toggleBtn.style.left = '60px'; // 72px - 12px
        toggleBtn.querySelector('svg').style.transform = 'rotate(0deg)';
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
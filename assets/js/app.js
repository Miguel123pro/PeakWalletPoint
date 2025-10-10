/**
 * FinancePro - Professional Finance Management Application
 * Main Application Controller
 * 
 * @version 2.0.0
 * @author Your Name
 */

class FinanceProApp {
    constructor() {
        this.currentTab = 'dashboard';
        this.isLoading = true;
        this.theme = 'dark';

        // Initialize components
        this.dashboard = null;
        this.transactions = null;
        this.goals = null;
        this.routines = null;
        this.reports = null;

        // Initialize the application
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Show loading screen
            this.showLoading();

            // Initialize theme
            await this.initializeTheme();

            // Initialize storage
            await Storage.init();

            // Initialize components
            await this.initializeComponents();

            // Setup event listeners
            this.setupEventListeners();

            // Load initial data
            await this.loadInitialData();

            // Hide loading screen
            this.hideLoading();

            console.log('FinancePro initialized successfully');
        } catch (error) {
            console.error('Failed to initialize FinancePro:', error);
            this.showNotification('Failed to initialize application', 'danger');
        }
    }

    /**
     * Show loading screen
     */
    showLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        const appContainer = document.getElementById('appContainer');

        if (loadingOverlay) {
            loadingOverlay.classList.remove('hidden');
        }

        if (appContainer) {
            appContainer.classList.remove('loaded');
        }
    }

    /**
     * Hide loading screen
     */
    hideLoading() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        const appContainer = document.getElementById('appContainer');

        setTimeout(() => {
            if (loadingOverlay) {
                loadingOverlay.classList.add('hidden');
            }

            if (appContainer) {
                appContainer.classList.add('loaded');
            }

            this.isLoading = false;
        }, 800);
    }

    /**
     * Initialize theme system
     */
    async initializeTheme() {
        const savedTheme = localStorage.getItem('financepro-theme') || 'dark';
        this.theme = savedTheme;

        document.body.className = `${savedTheme}-theme`;

        // Update theme toggle icon
        this.updateThemeToggle();
    }

    /**
     * Initialize all components
     */
    async initializeComponents() {
        try {
            // Initialize dashboard component
            if (typeof Dashboard !== 'undefined') {
                this.dashboard = new Dashboard();
            }

            // Initialize transactions component
            if (typeof Transactions !== 'undefined') {
                this.transactions = new Transactions();
            }

            // Initialize goals component
            if (typeof Goals !== 'undefined') {
                this.goals = new Goals();
            }

            // Initialize routines component
            if (typeof Routines !== 'undefined') {
                this.routines = new Routines();
            }

            // Initialize reports component
            if (typeof Reports !== 'undefined') {
                this.reports = new Reports();
            }

        } catch (error) {
            console.error('Failed to initialize components:', error);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Navigation
        this.setupNavigation();

        // Theme toggle
        this.setupThemeToggle();

        // Quick add button
        this.setupQuickAdd();

        // Modal interactions
        this.setupModals();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Window events
        this.setupWindowEvents();
    }

    /**
     * Setup navigation event listeners
     */
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = item.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    /**
     * Setup theme toggle functionality
     */
    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    /**
     * Setup quick add functionality
     */
    setupQuickAdd() {
        const quickAddBtn = document.getElementById('quickAddBtn');

        if (quickAddBtn) {
            quickAddBtn.addEventListener('click', () => {
                this.showQuickAddModal();
            });
        }
    }

    /**
     * Setup modal interactions
     */
    setupModals() {
        const modalOverlay = document.getElementById('modalOverlay');
        const closeModal = document.getElementById('closeModal');

        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.hideModal();
                }
            });
        }

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.hideModal();
            });
        }

        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
            }
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle shortcuts when no input is focused
            if (document.activeElement.tagName === 'INPUT' ||
                document.activeElement.tagName === 'TEXTAREA') {
                return;
            }

            // Cmd/Ctrl + number keys for navigation
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '5') {
                e.preventDefault();
                const tabs = ['dashboard', 'transactions', 'goals', 'routines', 'reports'];
                const tabIndex = parseInt(e.key) - 1;
                if (tabs[tabIndex]) {
                    this.switchTab(tabs[tabIndex]);
                }
            }

            // Cmd/Ctrl + N for quick add
            if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
                e.preventDefault();
                this.showQuickAddModal();
            }

            // Cmd/Ctrl + T for theme toggle
            if ((e.metaKey || e.ctrlKey) && e.key === 't') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    /**
     * Setup window event listeners
     */
    setupWindowEvents() {
        // Handle window resize
        window.addEventListener('resize', Helpers.debounce(() => {
            this.handleResize();
        }, 250));

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && !this.isLoading) {
                this.refreshData();
            }
        });

        // Auto-save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveApplicationState();
        });
    }

    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        if (this.currentTab === tabName) return;

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        const activeNavItem = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        const activeTabContent = document.getElementById(tabName);
        if (activeTabContent) {
            activeTabContent.classList.add('active');
        }

        // Update page title and subtitle
        this.updatePageTitle(tabName);

        // Update current tab
        this.currentTab = tabName;

        // Load tab-specific content
        this.loadTabContent(tabName);

        // Track navigation
        this.trackNavigation(tabName);
    }

    /**
     * Update page title based on current tab
     */
    updatePageTitle(tabName) {
        const titleElement = document.getElementById('pageTitle');
        const subtitleElement = document.getElementById('pageSubtitle');

        const titles = {
            dashboard: { title: 'Dashboard', subtitle: 'Financial Overview' },
            transactions: { title: 'Transactions', subtitle: 'Income & Expenses' },
            goals: { title: 'Goals', subtitle: 'Financial Targets' },
            routines: { title: 'Routines', subtitle: 'Recurring Expenses' },
            reports: { title: 'Reports', subtitle: 'Analytics & Insights' }
        };

        const pageInfo = titles[tabName] || { title: 'Dashboard', subtitle: 'Financial Overview' };

        if (titleElement) {
            titleElement.textContent = pageInfo.title;
        }

        if (subtitleElement) {
            subtitleElement.textContent = pageInfo.subtitle;
        }

        // Update document title
        document.title = `${pageInfo.title} - FinancePro`;
    }

    /**
     * Load tab-specific content
     */
    async loadTabContent(tabName) {
        try {
            switch (tabName) {
                case 'dashboard':
                    if (this.dashboard) {
                        if (!this.dashboard.isInitialized) {
                            await this.dashboard.init();
                        } else {
                            await this.dashboard.refresh();
                        }
                    }
                    break;
                case 'transactions':
                    if (this.transactions) {
                        if (!this.transactions.isInitialized) {
                            await this.transactions.init();
                        } else {
                            await this.transactions.refresh();
                        }
                    }
                    break;
                case 'goals':
                    if (this.goals) {
                        if (!this.goals.isInitialized) {
                            await this.goals.init();
                        } else {
                            await this.goals.refresh();
                        }
                    }
                    break;
                case 'routines':
                    if (this.routines) {
                        if (!this.routines.isInitialized) {
                            await this.routines.init();
                        } else {
                            await this.routines.refresh();
                        }
                    }
                    break;
                case 'reports':
                    if (this.reports) {
                        if (!this.reports.isInitialized) {
                            await this.reports.init();
                        } else {
                            await this.reports.refresh();
                        }
                    }
                    break;
            }
        } catch (error) {
            console.error(`Failed to load ${tabName} content:`, error);
            this.showNotification(`Failed to load ${tabName} data`, 'danger');
        }
    }

    /**
     * Toggle theme between light and dark
     */
    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        document.body.className = `${this.theme}-theme`;

        // Save theme preference
        localStorage.setItem('financepro-theme', this.theme);

        // Update theme toggle icon
        this.updateThemeToggle();

        // Show notification
        this.showNotification(`Switched to ${this.theme} theme`, 'info');
    }

    /**
     * Update theme toggle icon
     */
    updateThemeToggle() {
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.style.transform = this.theme === 'dark' ? 'rotate(0deg)' : 'rotate(180deg)';
        }
    }

    /**
     * Show quick add modal
     */
    showQuickAddModal() {
        const modalOverlay = document.getElementById('modalOverlay');
        const modal = document.getElementById('quickAddModal');

        if (modalOverlay && modal) {
            // Generate quick add form content
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.innerHTML = this.generateQuickAddForm();
                this.setupQuickAddForm();
            }

            modalOverlay.classList.add('active');

            // Focus first input
            setTimeout(() => {
                const firstInput = modal.querySelector('input, select');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 150);
        }
    }

    /**
     * Generate quick add form HTML
     */
    generateQuickAddForm() {
        return `
            <form id="quickAddForm" class="form">
                <div class="form-group">
                    <label class="form-label">Type</label>
                    <select id="quickType" class="form-select" required>
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Amount</label>
                    <input type="number" id="quickAmount" class="form-input" 
                           placeholder="0.00" step="0.01" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Category</label>
                    <select id="quickCategory" class="form-select" required>
                        ${this.generateCategoryOptions()}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <input type="text" id="quickDescription" class="form-input" 
                           placeholder="Enter description..." required>
                </div>
                <div class="form-group">
                    <button type="submit" class="btn btn-primary btn-lg">
                        Add Transaction
                    </button>
                    <button type="button" class="btn btn-secondary btn-lg" onclick="app.hideModal()">
                        Cancel
                    </button>
                </div>
            </form>
        `;
    }

    /**
     * Generate category options HTML
     */
    generateCategoryOptions() {
        return CATEGORIES.map(category =>
            `<option value="${category.id}">${category.name}</option>`
        ).join('');
    }

    /**
     * Setup quick add form functionality
     */
    setupQuickAddForm() {
        const form = document.getElementById('quickAddForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleQuickAdd();
            });
        }

        // Update categories when type changes
        const typeSelect = document.getElementById('quickType');
        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                this.updateQuickAddCategories(e.target.value);
            });
        }
    }

    /**
     * Update category options based on transaction type
     */
    updateQuickAddCategories(type) {
        const categorySelect = document.getElementById('quickCategory');
        if (categorySelect) {
            const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
            categorySelect.innerHTML = categories.map(category =>
                `<option value="${category.id}">${category.name}</option>`
            ).join('');
        }
    }

    /**
     * Handle quick add form submission
     */
    async handleQuickAdd() {
        try {
            const form = document.getElementById('quickAddForm');
            const formData = new FormData(form);

            const transactionData = {
                type: document.getElementById('quickType').value,
                amount: parseFloat(document.getElementById('quickAmount').value),
                category: document.getElementById('quickCategory').value,
                description: document.getElementById('quickDescription').value,
                date: new Date().toISOString().split('T')[0]
            };

            // Add transaction
            if (this.transactions) {
                await this.transactions.addTransaction(transactionData);
            }

            // Hide modal
            this.hideModal();

            // Show success notification
            this.showNotification('Transaction added successfully', 'success');

            // Refresh data
            await this.refreshData();

        } catch (error) {
            console.error('Failed to add quick transaction:', error);
            this.showNotification('Failed to add transaction', 'danger');
        }
    }

    /**
     * Hide modal
     */
    hideModal() {
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
        }
    }

    /**
     * Load initial application data
     */
    async loadInitialData() {
        try {
            // Load data for all components
            await Promise.all([
                this.dashboard?.init(),
                this.transactions?.init(),
                this.goals?.init(),
                this.routines?.init(),
                this.reports?.init()
            ]);

            // Update header balance
            this.updateHeaderBalance();

        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showNotification('Failed to load application data', 'danger');
        }
    }

    /**
     * Refresh all application data
     */
    async refreshData() {
        try {
            // Refresh current tab content
            await this.loadTabContent(this.currentTab);

            // Update header balance
            this.updateHeaderBalance();

        } catch (error) {
            console.error('Failed to refresh data:', error);
        }
    }

    /**
     * Update header balance display
     */
    async updateHeaderBalance() {
        try {
            const balance = await Storage.getTotalBalance();
            const headerBalance = document.getElementById('headerBalance');

            if (headerBalance) {
                headerBalance.textContent = Helpers.formatCurrency(balance);
                headerBalance.className = `stat-value ${balance >= 0 ? 'positive' : 'negative'}`;
            }
        } catch (error) {
            console.error('Failed to update header balance:', error);
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Update charts if dashboard is active
        if (this.currentTab === 'dashboard' && this.dashboard) {
            this.dashboard.handleResize();
        }

        // Update mobile navigation
        this.updateMobileNavigation();
    }

    /**
     * Update mobile navigation state
     */
    updateMobileNavigation() {
        const sidebar = document.querySelector('.sidebar');
        const isMobile = window.innerWidth <= 768;

        if (sidebar) {
            if (isMobile) {
                sidebar.classList.add('mobile');
            } else {
                sidebar.classList.remove('mobile', 'open');
            }
        }
    }

    /**
     * Toggle mobile sidebar
     */
    toggleMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('open');
        }
    }

    /**
     * Save application state
     */
    saveApplicationState() {
        try {
            const state = {
                currentTab: this.currentTab,
                theme: this.theme,
                timestamp: Date.now()
            };

            localStorage.setItem('financepro-state', JSON.stringify(state));
        } catch (error) {
            console.error('Failed to save application state:', error);
        }
    }

    /**
     * Restore application state
     */
    restoreApplicationState() {
        try {
            const savedState = localStorage.getItem('financepro-state');
            if (savedState) {
                const state = JSON.parse(savedState);

                // Restore tab if valid
                if (state.currentTab && this.isValidTab(state.currentTab)) {
                    this.switchTab(state.currentTab);
                }

                // Restore theme
                if (state.theme) {
                    this.theme = state.theme;
                    document.body.className = `${this.theme}-theme`;
                    this.updateThemeToggle();
                }
            }
        } catch (error) {
            console.error('Failed to restore application state:', error);
        }
    }

    /**
     * Check if tab name is valid
     */
    isValidTab(tabName) {
        const validTabs = ['dashboard', 'transactions', 'goals', 'routines', 'reports'];
        return validTabs.includes(tabName);
    }

    /**
     * Track navigation for analytics
     */
    trackNavigation(tabName) {
        try {
            const event = {
                type: 'navigation',
                tab: tabName,
                timestamp: Date.now()
            };

            // Store in session for analytics
            const events = JSON.parse(sessionStorage.getItem('financepro-events') || '[]');
            events.push(event);

            // Keep only last 100 events
            if (events.length > 100) {
                events.splice(0, events.length - 100);
            }

            sessionStorage.setItem('financepro-events', JSON.stringify(events));
        } catch (error) {
            console.error('Failed to track navigation:', error);
        }
    }

    /**
     * Show notification to user
     */
    showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        notification.innerHTML = `
            <div class="notification-icon"></div>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" aria-label="Close notification">×</button>
        `;

        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });

        // Auto-remove after duration
        const timer = setTimeout(() => {
            this.removeNotification(notification);
        }, duration);

        // Store timer for manual removal
        notification.timer = timer;

        container.appendChild(notification);

        // Trigger animation
        requestAnimationFrame(() => {
            notification.style.animation = 'slideInRight 0.3s ease forwards';
        });

        return notification;
    }

    /**
     * Remove notification
     */
    removeNotification(notification) {
        if (notification.timer) {
            clearTimeout(notification.timer);
        }

        notification.style.animation = 'slideOutRight 0.3s ease forwards';

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    /**
     * Show confirmation dialog
     */
    showConfirmation(message, callback) {
        const confirmed = confirm(message);
        if (confirmed && callback) {
            callback();
        }
        return confirmed;
    }

    /**
     * Export application data
     */
    async exportData() {
        try {
            const data = await Storage.exportAllData();
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json'
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `financepro-export-${new Date().toISOString().split('T')[0]}.json`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);

            this.showNotification('Data exported successfully', 'success');
        } catch (error) {
            console.error('Failed to export data:', error);
            this.showNotification('Failed to export data', 'danger');
        }
    }

    /**
     * Import application data
     */
    async importData(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);

            await Storage.importAllData(data);
            await this.refreshData();

            this.showNotification('Data imported successfully', 'success');
        } catch (error) {
            console.error('Failed to import data:', error);
            this.showNotification('Failed to import data', 'danger');
        }
    }

    /**
     * Clear all application data
     */
    async clearAllData() {
        const confirmed = this.showConfirmation(
            'Are you sure you want to clear all data? This action cannot be undone.'
        );

        if (confirmed) {
            try {
                await Storage.clearAllData();
                await this.refreshData();

                this.showNotification('All data cleared successfully', 'info');
            } catch (error) {
                console.error('Failed to clear data:', error);
                this.showNotification('Failed to clear data', 'danger');
            }
        }
    }

    /**
     * Get application statistics
     */
    async getStats() {
        try {
            return await Storage.getApplicationStats();
        } catch (error) {
            console.error('Failed to get application stats:', error);
            return null;
        }
    }

    /**
     * Handle application errors
     */
    handleError(error, context = 'Application') {
        console.error(`${context} Error:`, error);

        // Show user-friendly error message
        let message = 'An unexpected error occurred';
        if (error.message) {
            message = error.message;
        }

        this.showNotification(message, 'danger');

        // Log error for debugging
        this.logError(error, context);
    }

    /**
     * Log error for debugging
     */
    logError(error, context) {
        try {
            const errorLog = {
                message: error.message,
                stack: error.stack,
                context: context,
                timestamp: Date.now(),
                url: window.location.href,
                userAgent: navigator.userAgent
            };

            // Store in session for debugging
            const errors = JSON.parse(sessionStorage.getItem('financepro-errors') || '[]');
            errors.push(errorLog);

            // Keep only last 50 errors
            if (errors.length > 50) {
                errors.splice(0, errors.length - 50);
            }

            sessionStorage.setItem('financepro-errors', JSON.stringify(errors));
        } catch (logError) {
            console.error('Failed to log error:', logError);
        }
    }

    /**
     * Check for updates
     */
    async checkForUpdates() {
        try {
            // In a real application, this would check a remote server
            const currentVersion = '2.0.0';
            const savedVersion = localStorage.getItem('financepro-version');

            if (savedVersion && savedVersion !== currentVersion) {
                this.showNotification('Application updated to v' + currentVersion, 'info');
            }

            localStorage.setItem('financepro-version', currentVersion);
        } catch (error) {
            console.error('Failed to check for updates:', error);
        }
    }

    /**
     * Initialize service worker (for offline functionality)
     */
    async initServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered:', registration);
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.refreshData);
        window.removeEventListener('beforeunload', this.saveApplicationState);

        // Cleanup components
        if (this.dashboard) this.dashboard.cleanup();
        if (this.transactions) this.transactions.cleanup();
        if (this.goals) this.goals.cleanup();
        if (this.routines) this.routines.cleanup();
        if (this.reports) this.reports.cleanup();

        // Clear timers and intervals
        // (Components should handle their own cleanup)

        console.log('FinancePro cleaned up successfully');
    }
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (window.app) {
        window.app.handleError(event.error, 'Global');
    }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.app) {
        window.app.handleError(new Error(event.reason), 'Promise');
    }
});

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        window.app = new FinanceProApp();

        // Make app globally available for debugging
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            window.FinanceProApp = FinanceProApp;
            console.log('FinancePro debugging enabled');
        }
    } catch (error) {
        console.error('Failed to initialize FinancePro:', error);

        // Show basic error message
        document.body.innerHTML = `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
                font-family: system-ui, sans-serif;
                background: #0f172a;
                color: #e2e8f0;
                text-align: center;
                padding: 20px;
            ">
                <div>
                    <h1 style="margin-bottom: 16px; color: #ef4444;">Initialization Error</h1>
                    <p style="margin-bottom: 16px;">Failed to load FinancePro application.</p>
                    <button onclick="location.reload()" style="
                        background: #6366f1;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Reload Application</button>
                </div>
            </div>
        `;
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FinanceProApp;
}
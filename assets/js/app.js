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

            // Check authentication
            if (!authManager.hasActiveSession()) {
                window.location.href = 'login.html';
                return;
            }

            // Restore encryption key from session
            const keyRestored = await authManager.restoreEncryptionKey();
            if (!keyRestored) {
                console.error('Failed to restore encryption key');
                alert('Session expired. Please login again.');
                authManager.logout();
                return;
            }
            // Show loading screen
            this.showLoading();

            // Initialize theme
            await this.initializeTheme();

            // Initialize storage
            await Storage.init();

            try {
                await Storage.loadEncryptedData();
                console.log('Encrypted data loaded successfully');
            } catch (error) {
                console.error('Failed to load encrypted data:', error);
                alert('Error loading data. Please login again.');
                authManager.logout();
                return;
            }

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

        // Header (Quick add, Profile, Logout)
        this.initializeHeader();

        // Modal interactions
        this.setupModals();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Window events
        this.setupWindowEvents();
    }

    /**
     * Initialize Header
     */
    initializeHeader() {
        // Quick Add Button
        const quickAddBtn = document.getElementById('quickAddBtn');
        if (quickAddBtn) {
            quickAddBtn.addEventListener('click', () => {
                this.showQuickAddModal();
            });
        }

        // Profile Button
        const profileBtn = document.getElementById('headerProfile');
        if (profileBtn) {
            profileBtn.addEventListener('click', () => {
                this.showProfileModal();
            });
        }

        // Logout Button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Close Profile Modal
        const closeProfileModal = document.getElementById('closeProfileModal');
        if (closeProfileModal) {
            closeProfileModal.addEventListener('click', () => {
                this.hideProfileModal();
            });
        }

        // Profile Form Submit
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProfileUpdate(e.target);
            });
        }

        // Profile Image Upload
        const profileImageInput = document.getElementById('profileImageInput');
        if (profileImageInput) {
            profileImageInput.addEventListener('change', (e) => {
                this.handleProfileImageUpload(e);
            });
        }

        // Remove Photo Button
        const removePhotoBtn = document.getElementById('removePhotoBtn');
        if (removePhotoBtn) {
            removePhotoBtn.addEventListener('click', () => {
                this.removeProfilePhoto();
            });
        }

        // Load user info
        this.updateUserInfo();
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
     * Setup modal interactions
     */
    setupModals() {
        const modalOverlay = document.getElementById('modalOverlay');
        const closeModal = document.getElementById('closeModal');
        const profileModalOverlay = document.getElementById('profileModalOverlay');

        // Quick Add Modal
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

        // Profile Modal
        if (profileModalOverlay) {
            profileModalOverlay.addEventListener('click', (e) => {
                if (e.target === profileModalOverlay) {
                    this.hideProfileModal();
                }
            });
        }

        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
                this.hideProfileModal();
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
                <label class="form-label">Amount (€)</label>
                <input type="number" id="quickAmount" class="form-input" 
                       placeholder="0.00" step="0.01" required>
            </div>
            
            <div class="form-group">
                <label class="form-label">Date</label>
                <input type="date" id="quickDate" class="form-input" 
                       value="${new Date().toISOString().split('T')[0]}" required>
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
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary btn-lg" onclick="app.hideModal()">
                    Cancel
                </button>
                <button type="submit" class="btn btn-primary btn-lg">
                    <span class="btn-icon save-icon"></span>
                    Add Transaction
                </button>
            </div>
        </form>
    `;
    }

    /**
     * Generate category options HTML
     */
    generateCategoryOptions() {
        const categories = typeof EXPENSE_CATEGORIES !== 'undefined' ? EXPENSE_CATEGORIES : [
            { id: 'food', name: 'Food & Dining' },
            { id: 'transport', name: 'Transportation' },
            { id: 'shopping', name: 'Shopping' },
            { id: 'bills', name: 'Bills & Utilities' },
            { id: 'entertainment', name: 'Entertainment' },
            { id: 'other', name: 'Other' }
        ];

        return categories.map(category =>
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
            const type = document.getElementById('quickType').value;
            const amountInput = parseFloat(document.getElementById('quickAmount').value);
            const category = document.getElementById('quickCategory').value;
            const description = document.getElementById('quickDescription').value.trim();
            const date = document.getElementById('quickDate').value;

            // Validate amount
            if (!amountInput || amountInput <= 0 || isNaN(amountInput)) {
                this.showNotification('Please enter a valid amount greater than 0', 'danger');
                return;
            }

            // Validate description
            if (!description) {
                this.showNotification('Please enter a description', 'danger');
                return;
            }

            // Validate date
            if (!date) {
                this.showNotification('Please select a date', 'danger');
                return;
            }

            // Create transaction with correct amount sign
            const transactionData = {
                type: type,
                amount: type === 'income' ? amountInput : -amountInput,
                category: category,
                description: description,
                date: date
            };

            // Add transaction directly to storage
            await Storage.addTransaction(transactionData);

            // Hide modal
            this.hideModal();

            // Show success notification
            this.showNotification('Transaction added successfully', 'success');

            // Refresh all data
            await this.refreshData();

            // Update header balance immediately
            await this.updateHeaderBalance();

        } catch (error) {
            console.error('Failed to add quick transaction:', error);
            this.showNotification('Failed to add transaction: ' + error.message, 'danger');
        }
    }

    /**
     * Hide modal
     */
    hideModal() {
        const modalOverlay = document.getElementById('modalOverlay');
        const profileModalOverlay = document.getElementById('profileModalOverlay');

        if (modalOverlay) {
            modalOverlay.classList.remove('active');
        }

        if (profileModalOverlay) {
            profileModalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    /**
     * Show Profile Modal
     */
    showProfileModal() {
        const overlay = document.getElementById('profileModalOverlay');
        if (overlay) {
            // Load current user data
            if (typeof authManager !== 'undefined' && authManager.currentUser) {
                const user = authManager.currentUser;

                document.getElementById('profileName').value = user.name || '';
                document.getElementById('profileEmail').value = user.email || '';

                // Set member since date
                const memberSince = document.getElementById('memberSince');
                if (memberSince && user.createdAt) {
                    const date = new Date(user.createdAt);
                    memberSince.textContent = date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                }

                // Load profile image if exists
                if (user.profileImage) {
                    const img = document.getElementById('profileImagePreview');
                    const initials = document.getElementById('profileInitialsLarge');
                    if (img && initials) {
                        img.src = user.profileImage;
                        img.style.display = 'block';
                        initials.style.display = 'none';
                        document.getElementById('removePhotoBtn').style.display = 'block';
                    }
                }
            }

            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Hide Profile Modal
     */
    hideProfileModal() {
        const overlay = document.getElementById('profileModalOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    /**
     * Handle Profile Image Upload
     */
    async handleProfileImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select an image file', 'danger');
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            this.showNotification('Image size must be less than 2MB', 'danger');
            return;
        }

        try {
            // Convert to base64
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = e.target.result;

                const img = document.getElementById('profileImagePreview');
                const initials = document.getElementById('profileInitialsLarge');
                const headerImg = document.getElementById('userProfileImage');
                const headerInitials = document.getElementById('userInitials');

                if (img && initials) {
                    img.src = imageData;
                    img.style.display = 'block';
                    initials.style.display = 'none';
                    document.getElementById('removePhotoBtn').style.display = 'block';
                }

                // Update header profile image
                if (headerImg && headerInitials) {
                    headerImg.src = imageData;
                    headerImg.style.display = 'block';
                    headerInitials.style.display = 'none';
                }

                // Save to localStorage
                if (typeof authManager !== 'undefined' && authManager.currentUser) {
                    authManager.currentUser.profileImage = imageData;
                    // Save to localStorage
                    const users = JSON.parse(localStorage.getItem('financepro_users') || '{}');
                    if (users[authManager.currentUser.email]) {
                        users[authManager.currentUser.email].profileImage = imageData;
                        localStorage.setItem('financepro_users', JSON.stringify(users));
                    }
                }
            };
            reader.readAsDataURL(file);

            this.showNotification('Profile photo updated!', 'success');
        } catch (error) {
            console.error('Failed to upload image:', error);
            this.showNotification('Failed to upload photo', 'danger');
        }
    }

    /**
     * Remove Profile Photo
     */
    removeProfilePhoto() {
        const img = document.getElementById('profileImagePreview');
        const initials = document.getElementById('profileInitialsLarge');
        const headerImg = document.getElementById('userProfileImage');
        const headerInitials = document.getElementById('userInitials');

        if (img && initials) {
            img.src = '';
            img.style.display = 'none';
            initials.style.display = 'flex';
            document.getElementById('removePhotoBtn').style.display = 'none';
        }

        // Update header
        if (headerImg && headerInitials) {
            headerImg.src = '';
            headerImg.style.display = 'none';
            headerInitials.style.display = 'flex';
        }

        // Save to localStorage
        if (typeof authManager !== 'undefined' && authManager.currentUser) {
            authManager.currentUser.profileImage = null;
            // Save to localStorage
            const users = JSON.parse(localStorage.getItem('financepro_users') || '{}');
            if (users[authManager.currentUser.email]) {
                users[authManager.currentUser.email].profileImage = null;
                localStorage.setItem('financepro_users', JSON.stringify(users));
            }
        }

        this.showNotification('Profile photo removed', 'info');
    }

    /**
     * Handle Profile Update
     */
    async handleProfileUpdate(form) {
        try {
            const name = document.getElementById('profileName').value;

            if (!name.trim()) {
                throw new Error('Name is required');
            }

            // Update user info
            if (typeof authManager !== 'undefined' && authManager.currentUser) {
                authManager.currentUser.name = name.trim();

                // Save to localStorage
                const users = JSON.parse(localStorage.getItem('financepro_users') || '{}');
                if (users[authManager.currentUser.email]) {
                    users[authManager.currentUser.email].name = name.trim();
                    localStorage.setItem('financepro_users', JSON.stringify(users));
                }
            }

            this.updateUserInfo();
            this.hideProfileModal();
            this.showNotification('Profile updated successfully!', 'success');

        } catch (error) {
            console.error('Failed to update profile:', error);
            this.showNotification('Failed to update profile: ' + error.message, 'danger');
        }
    }

    /**
     * Update User Info in Header
     */
    updateUserInfo() {
        if (typeof authManager !== 'undefined' && authManager.currentUser) {
            const user = authManager.currentUser;

            // Update name
            const userName = document.getElementById('userName');
            if (userName) userName.textContent = user.name || 'User';

            // Update initials
            const userInitials = document.getElementById('userInitials');
            const profileInitialsLarge = document.getElementById('profileInitialsLarge');

            if (user.name) {
                const initials = user.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                if (userInitials) userInitials.textContent = initials;
                if (profileInitialsLarge) profileInitialsLarge.textContent = initials;
            }

            // Update profile image if exists
            if (user.profileImage) {
                const headerImg = document.getElementById('userProfileImage');
                const headerInitials = document.getElementById('userInitials');

                if (headerImg && headerInitials) {
                    headerImg.src = user.profileImage;
                    headerImg.style.display = 'block';
                    headerInitials.style.display = 'none';
                }
            }
        }
    }

    /**
     * Logout
     */
    async logout() {
        if (confirm('Are you sure you want to sign out?')) {
            try {
                if (typeof authManager !== 'undefined') {
                    await authManager.logout();
                }
                this.showNotification('Signed out successfully', 'success');
            } catch (error) {
                console.error('Logout failed:', error);
                this.showNotification('Failed to sign out', 'danger');
            }
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
            await this.updateHeaderBalance();

            // If on dashboard, force refresh
            if (this.currentTab === 'dashboard' && this.dashboard) {
                await this.dashboard.refresh(false);
            }

            // If on transactions, force refresh
            if (this.currentTab === 'transactions' && this.transactions) {
                await this.transactions.refresh();
            }

        } catch (error) {
            console.error('Failed to refresh data:', error);
        }
    }

    /**
     * Update header balance display
     */
    async updateHeaderBalance() {
        try {
            // Get balance from Storage
            const balance = await Storage.getBalance();
            const headerBalance = document.getElementById('headerBalance');

            if (headerBalance) {
                // Format the currency properly
                const formatted = typeof Helpers !== 'undefined' && Helpers.formatCurrency
                    ? Helpers.formatCurrency(balance)
                    : `€${balance.toFixed(2)}`;

                headerBalance.textContent = formatted;

                // Add positive/negative class for styling
                headerBalance.className = `balance-value ${balance >= 0 ? 'positive' : 'negative'}`;
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
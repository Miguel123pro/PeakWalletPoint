/**
 * FinancePro - Data Storage Management
 * Handles all data persistence operations
 * 
 * @version 2.0.0
 */

class Storage {
    static instance = null;

    constructor() {
        if (Storage.instance) {
            return Storage.instance;
        }

        this.isInitialized = false;
        this.data = {
            transactions: [],
            goals: [],
            routines: [],
            accounts: [],
            budgets: [],
            settings: { ...DEFAULT_SETTINGS }
        };

        Storage.instance = this;
    }

    /**
     * Initialize storage system
     */
    static async init() {
        const storage = new Storage();
        await storage.initialize();
        return storage;
    }

    /**
     * Initialize storage instance
     */
    async initialize() {
        try {
            await this.loadAllData();
            await this.runMigrations();
            await this.createBackupIfNeeded();

            this.isInitialized = true;
            console.log('Storage initialized successfully');
        } catch (error) {
            console.error('Failed to initialize storage:', error);
            throw error;
        }
    }

    /**
     * Load all data from localStorage
     */
    async loadAllData() {
        try {
            // Load each data type
            this.data.transactions = this.loadFromStorage(STORAGE_KEYS.TRANSACTIONS, []);
            this.data.goals = this.loadFromStorage(STORAGE_KEYS.GOALS, []);
            this.data.routines = this.loadFromStorage(STORAGE_KEYS.ROUTINES, []);
            this.data.accounts = this.loadFromStorage(STORAGE_KEYS.ACCOUNTS, []);
            this.data.budgets = this.loadFromStorage(STORAGE_KEYS.BUDGETS, []);
            this.data.settings = this.loadFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

            // Validate and clean data
            await this.validateAndCleanData();

        } catch (error) {
            console.error('Failed to load data:', error);
            throw new Error('Failed to load application data');
        }
    }

    /**
     * Load data from localStorage with error handling
     */
    loadFromStorage(key, defaultValue) {
        try {
            const data = localStorage.getItem(key);
            if (data === null) {
                return defaultValue;
            }

            const parsed = JSON.parse(data);
            return parsed !== null ? parsed : defaultValue;
        } catch (error) {
            console.warn(`Failed to parse ${key} from localStorage:`, error);
            return defaultValue;
        }
    }

    /**
     * Save data to localStorage with error handling
     */
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Failed to save ${key} to localStorage:`, error);

            // Handle quota exceeded error
            if (error.name === 'QuotaExceededError') {
                this.handleStorageQuotaExceeded();
            }

            throw new Error(`Failed to save data: ${error.message}`);
        }
    }

    /**
     * Handle storage quota exceeded
     */
    handleStorageQuotaExceeded() {
        console.warn('Storage quota exceeded, cleaning up old data');

        // Remove old backups
        this.cleanupOldBackups();

        // Remove old session data
        this.cleanupSessionData();

        // Notify user
        if (window.app) {
            window.app.showNotification(
                'Storage space is running low. Old backups have been cleaned up.',
                'warning'
            );
        }
    }

    /**
     * Validate and clean loaded data
     */
    async validateAndCleanData() {
        // Validate transactions
        this.data.transactions = this.data.transactions.filter(t =>
            this.isValidTransaction(t)
        );

        // Validate goals
        this.data.goals = this.data.goals.filter(g =>
            this.isValidGoal(g)
        );

        // Validate routines
        this.data.routines = this.data.routines.filter(r =>
            this.isValidRoutine(r)
        );

        // Ensure all transactions have IDs
        this.data.transactions.forEach(t => {
            if (!t.id) {
                t.id = this.generateId();
            }
        });

        // Ensure all goals have IDs
        this.data.goals.forEach(g => {
            if (!g.id) {
                g.id = this.generateId();
            }
        });

        // Ensure all routines have IDs
        this.data.routines.forEach(r => {
            if (!r.id) {
                r.id = this.generateId();
            }
        });

        // Sort data by date/creation time
        this.sortData();
    }

    /**
     * Validate transaction object
     */
    isValidTransaction(transaction) {
        return transaction &&
            typeof transaction.id !== 'undefined' &&
            typeof transaction.amount === 'number' &&
            typeof transaction.description === 'string' &&
            typeof transaction.category === 'string' &&
            typeof transaction.date === 'string' &&
            ['income', 'expense'].includes(transaction.type);
    }

    /**
     * Validate goal object
     */
    isValidGoal(goal) {
        return goal &&
            typeof goal.id !== 'undefined' &&
            typeof goal.name === 'string' &&
            typeof goal.targetAmount === 'number' &&
            typeof goal.currentAmount === 'number' &&
            typeof goal.deadline === 'string';
    }

    /**
     * Validate routine object
     */
    isValidRoutine(routine) {
        return routine &&
            typeof routine.id !== 'undefined' &&
            typeof routine.name === 'string' &&
            typeof routine.amount === 'number' &&
            typeof routine.frequency === 'string' &&
            typeof routine.category === 'string';
    }

    /**
     * Sort data arrays
     */
    sortData() {
        // Sort transactions by date (newest first)
        this.data.transactions.sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        // Sort goals by deadline (nearest first)
        this.data.goals.sort((a, b) =>
            new Date(a.deadline) - new Date(b.deadline)
        );

        // Sort routines by name
        this.data.routines.sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // ===============================
    // TRANSACTION OPERATIONS
    // ===============================

    /**
     * Get all transactions
     */
    static async getTransactions(filters = {}) {
        const storage = new Storage();
        let transactions = [...storage.data.transactions];

        // Apply filters
        if (filters.type) {
            transactions = transactions.filter(t => t.type === filters.type);
        }

        if (filters.category) {
            transactions = transactions.filter(t => t.category === filters.category);
        }

        if (filters.startDate) {
            transactions = transactions.filter(t =>
                new Date(t.date) >= new Date(filters.startDate)
            );
        }

        if (filters.endDate) {
            transactions = transactions.filter(t =>
                new Date(t.date) <= new Date(filters.endDate)
            );
        }

        if (filters.limit) {
            transactions = transactions.slice(0, filters.limit);
        }

        return transactions;
    }

    /**
     * Add new transaction
     */
    static async addTransaction(transactionData) {
        const storage = new Storage();

        const transaction = {
            id: storage.generateId(),
            type: transactionData.type,
            amount: transactionData.type === 'expense' ?
                -Math.abs(transactionData.amount) :
                Math.abs(transactionData.amount),
            description: transactionData.description,
            category: transactionData.category,
            date: transactionData.date,
            account: transactionData.account || 'default',
            tags: transactionData.tags || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        storage.data.transactions.unshift(transaction);
        storage.saveToStorage(STORAGE_KEYS.TRANSACTIONS, storage.data.transactions);

        return transaction;
    }

    /**
     * Update transaction
     */
    static async updateTransaction(id, updates) {
        const storage = new Storage();

        const index = storage.data.transactions.findIndex(t => t.id === id);
        if (index === -1) {
            throw new Error('Transaction not found');
        }

        storage.data.transactions[index] = {
            ...storage.data.transactions[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        storage.saveToStorage(STORAGE_KEYS.TRANSACTIONS, storage.data.transactions);

        return storage.data.transactions[index];
    }

    /**
     * Delete transaction
     */
    static async deleteTransaction(id) {
        const storage = new Storage();

        const index = storage.data.transactions.findIndex(t => t.id === id);
        if (index === -1) {
            throw new Error('Transaction not found');
        }

        const deleted = storage.data.transactions.splice(index, 1)[0];
        storage.saveToStorage(STORAGE_KEYS.TRANSACTIONS, storage.data.transactions);

        return deleted;
    }

    // ===============================
    // GOAL OPERATIONS
    // ===============================

    /**
     * Get all goals
     */
    static async getGoals() {
        const storage = new Storage();
        return [...storage.data.goals];
    }

    /**
     * Add new goal
     */
    static async addGoal(goalData) {
        const storage = new Storage();

        const goal = {
            id: storage.generateId(),
            name: goalData.name,
            targetAmount: goalData.targetAmount,
            currentAmount: goalData.currentAmount || 0,
            deadline: goalData.deadline,
            category: goalData.category || 'other',
            description: goalData.description || '',
            priority: goalData.priority || 'medium',
            isCompleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        storage.data.goals.push(goal);
        storage.sortData();
        storage.saveToStorage(STORAGE_KEYS.GOALS, storage.data.goals);

        return goal;
    }

    /**
     * Update goal
     */
    static async updateGoal(id, updates) {
        const storage = new Storage();

        const index = storage.data.goals.findIndex(g => g.id === id);
        if (index === -1) {
            throw new Error('Goal not found');
        }

        storage.data.goals[index] = {
            ...storage.data.goals[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        // Check if goal is completed
        if (storage.data.goals[index].currentAmount >= storage.data.goals[index].targetAmount) {
            storage.data.goals[index].isCompleted = true;
            storage.data.goals[index].completedAt = new Date().toISOString();
        }

        storage.saveToStorage(STORAGE_KEYS.GOALS, storage.data.goals);

        return storage.data.goals[index];
    }

    /**
     * Delete goal
     */
    static async deleteGoal(id) {
        const storage = new Storage();

        const index = storage.data.goals.findIndex(g => g.id === id);
        if (index === -1) {
            throw new Error('Goal not found');
        }

        const deleted = storage.data.goals.splice(index, 1)[0];
        storage.saveToStorage(STORAGE_KEYS.GOALS, storage.data.goals);

        return deleted;
    }

    // ===============================
    // ROUTINE OPERATIONS
    // ===============================

    /**
     * Get all routines
     */
    static async getRoutines() {
        const storage = new Storage();
        return [...storage.data.routines];
    }

    /**
     * Add new routine
     */
    static async addRoutine(routineData) {
        const storage = new Storage();

        const routine = {
            id: storage.generateId(),
            name: routineData.name,
            amount: Math.abs(routineData.amount),
            frequency: routineData.frequency,
            category: routineData.category,
            description: routineData.description || '',
            isActive: routineData.isActive !== false,
            nextDate: routineData.nextDate || new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        storage.data.routines.push(routine);
        storage.sortData();
        storage.saveToStorage(STORAGE_KEYS.ROUTINES, storage.data.routines);

        return routine;
    }

    /**
     * Update routine
     */
    static async updateRoutine(id, updates) {
        const storage = new Storage();

        const index = storage.data.routines.findIndex(r => r.id === id);
        if (index === -1) {
            throw new Error('Routine not found');
        }

        storage.data.routines[index] = {
            ...storage.data.routines[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        storage.saveToStorage(STORAGE_KEYS.ROUTINES, storage.data.routines);

        return storage.data.routines[index];
    }

    /**
     * Delete routine
     */
    static async deleteRoutine(id) {
        const storage = new Storage();

        const index = storage.data.routines.findIndex(r => r.id === id);
        if (index === -1) {
            throw new Error('Routine not found');
        }

        const deleted = storage.data.routines.splice(index, 1)[0];
        storage.saveToStorage(STORAGE_KEYS.ROUTINES, storage.data.routines);

        return deleted;
    }

    // ===============================
    // ANALYTICS & REPORTS
    // ===============================

    /**
     * Get total balance
     */
    static async getTotalBalance() {
        const storage = new Storage();
        return storage.data.transactions.reduce((sum, t) => sum + t.amount, 0);
    }

    /**
     * Get monthly summary
     */
    static async getMonthlySummary(year, month) {
        const transactions = await this.getTransactions({
            startDate: `${year}-${String(month).padStart(2, '0')}-01`,
            endDate: `${year}-${String(month).padStart(2, '0')}-31`
        });

        const income = transactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = Math.abs(transactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + t.amount, 0));

        return {
            income,
            expenses,
            balance: income - expenses,
            transactions: transactions.length,
            savingsRate: income > 0 ? ((income - expenses) / income * 100) : 0
        };
    }

    /**
     * Get spending by category
     */
    static async getSpendingByCategory(startDate, endDate) {
        const transactions = await this.getTransactions({
            type: 'expense',
            startDate,
            endDate
        });

        const categoryTotals = {};

        transactions.forEach(t => {
            const category = t.category;
            categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(t.amount);
        });

        return Object.entries(categoryTotals)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount);
    }

    /**
     * Get financial trends
     */
    static async getFinancialTrends(months = 6) {
        const trends = [];
        const now = new Date();

        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;

            const summary = await this.getMonthlySummary(year, month);

            trends.push({
                month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                ...summary
            });
        }

        return trends;
    }

    // ===============================
    // BACKUP & EXPORT
    // ===============================

    /**
     * Create backup
     */
    async createBackup() {
        try {
            const backup = {
                version: CONFIG.VERSION,
                timestamp: new Date().toISOString(),
                data: { ...this.data }
            };

            const backups = this.loadFromStorage(STORAGE_KEYS.BACKUPS, []);
            backups.push(backup);

            // Keep only latest backups
            if (backups.length > CONFIG.MAX_BACKUP_COUNT) {
                backups.splice(0, backups.length - CONFIG.MAX_BACKUP_COUNT);
            }

            this.saveToStorage(STORAGE_KEYS.BACKUPS, backups);

            return backup;
        } catch (error) {
            console.error('Failed to create backup:', error);
            throw error;
        }
    }

    /**
     * Create backup if needed
     */
    async createBackupIfNeeded() {
        const backups = this.loadFromStorage(STORAGE_KEYS.BACKUPS, []);
        const lastBackup = backups[backups.length - 1];

        if (!lastBackup ||
            Date.now() - new Date(lastBackup.timestamp).getTime() > CONFIG.BACKUP_INTERVAL) {
            await this.createBackup();
        }
    }

    /**
     * Export all data
     */
    static async exportAllData() {
        const storage = new Storage();

        return {
            version: CONFIG.VERSION,
            exportDate: new Date().toISOString(),
            data: { ...storage.data }
        };
    }

    /**
     * Import all data
     */
    static async importAllData(importData) {
        const storage = new Storage();

        // Validate import data
        if (!importData.data) {
            throw new Error('Invalid import data format');
        }

        // Backup current data
        await storage.createBackup();

        // Import data
        storage.data = { ...storage.data, ...importData.data };

        // Validate and clean
        await storage.validateAndCleanData();

        // Save all data
        storage.saveToStorage(STORAGE_KEYS.TRANSACTIONS, storage.data.transactions);
        storage.saveToStorage(STORAGE_KEYS.GOALS, storage.data.goals);
        storage.saveToStorage(STORAGE_KEYS.ROUTINES, storage.data.routines);
        storage.saveToStorage(STORAGE_KEYS.SETTINGS, storage.data.settings);

        return true;
    }

    /**
     * Clear all data
     */
    static async clearAllData() {
        const storage = new Storage();

        // Create backup before clearing
        await storage.createBackup();

        // Clear data
        storage.data = {
            transactions: [],
            goals: [],
            routines: [],
            accounts: [],
            budgets: [],
            settings: { ...DEFAULT_SETTINGS }
        };

        // Clear localStorage
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });

        return true;
    }

    // ===============================
    // MAINTENANCE
    // ===============================

    /**
     * Run database migrations
     */
    async runMigrations() {
        const currentVersion = localStorage.getItem(STORAGE_KEYS.VERSION) || '1.0.0';

        if (currentVersion !== CONFIG.VERSION) {
            console.log(`Migrating from ${currentVersion} to ${CONFIG.VERSION}`);

            // Add migration logic here as needed

            localStorage.setItem(STORAGE_KEYS.VERSION, CONFIG.VERSION);
        }
    }

    /**
     * Clean up old backups
     */
    cleanupOldBackups() {
        try {
            const backups = this.loadFromStorage(STORAGE_KEYS.BACKUPS, []);
            const recentBackups = backups.slice(-3); // Keep only 3 most recent

            this.saveToStorage(STORAGE_KEYS.BACKUPS, recentBackups);
        } catch (error) {
            console.error('Failed to cleanup backups:', error);
        }
    }

    /**
     * Clean up session data
     */
    cleanupSessionData() {
        try {
            sessionStorage.removeItem('financepro-events');
            sessionStorage.removeItem('financepro-errors');
            sessionStorage.removeItem('financepro-temp');
        } catch (error) {
            console.error('Failed to cleanup session data:', error);
        }
    }

    /**
     * Get application statistics
     */
    static async getApplicationStats() {
        const storage = new Storage();

        return {
            transactions: storage.data.transactions.length,
            goals: storage.data.goals.length,
            routines: storage.data.routines.length,
            totalBalance: await this.getTotalBalance(),
            storageUsed: JSON.stringify(storage.data).length,
            lastUpdated: new Date().toISOString()
        };
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}
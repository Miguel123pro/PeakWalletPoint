/**
 * FinancePro - Storage Utility
 * In-memory data management system
 * 
 * @version 2.0.0
 */
// ============================================
// ENCRIPTAÇÃO - ADICIONAR NO INÍCIO DO FICHEIRO
// ============================================

class EncryptedStorageWrapper {
    constructor(baseStorage) {
        this.baseStorage = baseStorage;
    }

    /**
     * Save encrypted data to localStorage
     */
    async saveToLocalStorage() {
        if (!authManager.isAuthenticated) {
            console.warn('Not authenticated - data not saved');
            return false;
        }

        try {
            const data = await this.baseStorage.exportAllData();
            const encryptedData = await authManager.encrypt(data);
            localStorage.setItem('finance_data', encryptedData);
            return true;
        } catch (error) {
            console.error('Failed to save encrypted data:', error);
            return false;
        }
    }

    /**
     * Load encrypted data from localStorage
     */
    async loadFromLocalStorage() {
        if (!authManager.isAuthenticated) {
            console.warn('Not authenticated - cannot load data');
            return false;
        }

        try {
            const encryptedData = localStorage.getItem('finance_data');

            if (!encryptedData) {
                console.log('No encrypted data found - starting fresh');
                return true;
            }

            const data = await authManager.decrypt(encryptedData);
            await this.baseStorage.importAllData(data);
            return true;
        } catch (error) {
            console.error('Failed to load encrypted data:', error);
            throw error;
        }
    }

    /**
     * Auto-save after any storage operation
     */
    async autoSave() {
        await this.saveToLocalStorage();
    }
}
class StorageManager {
    constructor() {
        // In-memory data store
        this.data = {
            transactions: [],
            goals: [],
            routines: [],
            settings: {},
            initialized: false
        };

        // Transaction ID counter
        this.transactionIdCounter = 1;
        this.goalIdCounter = 1;
        this.routineIdCounter = 1;
    }

    /**
     * Initialize storage system
     */
    async init() {
        try {
            console.log('Initializing Storage...');

            // Initialize with empty data structure
            this.data = {
                transactions: [],
                goals: [],
                routines: [],
                settings: {
                    currency: 'EUR',
                    currencySymbol: '€',
                    dateFormat: 'DD/MM/YYYY',
                    startingBalance: 0
                },
                initialized: true
            };

            this.transactionIdCounter = 1;
            this.goalIdCounter = 1;
            this.routineIdCounter = 1;

            console.log('Storage initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize storage:', error);
            throw error;
        }
    }

    /**
     * Get current balance
     */
    getBalance() {
        try {
            const startingBalance = this.data.settings.startingBalance || 0;
            const transactionsTotal = this.data.transactions.reduce((sum, t) => sum + t.amount, 0);
            return startingBalance + transactionsTotal;
        } catch (error) {
            console.error('Failed to get balance:', error);
            return 0;
        }
    }

    /**
     * Get total balance (alias for getBalance)
     */
    getTotalBalance() {
        return this.getBalance();
    }

    /**
     * Add a new transaction
     */
    async addTransaction(transactionData) {
        try {
            // Validate required fields
            if (!transactionData.amount || !transactionData.description) {
                throw new Error('Amount and description are required');
            }

            // Parse amount and ensure correct sign based on type
            let amount = parseFloat(transactionData.amount);
            const type = transactionData.type || (amount > 0 ? 'income' : 'expense');

            // CRITICAL: Ensure expenses are negative and income is positive
            if (type === 'expense' && amount > 0) {
                amount = -amount;
            } else if (type === 'income' && amount < 0) {
                amount = Math.abs(amount);
            }

            // Create transaction object
            const transaction = {
                id: this.transactionIdCounter++,
                type: type,
                amount: amount,
                category: transactionData.category || 'other',
                description: transactionData.description.trim(),
                date: transactionData.date || new Date().toISOString().split('T')[0],
                notes: transactionData.notes || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Add to transactions array
            this.data.transactions.push(transaction);

            // Sort by date (newest first)
            this.data.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

            console.log('Transaction added:', transaction);
            return transaction;
        } catch (error) {
            console.error('Failed to add transaction:', error);
            throw error;
        }
    }

    /**
     * Update an existing transaction
     */
    async updateTransaction(id, updates) {
        try {
            // Convert ID to number if it's a string
            const numericId = typeof id === 'string' ? parseInt(id) : id;

            const index = this.data.transactions.findIndex(t => t.id === numericId);
            if (index === -1) {
                console.error('Transaction not found with ID:', id);
                throw new Error('Transaction not found');
            }

            // Update transaction
            this.data.transactions[index] = {
                ...this.data.transactions[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            // Re-sort transactions
            this.data.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

            console.log('Transaction updated:', this.data.transactions[index]);
            return this.data.transactions[index];
        } catch (error) {
            console.error('Failed to update transaction:', error);
            throw error;
        }
    }

    /**
     * Delete a transaction
     */
    async deleteTransaction(id) {
        try {
            // Convert ID to number if it's a string
            const numericId = typeof id === 'string' ? parseInt(id) : id;

            const index = this.data.transactions.findIndex(t => t.id === numericId);
            if (index === -1) {
                console.error('Transaction not found with ID:', id, 'Numeric ID:', numericId);
                console.log('Available transactions:', this.data.transactions.map(t => ({ id: t.id, desc: t.description })));
                throw new Error('Transaction not found');
            }

            const deleted = this.data.transactions[index];
            this.data.transactions.splice(index, 1);

            console.log('Transaction deleted:', deleted);
            return true;
        } catch (error) {
            console.error('Failed to delete transaction:', error);
            throw error;
        }
    }

    /**
     * Get transactions with optional filters
     */
    async getTransactions(options = {}) {
        try {
            let transactions = [...this.data.transactions];

            // Apply filters
            if (options.type) {
                transactions = transactions.filter(t => t.type === options.type);
            }

            if (options.category) {
                transactions = transactions.filter(t => t.category === options.category);
            }

            if (options.startDate) {
                transactions = transactions.filter(t => t.date >= options.startDate);
            }

            if (options.endDate) {
                transactions = transactions.filter(t => t.date <= options.endDate);
            }

            if (options.search) {
                const searchLower = options.search.toLowerCase();
                transactions = transactions.filter(t =>
                    t.description.toLowerCase().includes(searchLower) ||
                    (t.notes && t.notes.toLowerCase().includes(searchLower))
                );
            }

            // Apply sorting
            if (options.sortBy) {
                transactions.sort((a, b) => {
                    if (options.sortBy === 'date') {
                        return options.sortOrder === 'asc'
                            ? new Date(a.date) - new Date(b.date)
                            : new Date(b.date) - new Date(a.date);
                    } else if (options.sortBy === 'amount') {
                        return options.sortOrder === 'asc'
                            ? a.amount - b.amount
                            : b.amount - a.amount;
                    }
                    return 0;
                });
            }

            // Apply limit
            if (options.limit) {
                transactions = transactions.slice(0, options.limit);
            }

            return transactions;
        } catch (error) {
            console.error('Failed to get transactions:', error);
            return [];
        }
    }

    /**
     * Get monthly summary
     */
    async getMonthlySummary(year, month) {
        try {
            const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
            const endDate = new Date(year, month, 0).toISOString().split('T')[0];

            const transactions = await this.getTransactions({
                startDate,
                endDate
            });

            const income = transactions
                .filter(t => t.amount > 0)
                .reduce((sum, t) => sum + t.amount, 0);

            const expenses = transactions
                .filter(t => t.amount < 0)
                .reduce((sum, t) => sum + Math.abs(t.amount), 0);

            return {
                year,
                month,
                income,
                expenses,
                savings: income - expenses,
                transactionCount: transactions.length
            };
        } catch (error) {
            console.error('Failed to get monthly summary:', error);
            return {
                year,
                month,
                income: 0,
                expenses: 0,
                savings: 0,
                transactionCount: 0
            };
        }
    }

    /**
     * Get financial trends for multiple months
     */
    async getFinancialTrends(months = 6) {
        try {
            const trends = [];
            const now = new Date();

            for (let i = months - 1; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;

                const summary = await this.getMonthlySummary(year, month);

                // Calculate balance at end of this month
                const monthEnd = new Date(year, month, 0);
                const transactionsUntilMonth = this.data.transactions.filter(t =>
                    new Date(t.date) <= monthEnd
                );
                const balance = this.data.settings.startingBalance +
                    transactionsUntilMonth.reduce((sum, t) => sum + t.amount, 0);

                trends.push({
                    month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                    income: summary.income,
                    expenses: summary.expenses,
                    balance: balance
                });
            }

            return trends;
        } catch (error) {
            console.error('Failed to get financial trends:', error);
            return [];
        }
    }

    /**
     * Get spending by category
     */
    async getSpendingByCategory(startDate, endDate) {
        try {
            const transactions = await this.getTransactions({
                startDate,
                endDate,
                type: 'expense'
            });

            const categoryTotals = {};

            transactions.forEach(t => {
                const category = t.category || 'other';
                const amount = Math.abs(t.amount);

                if (!categoryTotals[category]) {
                    categoryTotals[category] = 0;
                }
                categoryTotals[category] += amount;
            });

            // Convert to array and sort by amount
            return Object.entries(categoryTotals)
                .map(([category, amount]) => ({ category, amount }))
                .sort((a, b) => b.amount - a.amount);
        } catch (error) {
            console.error('Failed to get spending by category:', error);
            return [];
        }
    }

    /**
     * Add a new goal
     */
    async addGoal(goalData) {
        try {
            const goal = {
                id: this.goalIdCounter++,
                name: goalData.name,
                type: goalData.type || goalData.category || 'other',
                targetAmount: parseFloat(goalData.targetAmount),
                currentAmount: parseFloat(goalData.currentAmount || 0),
                deadline: goalData.deadline || goalData.targetDate,
                priority: goalData.priority || 'medium',
                category: goalData.category || goalData.type || 'other',
                description: goalData.description || goalData.notes || '',
                notes: goalData.notes || goalData.description || '',
                isCompleted: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this.data.goals.push(goal);
            console.log('Goal added successfully:', goal);
            return goal;
        } catch (error) {
            console.error('Failed to add goal:', error);
            throw error;
        }
    }

    /**
     * Update a goal
     */
    async updateGoal(id, updates) {
        try {
            // Convert ID to number if it's a string
            const numericId = typeof id === 'string' ? parseInt(id) : id;

            const index = this.data.goals.findIndex(g => g.id === numericId);
            if (index === -1) {
                console.error('Goal not found with ID:', id);
                throw new Error('Goal not found');
            }

            // Check if goal is completed after update
            const goal = this.data.goals[index];
            const newCurrentAmount = updates.currentAmount !== undefined ?
                parseFloat(updates.currentAmount) : goal.currentAmount;

            const isCompleted = newCurrentAmount >= goal.targetAmount;

            this.data.goals[index] = {
                ...this.data.goals[index],
                ...updates,
                isCompleted: isCompleted,
                updatedAt: new Date().toISOString()
            };

            console.log('Goal updated:', this.data.goals[index]);
            return this.data.goals[index];
        } catch (error) {
            console.error('Failed to update goal:', error);
            throw error;
        }
    }

    /**
     * Delete a goal
     */
    async deleteGoal(id) {
        try {
            // Convert ID to number if it's a string
            const numericId = typeof id === 'string' ? parseInt(id) : id;

            const index = this.data.goals.findIndex(g => g.id === numericId);
            if (index === -1) {
                console.error('Goal not found with ID:', id, 'Numeric ID:', numericId);
                throw new Error('Goal not found');
            }

            const deleted = this.data.goals[index];
            this.data.goals.splice(index, 1);

            console.log('Goal deleted:', deleted);
            return true;
        } catch (error) {
            console.error('Failed to delete goal:', error);
            throw error;
        }
    }

    /**
     * Get all goals
     */
    async getGoals() {
        return [...this.data.goals];
    }

    /**
     * Add a new routine
     */
    async addRoutine(routineData) {
        try {
            // Parse amount and ensure correct sign based on type
            let amount = parseFloat(routineData.amount);
            const type = routineData.type || (amount > 0 ? 'income' : 'expense');

            // CRITICAL: Ensure expenses are negative and income is positive
            if (type === 'expense' && amount > 0) {
                amount = -amount;
            } else if (type === 'income' && amount < 0) {
                amount = Math.abs(amount);
            }

            const routine = {
                id: this.routineIdCounter++,
                name: routineData.name,
                amount: amount,
                type: type,
                frequency: routineData.frequency || 'monthly',
                category: routineData.category || 'other',

                // Installment-specific fields
                totalInstallments: routineData.totalInstallments || 1,
                installmentsRemaining: routineData.installmentsRemaining || routineData.totalInstallments || 1,
                lastPaymentDate: routineData.lastPaymentDate || null,

                // Legacy fields for compatibility
                nextDate: routineData.nextDate || routineData.startDate || new Date().toISOString().split('T')[0],
                startDate: routineData.startDate || routineData.nextDate || new Date().toISOString().split('T')[0],
                endDate: routineData.endDate || null,
                isActive: routineData.isActive !== undefined ? routineData.isActive : true,
                active: routineData.active !== undefined ? routineData.active : true,
                description: routineData.description || routineData.notes || '',
                notes: routineData.notes || routineData.description || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this.data.routines.push(routine);
            console.log('Installment added successfully:', routine);
            return routine;
        } catch (error) {
            console.error('Failed to add routine:', error);
            throw error;
        }
    }

    /**
     * Update a routine
     */
    async updateRoutine(id, updates) {
        try {
            // Convert ID to number if it's a string
            const numericId = typeof id === 'string' ? parseInt(id) : id;

            const index = this.data.routines.findIndex(r => r.id === numericId);
            if (index === -1) {
                console.error('Routine not found with ID:', id);
                throw new Error('Routine not found');
            }

            this.data.routines[index] = {
                ...this.data.routines[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            console.log('Routine updated:', this.data.routines[index]);
            return this.data.routines[index];
        } catch (error) {
            console.error('Failed to update routine:', error);
            throw error;
        }
    }

    /**
     * Delete a routine
     */
    async deleteRoutine(id) {
        try {
            // Convert ID to number if it's a string
            const numericId = typeof id === 'string' ? parseInt(id) : id;

            const index = this.data.routines.findIndex(r => r.id === numericId);
            if (index === -1) {
                console.error('Routine not found with ID:', id, 'Numeric ID:', numericId);
                throw new Error('Routine not found');
            }

            const deleted = this.data.routines[index];
            this.data.routines.splice(index, 1);

            console.log('Routine deleted:', deleted);
            return true;
        } catch (error) {
            console.error('Failed to delete routine:', error);
            throw error;
        }
    }

    /**
     * Get all routines
     */
    async getRoutines() {
        return [...this.data.routines];
    }

    /**
     * Export all data
     */
    async exportAllData() {
        return {
            version: '2.0.0',
            exportDate: new Date().toISOString(),
            data: {
                transactions: this.data.transactions,
                goals: this.data.goals,
                routines: this.data.routines,
                settings: this.data.settings
            }
        };
    }

    /**
     * Import all data
     */
    async importAllData(importData) {
        try {
            if (!importData.data) {
                throw new Error('Invalid import data format');
            }

            this.data = {
                transactions: importData.data.transactions || [],
                goals: importData.data.goals || [],
                routines: importData.data.routines || [],
                settings: importData.data.settings || {},
                initialized: true
            };

            // Update ID counters
            if (this.data.transactions.length > 0) {
                this.transactionIdCounter = Math.max(...this.data.transactions.map(t => t.id)) + 1;
            }
            if (this.data.goals.length > 0) {
                this.goalIdCounter = Math.max(...this.data.goals.map(g => g.id)) + 1;
            }
            if (this.data.routines.length > 0) {
                this.routineIdCounter = Math.max(...this.data.routines.map(r => r.id)) + 1;
            }

            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            throw error;
        }
    }

    /**
     * Clear all data
     */
    async clearAllData() {
        this.data = {
            transactions: [],
            goals: [],
            routines: [],
            settings: {
                currency: 'EUR',
                currencySymbol: '€',
                dateFormat: 'DD/MM/YYYY',
                startingBalance: 0
            },
            initialized: true
        };

        this.transactionIdCounter = 1;
        this.goalIdCounter = 1;
        this.routineIdCounter = 1;

        return true;
    }

    /**
     * Get application statistics
     */
    async getApplicationStats() {
        return {
            totalTransactions: this.data.transactions.length,
            totalGoals: this.data.goals.length,
            totalRoutines: this.data.routines.length,
            currentBalance: this.getBalance(),
            oldestTransaction: this.data.transactions.length > 0
                ? this.data.transactions[this.data.transactions.length - 1].date
                : null,
            newestTransaction: this.data.transactions.length > 0
                ? this.data.transactions[0].date
                : null
        };
    }
}

const Storage = new StorageManager();

// Wrap storage with encryption
const encryptedStorage = new EncryptedStorageWrapper(Storage);

// Override methods to auto-save encrypted data
const originalAddTransaction = Storage.addTransaction.bind(Storage);
Storage.addTransaction = async function (...args) {
    const result = await originalAddTransaction(...args);
    await encryptedStorage.autoSave();
    return result;
};

const originalUpdateTransaction = Storage.updateTransaction.bind(Storage);
Storage.updateTransaction = async function (...args) {
    const result = await originalUpdateTransaction(...args);
    await encryptedStorage.autoSave();
    return result;
};

const originalDeleteTransaction = Storage.deleteTransaction.bind(Storage);
Storage.deleteTransaction = async function (...args) {
    const result = await originalDeleteTransaction(...args);
    await encryptedStorage.autoSave();
    return result;
};

const originalAddGoal = Storage.addGoal.bind(Storage);
Storage.addGoal = async function (...args) {
    const result = await originalAddGoal(...args);
    await encryptedStorage.autoSave();
    return result;
};

const originalUpdateGoal = Storage.updateGoal.bind(Storage);
Storage.updateGoal = async function (...args) {
    const result = await originalUpdateGoal(...args);
    await encryptedStorage.autoSave();
    return result;
};

const originalDeleteGoal = Storage.deleteGoal.bind(Storage);
Storage.deleteGoal = async function (...args) {
    const result = await originalDeleteGoal(...args);
    await encryptedStorage.autoSave();
    return result;
};

const originalAddRoutine = Storage.addRoutine.bind(Storage);
Storage.addRoutine = async function (...args) {
    const result = await originalAddRoutine(...args);
    await encryptedStorage.autoSave();
    return result;
};

const originalUpdateRoutine = Storage.updateRoutine.bind(Storage);
Storage.updateRoutine = async function (...args) {
    const result = await originalUpdateRoutine(...args);
    await encryptedStorage.autoSave();
    return result;
};

const originalDeleteRoutine = Storage.deleteRoutine.bind(Storage);
Storage.deleteRoutine = async function (...args) {
    const result = await originalDeleteRoutine(...args);
    await encryptedStorage.autoSave();
    return result;
};

// Add method to load encrypted data
Storage.loadEncryptedData = () => encryptedStorage.loadFromLocalStorage();
Storage.saveEncryptedData = () => encryptedStorage.saveToLocalStorage();

// Make available globally
window.Storage = Storage;
window.encryptedStorage = encryptedStorage;
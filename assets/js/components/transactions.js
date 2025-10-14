/**
 * FinancePro - Transactions Component
 * Handles transaction management and display
 * 
 * @version 2.0.0
 */

class Transactions {
    constructor() {
        this.transactions = [];
        this.filteredTransactions = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filters = {
            type: 'all',
            category: 'all',
            startDate: '',
            endDate: '',
            search: ''
        };
        this.isInitialized = false;
    }

    /**
     * Initialize transactions component
     */
    async init() {
        try {
            await this.loadTransactions();
            this.renderTransactionsTab();
            this.setupEventListeners();

            this.isInitialized = true;
            console.log('Transactions component initialized');
        } catch (error) {
            console.error('Failed to initialize transactions:', error);
            throw error;
        }
    }

    /**
     * Load transactions from storage
     */
    async loadTransactions() {
        try {
            this.transactions = await Storage.getTransactions();
            this.applyFilters();
        } catch (error) {
            console.error('Failed to load transactions:', error);
            this.transactions = [];
            this.filteredTransactions = [];
        }
    }

    /**
     * Render the transactions tab content
     */
    renderTransactionsTab() {
        const tabContent = document.getElementById('transactions');
        if (!tabContent) return;

        tabContent.innerHTML = `
            <div class="transactions-container">
                <!-- Transaction Form -->
                <div class="transaction-form-card">
                    <div class="card-header">
                        <h3>Add Transaction</h3>
                    </div>
                    <form id="transactionForm" class="transaction-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Type</label>
                                <select id="transactionType" class="form-select" required>
                                    <option value="expense">💸 Expense</option>
                                    <option value="income">💰 Income</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Amount (€)</label>
                                <input type="number" id="transactionAmount" class="form-input" 
                                       placeholder="0.00" step="0.01" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Category</label>
                                <select id="transactionCategory" class="form-select" required>
                                    ${this.generateCategoryOptions('expense')}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Date</label>
                                <input type="date" id="transactionDate" class="form-input" 
                                       value="${new Date().toISOString().split('T')[0]}" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Description</label>
                            <input type="text" id="transactionDescription" class="form-input" 
                                   placeholder="Enter transaction description..." required>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">
                                Add Transaction
                            </button>
                            <button type="button" class="btn btn-secondary" id="clearForm">
                                Clear
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Transactions List -->
                <div class="transactions-list-card">
                    <div class="card-header">
                        <h3>Recent Transactions</h3>
                        <div class="card-actions">
                            <select id="transactionFilter" class="form-select">
                                <option value="all">All Transactions</option>
                                <option value="income">Income Only</option>
                                <option value="expense">Expenses Only</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Search and Filters -->
                    <div class="filters-section">
                        <div class="filter-row">
                            <div class="filter-group">
                                <input type="text" id="searchTransactions" class="form-input" 
                                       placeholder="Search transactions...">
                            </div>
                            <div class="filter-group">
                                <select id="categoryFilter" class="form-select">
                                    <option value="all">All Categories</option>
                                    ${this.generateAllCategoryOptions()}
                                </select>
                            </div>
                            <div class="filter-group">
                                <input type="date" id="startDateFilter" class="form-input" 
                                       placeholder="Start date">
                            </div>
                            <div class="filter-group">
                                <input type="date" id="endDateFilter" class="form-input" 
                                       placeholder="End date">
                            </div>
                        </div>
                    </div>

                    <!-- Transaction List -->
                    <div class="transaction-list" id="transactionList">
                        ${this.renderTransactionList()}
                    </div>

                    <!-- Pagination -->
                    <div class="pagination" id="transactionPagination">
                        ${this.renderPagination()}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate category options for expense transactions
     */
    generateCategoryOptions(type) {
        const categories = type === 'income' ?
            (typeof INCOME_CATEGORIES !== 'undefined' ? INCOME_CATEGORIES : [
                { id: 'salary', name: 'Salary' },
                { id: 'freelance', name: 'Freelance' },
                { id: 'other', name: 'Other Income' }
            ]) :
            (typeof EXPENSE_CATEGORIES !== 'undefined' ? EXPENSE_CATEGORIES : [
                { id: 'food', name: 'Food & Dining' },
                { id: 'transport', name: 'Transportation' },
                { id: 'shopping', name: 'Shopping' },
                { id: 'bills', name: 'Bills & Utilities' },
                { id: 'other', name: 'Other Expenses' }
            ]);

        return categories.map(category =>
            `<option value="${category.id}">${category.name}</option>`
        ).join('');
    }

    /**
     * Generate all category options for filter
     */
    generateAllCategoryOptions() {
        const expenseCategories = typeof EXPENSE_CATEGORIES !== 'undefined' ? EXPENSE_CATEGORIES : [];
        const incomeCategories = typeof INCOME_CATEGORIES !== 'undefined' ? INCOME_CATEGORIES : [];
        const allCategories = [...expenseCategories, ...incomeCategories];

        return allCategories.map(category =>
            `<option value="${category.id}">${category.name}</option>`
        ).join('');
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Transaction form
        const form = document.getElementById('transactionForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addTransaction();
            });
        }

        // Transaction type change
        const typeSelect = document.getElementById('transactionType');
        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                this.updateCategoryOptions(e.target.value);
            });
        }

        // Clear form button
        const clearBtn = document.getElementById('clearForm');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearForm();
            });
        }

        // Filters
        const filterElements = [
            'transactionFilter', 'searchTransactions',
            'categoryFilter', 'startDateFilter', 'endDateFilter'
        ];

        filterElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    this.updateFilters();
                });
                element.addEventListener('change', () => {
                    this.updateFilters();
                });
            }
        });
    }

    /**
     * Update category options based on transaction type
     */
    updateCategoryOptions(type) {
        const categorySelect = document.getElementById('transactionCategory');
        if (categorySelect) {
            categorySelect.innerHTML = this.generateCategoryOptions(type);
        }
    }

    /**
     * Add new transaction
     */
    async addTransaction() {
        try {
            const type = document.getElementById('transactionType').value;
            const amountInput = parseFloat(document.getElementById('transactionAmount').value);
            const category = document.getElementById('transactionCategory').value;
            const description = document.getElementById('transactionDescription').value;
            const date = document.getElementById('transactionDate').value;

            // Validation
            if (!amountInput || amountInput <= 0) {
                this.showNotification('Please enter a valid amount', 'danger');
                return;
            }

            if (!description.trim()) {
                this.showNotification('Please enter a description', 'danger');
                return;
            }

            // CRITICAL: Send positive amount and type to Storage
            // Storage will handle making expenses negative
            const transactionData = {
                type: type,                    // 'income' or 'expense'
                amount: Math.abs(amountInput), // Always positive
                category: category,
                description: description.trim(),
                date: date
            };

            console.log('Adding transaction:', transactionData);

            // Add to storage - Storage will handle the sign conversion
            const newTransaction = await Storage.addTransaction(transactionData);

            console.log('Transaction added:', newTransaction);

            // Update local data
            this.transactions.unshift(newTransaction);
            this.applyFilters();

            // Update UI
            this.updateTransactionList();
            this.clearForm();

            // Notify other components
            if (window.app && window.app.dashboard) {
                await window.app.dashboard.refresh(false);
            }

            // Update header balance
            if (window.app) {
                await window.app.updateHeaderBalance();
            }

            this.showNotification('Transaction added successfully!', 'success');

        } catch (error) {
            console.error('Failed to add transaction:', error);
            this.showNotification('Failed to add transaction: ' + error.message, 'danger');
        }
    }

    /**
     * Delete transaction
     */
    async deleteTransaction(id) {
        if (!confirm('Are you sure you want to delete this transaction?')) {
            return;
        }

        try {
            await Storage.deleteTransaction(id);

            // Update local data
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.applyFilters();

            // Update UI
            this.updateTransactionList();

            // Notify other components
            if (window.app && window.app.dashboard) {
                await window.app.dashboard.refresh(false);
            }

            // Update header balance
            if (window.app) {
                await window.app.updateHeaderBalance();
            }

            this.showNotification('Transaction deleted', 'info');

        } catch (error) {
            console.error('Failed to delete transaction:', error);
            this.showNotification('Failed to delete transaction', 'danger');
        }
    }

    /**
     * Clear form
     */
    clearForm() {
        const form = document.getElementById('transactionForm');
        if (form) {
            form.reset();
            document.getElementById('transactionDate').value = new Date().toISOString().split('T')[0];
            this.updateCategoryOptions('expense');
        }
    }

    /**
     * Update filters
     */
    updateFilters() {
        this.filters.type = document.getElementById('transactionFilter').value || 'all';
        this.filters.search = document.getElementById('searchTransactions').value.toLowerCase();
        this.filters.category = document.getElementById('categoryFilter').value || 'all';
        this.filters.startDate = document.getElementById('startDateFilter').value;
        this.filters.endDate = document.getElementById('endDateFilter').value;

        this.currentPage = 1;
        this.applyFilters();
        this.updateTransactionList();
    }

    /**
     * Apply filters to transactions
     */
    applyFilters() {
        let filtered = [...this.transactions];

        // Type filter
        if (this.filters.type !== 'all') {
            filtered = filtered.filter(t => t.type === this.filters.type);
        }

        // Category filter
        if (this.filters.category !== 'all') {
            filtered = filtered.filter(t => t.category === this.filters.category);
        }

        // Search filter
        if (this.filters.search) {
            filtered = filtered.filter(t =>
                t.description.toLowerCase().includes(this.filters.search) ||
                t.category.toLowerCase().includes(this.filters.search)
            );
        }

        // Date filters
        if (this.filters.startDate) {
            filtered = filtered.filter(t => t.date >= this.filters.startDate);
        }

        if (this.filters.endDate) {
            filtered = filtered.filter(t => t.date <= this.filters.endDate);
        }

        this.filteredTransactions = filtered;
    }

    /**
     * Render transaction list
     */
    renderTransactionList() {
        if (!this.filteredTransactions.length) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">💳</div>
                    <h3>No transactions found</h3>
                    <p>Add your first transaction using the form above.</p>
                </div>
            `;
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageTransactions = this.filteredTransactions.slice(startIndex, endIndex);

        return pageTransactions.map(transaction => {
            const isIncome = transaction.amount > 0;
            const categoryInfo = this.getCategoryInfo(transaction.category);

            return `
                <div class="transaction-item">
                    <div class="transaction-icon ${isIncome ? 'income' : 'expense'}">
                        <span class="icon">${isIncome ? '💰' : '💸'}</span>
                    </div>
                    <div class="transaction-details">
                        <h4 class="transaction-title">${transaction.description}</h4>
                        <div class="transaction-meta">
                            <span class="category">${categoryInfo?.name || transaction.category}</span>
                            <span class="date">${this.formatDate(transaction.date)}</span>
                        </div>
                    </div>
                    <div class="transaction-amount ${isIncome ? 'positive' : 'negative'}">
                        ${isIncome ? '+' : ''}${this.formatCurrency(Math.abs(transaction.amount))}
                    </div>
                    <div class="transaction-actions">
                        <button class="btn-icon delete-btn" onclick="window.app.transactions.deleteTransaction('${transaction.id}')">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Update transaction list display
     */
    updateTransactionList() {
        const listContainer = document.getElementById('transactionList');
        if (listContainer) {
            listContainer.innerHTML = this.renderTransactionList();
        }

        const paginationContainer = document.getElementById('transactionPagination');
        if (paginationContainer) {
            paginationContainer.innerHTML = this.renderPagination();
        }
    }

    /**
     * Render pagination
     */
    renderPagination() {
        const totalPages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);

        if (totalPages <= 1) {
            return '';
        }

        let paginationHTML = '<div class="pagination-controls">';

        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `<button class="btn btn-secondary" onclick="window.app.transactions.goToPage(${this.currentPage - 1})">Previous</button>`;
        }

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const activeClass = i === this.currentPage ? 'btn-primary' : 'btn-secondary';
            paginationHTML += `<button class="btn ${activeClass}" onclick="window.app.transactions.goToPage(${i})">${i}</button>`;
        }

        // Next button
        if (this.currentPage < totalPages) {
            paginationHTML += `<button class="btn btn-secondary" onclick="window.app.transactions.goToPage(${this.currentPage + 1})">Next</button>`;
        }

        paginationHTML += '</div>';
        return paginationHTML;
    }

    /**
     * Go to specific page
     */
    goToPage(page) {
        this.currentPage = page;
        this.updateTransactionList();
    }

    /**
     * Get category information
     */
    getCategoryInfo(categoryId) {
        const allCategories = [
            ...(typeof EXPENSE_CATEGORIES !== 'undefined' ? EXPENSE_CATEGORIES : []),
            ...(typeof INCOME_CATEGORIES !== 'undefined' ? INCOME_CATEGORIES : [])
        ];

        return allCategories.find(cat => cat.id === categoryId);
    }

    /**
     * Format currency (fallback)
     */
    formatCurrency(amount) {
        return `€${(amount || 0).toFixed(2)}`;
    }

    /**
     * Format date (fallback)
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        if (window.app && typeof window.app.showNotification === 'function') {
            window.app.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Refresh transactions
     */
    async refresh() {
        await this.loadTransactions();
        this.updateTransactionList();
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        // Remove event listeners and clear data
        this.transactions = [];
        this.filteredTransactions = [];
        this.isInitialized = false;
        console.log('Transactions component cleaned up');
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Transactions;
}
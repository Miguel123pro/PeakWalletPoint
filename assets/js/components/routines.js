/**
 * FinancePro - Routines Component
 * Manages recurring transactions and automated financial routines
 * 
 * @version 2.0.0
 */

class Routines {
    constructor() {
        this.routines = [];
        this.isInitialized = false;
        this.checkInterval = null;
    }

    /**
     * Initialize routines component
     */
    async init() {
        try {
            await this.loadRoutines();
            this.setupEventListeners();
            await this.renderRoutinesInterface();
            this.startRoutineChecker();

            this.isInitialized = true;
            console.log('Routines component initialized');
        } catch (error) {
            console.error('Failed to initialize Routines:', error);
            throw error;
        }
    }

    /**
     * Load routines from storage
     */
    async loadRoutines() {
        try {
            this.routines = await Storage.getRoutines();
            console.log('Loaded routines:', this.routines.length);
        } catch (error) {
            console.error('Failed to load routines:', error);
            this.routines = [];
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Add routine buttons (multiple possible buttons)
        document.addEventListener('click', (e) => {
            if (e.target.matches('.add-routine-btn') ||
                e.target.closest('.add-routine-btn') ||
                e.target.matches('#addRoutineBtn') ||
                e.target.closest('#addRoutineBtn')) {
                e.preventDefault();
                this.showAddRoutineModal();
            }
        });

        // Edit routine buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-edit-routine]')) {
                const routineId = e.target.getAttribute('data-edit-routine');
                this.editRoutine(routineId);
            }
        });

        // Delete routine buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-delete-routine]')) {
                const routineId = e.target.getAttribute('data-delete-routine');
                this.deleteRoutine(routineId);
            }
        });

        // Toggle routine active/inactive
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-toggle-routine]')) {
                const routineId = e.target.getAttribute('data-toggle-routine');
                this.toggleRoutine(routineId);
            }
        });

        // Execute routine manually
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-execute-routine]')) {
                const routineId = e.target.getAttribute('data-execute-routine');
                this.executeRoutine(routineId);
            }
        });

        // Form submission
        document.addEventListener('submit', (e) => {
            if (e.target.matches('#routineForm')) {
                e.preventDefault();
                this.handleRoutineSubmit(e.target);
            }
        });
    }

    /**
     * Render routines interface
     */
    async renderRoutinesInterface() {
        const container = document.getElementById('routines');
        if (!container) return;

        const upcomingExecutions = this.getUpcomingExecutions();

        container.innerHTML = `
            <div class="routines-container">
                <!-- Routines Header -->
                <div class="routines-header">
                    <div class="header-content">
                        <h2>Financial Routines</h2>
                        <p>Automate recurring transactions and build healthy financial habits</p>
                    </div>
                    <button class="btn btn-primary" id="addRoutineBtn">
                        <span class="btn-icon plus-icon"></span>
                        Add Routine
                    </button>
                </div>

                <!-- Quick Stats -->
                <div class="routines-stats">
                    <div class="stat-card">
                        <div class="stat-icon active-routines-icon"></div>
                        <div class="stat-content">
                            <h3>Active Routines</h3>
                            <div class="stat-value">${this.routines.filter(r => r.isActive).length}</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon pending-icon"></div>
                        <div class="stat-content">
                            <h3>Pending Executions</h3>
                            <div class="stat-value">${upcomingExecutions.length}</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon monthly-impact-icon"></div>
                        <div class="stat-content">
                            <h3>Monthly Impact</h3>
                            <div class="stat-value">${Helpers.formatCurrency(this.calculateMonthlyImpact())}</div>
                        </div>
                    </div>
                </div>

                <!-- Upcoming Executions -->
                ${upcomingExecutions.length > 0 ? `
            < div class="upcoming-section" >
                    <h3>Upcoming Executions</h3>
                    <div class="upcoming-list">
                        ${upcomingExecutions.map(execution => `
                            <div class="upcoming-item">
                                <div class="upcoming-info">
                                    <div class="upcoming-name">${execution.routine.name}</div>
                                    <div class="upcoming-meta">
                                        ${Helpers.formatCurrency(execution.routine.amount)} • ${execution.daysUntil === 0 ? 'Today' : `${execution.daysUntil} days`}
                                    </div>
                                </div >
            <button class="btn btn-sm btn-primary" data-execute-routine="${execution.routine.id}">
                Execute Now
            </button>
                            </div >
            `).join('')}
                    </div>
                </div>
                ` : ''
            }

                
    <div class="routines-section">
        <h3>All Routines</h3>
        ${this.routines.length === 0 ? `
                        <div class="empty-state">
                            <div class="empty-icon routines-empty-icon"></div>
                            <h4>No routines yet</h4>
                            <p>Create your first routine to automate recurring transactions</p>
                            <button class="btn btn-primary add-routine-btn">
                                <span class="btn-icon plus-icon"></span>
                                Add Your First Routine
                            </button>
                        </div>
                    ` : `
                        <div class="routines-grid">
                            ${this.routines.map(routine => this.renderRoutineCard(routine)).join('')}
                        </div>
                    `}
    </div>
            </div >

           
    <div class="modal-overlay" id="routineModalOverlay" style="display: none;">
        <div class="modal routine-modal">
            <div class="modal-header">
                <h3 id="routineModalTitle">Add New Routine</h3>
                <button class="modal-close" id="closeRoutineModal">×</button>
            </div>
            <div class="modal-content">
                <form id="routineForm">
                    <input type="hidden" id="routineId" name="id">

                        <div class="form-group">
                            <label for="routineName">Routine Name</label>
                            <input type="text" id="routineName" name="name" class="form-control" required
                                placeholder="e.g., Monthly Salary, Weekly Groceries">
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="routineAmount">Amount</label>
                                <input type="number" id="routineAmount" name="amount" class="form-control"
                                    step="0.01" required placeholder="0.00">
                            </div>
                            <div class="form-group">
                                <label for="routineType">Type</label>
                                <select id="routineType" name="type" class="form-control" required>
                                    <option value="">Select type</option>
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label for="routineFrequency">Frequency</label>
                                <select id="routineFrequency" name="frequency" class="form-control" required>
                                    <option value="">Select frequency</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="biweekly">Bi-weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="routineCategory">Category</label>
                                <select id="routineCategory" name="category" class="form-control" required>
                                    <option value="">Select category</option>
                                    <!-- Categories will be populated dynamically -->
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="routineNextDate">Next Execution Date</label>
                            <input type="date" id="routineNextDate" name="nextDate" class="form-control" required>
                        </div>

                        <div class="form-group">
                            <label for="routineDescription">Description (Optional)</label>
                            <textarea id="routineDescription" name="description" class="form-control"
                                rows="2" placeholder="Additional notes about this routine"></textarea>
                        </div>

                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="routineActive" name="isActive" checked>
                                    <span class="checkmark"></span>
                                    Active (routine will execute automatically)
                            </label>
                        </div>

                        <div class="modal-actions">
                            <button type="button" class="btn btn-secondary" id="closeRoutineModal">Cancel</button>
                            <button type="submit" class="btn btn-primary">
                                <span class="btn-icon save-icon"></span>
                                Save Routine
                            </button>
                        </div>
                </form>
            </div>
        </div>
    </div>
`;

        // Setup modal close handlers
        document.getElementById('closeRoutineModal').addEventListener('click', () => {
            window.app.hideModal();
        });

        document.getElementById('routineModalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideRoutineModal();
            }
        });

        // Populate categories
        this.populateCategories();
    }

    /**
     * Render individual routine card
     */
    renderRoutineCard(routine) {
        const nextExecution = new Date(routine.nextDate);
        const today = new Date();
        const daysUntil = Math.ceil((nextExecution - today) / (1000 * 60 * 60 * 24));
        const isOverdue = daysUntil < 0;
        const isDue = daysUntil === 0;

        return `
    < div class="routine-card ${routine.isActive ? 'active' : 'inactive'}" >
                <div class="routine-header">
                    <div class="routine-info">
                        <h4 class="routine-name">${routine.name}</h4>
                        <div class="routine-meta">
                            <span class="routine-amount ${routine.amount > 0 ? 'positive' : 'negative'}">
                                ${Helpers.formatCurrency(Math.abs(routine.amount))}
                            </span>
                            <span class="routine-frequency">${this.formatFrequency(routine.frequency)}</span>
                        </div>
                    </div>
                    <div class="routine-status">
                        <span class="status-badge ${routine.isActive ? 'active' : 'inactive'}">
                            ${routine.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                <div class="routine-details">
                    <div class="detail-item">
                        <span class="detail-label">Category:</span>
                        <span class="detail-value">${this.getCategoryName(routine.category)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Next execution:</span>
                        <span class="detail-value ${isOverdue ? 'overdue' : isDue ? 'due' : ''}">
                            ${isOverdue ? `Overdue by ${Math.abs(daysUntil)} days` :
                isDue ? 'Due today' :
                    `In ${daysUntil} days (${Helpers.formatDate(routine.nextDate, 'short')})`}
                        </span>
                    </div>
                    ${routine.description ? `
                        <div class="detail-item">
                            <span class="detail-label">Description:</span>
                            <span class="detail-value">${routine.description}</span>
                        </div>
                    ` : ''}
                </div>

                <div class="routine-actions">
                    <button class="btn btn-sm btn-outline" data-toggle-routine="${routine.id}">
                        <span class="btn-icon ${routine.isActive ? 'pause' : 'play'}-icon"></span>
                        ${routine.isActive ? 'Pause' : 'Activate'}
                    </button>
                    <button class="btn btn-sm btn-outline" data-edit-routine="${routine.id}">
                        <span class="btn-icon edit-icon"></span>
                        Edit
                    </button>
                    <button class="btn btn-sm btn-primary" data-execute-routine="${routine.id}">
                        <span class="btn-icon play-icon"></span>
                        Execute
                    </button>
                    <button class="btn btn-sm btn-danger" data-delete-routine="${routine.id}">
                        <span class="btn-icon trash-icon"></span>
                        Delete
                    </button>
                </div>
            </div >
    `;
    }

    /**
     * Show add routine modal
     */
    /**
 * Show add routine modal using existing modal system
 */
    showAddRoutineModal() {
        const modalOverlay = document.getElementById('modalOverlay');
        const modal = document.getElementById('quickAddModal');

        if (modalOverlay && modal) {
            // Update modal header
            const modalHeader = modal.querySelector('.modal-header h3');
            if (modalHeader) {
                modalHeader.textContent = 'Add New Routine';
            }

            // Update modal content with routine form
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.innerHTML = this.generateRoutineFormHTML();
                this.setupRoutineForm();
            }

            // Show modal using existing system
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
 * Generate routine form HTML for the existing modal system
 */
    generateRoutineFormHTML() {
        return `
    < form id = "routineForm" class="form" >
        <input type="hidden" id="routineId" name="id">

            <div class="form-group">
                <label class="form-label">Routine Name</label>
                <input type="text" id="routineName" name="name" class="form-input" required
                    placeholder="e.g., Monthly Salary, Weekly Groceries">
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Amount</label>
                    <input type="number" id="routineAmount" name="amount" class="form-input"
                        step="0.01" required placeholder="0.00">
                </div>
                <div class="form-group">
                    <label class="form-label">Type</label>
                    <select id="routineType" name="type" class="form-select" required>
                        <option value="">Select type</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Frequency</label>
                    <select id="routineFrequency" name="frequency" class="form-select" required>
                        <option value="">Select frequency</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Category</label>
                    <select id="routineCategory" name="category" class="form-select" required>
                        <option value="">Select category</option>
                        <!-- Categories will be populated dynamically -->
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label class="form-label">Next Execution Date</label>
                <input type="date" id="routineNextDate" name="nextDate" class="form-input" required>
            </div>

            <div class="form-group">
                <label class="form-label">Description (Optional)</label>
                <textarea id="routineDescription" name="description" class="form-input"
                    rows="2" placeholder="Additional notes about this routine"></textarea>
            </div>

            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="routineActive" name="isActive" checked>
                        <span class="checkmark"></span>
                        Active (routine will execute automatically)
                </label>
            </div>

            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="app.hideModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">
                    <span class="btn-icon save-icon"></span>
                    Save Routine
                </button>
            </div>
        </form>
`;
    }

    /**
     * Setup routine form functionality
     */
    setupRoutineForm() {
        const form = document.getElementById('routineForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleRoutineSubmit(e.target);
            });
        }

        // Update categories when type changes
        const typeSelect = document.getElementById('routineType');
        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                this.updateRoutineCategories(e.target.value);
            });
        }

        // Set default next date to today
        const nextDateInput = document.getElementById('routineNextDate');
        if (nextDateInput && !nextDateInput.value) {
            nextDateInput.value = new Date().toISOString().split('T')[0];
        }

        // Populate initial categories
        this.updateRoutineCategories('expense'); // Default to expense
    }

    /**
     * Update category options based on transaction type
     */
    updateRoutineCategories(type) {
        const categorySelect = document.getElementById('routineCategory');
        if (!categorySelect) return;

        categorySelect.innerHTML = '<option value="">Select category</option>';

        if (type === 'income') {
            const incomeCategories = [
                { id: 'salary', name: 'Salary' },
                { id: 'freelance', name: 'Freelance' },
                { id: 'investment', name: 'Investment' },
                { id: 'business', name: 'Business' },
                { id: 'other-income', name: 'Other Income' }
            ];

            incomeCategories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                categorySelect.appendChild(option);
            });
        } else if (type === 'expense') {
            const expenseCategories = [
                { id: 'food', name: 'Food & Dining' },
                { id: 'transport', name: 'Transportation' },
                { id: 'shopping', name: 'Shopping' },
                { id: 'entertainment', name: 'Entertainment' },
                { id: 'bills', name: 'Bills & Utilities' },
                { id: 'healthcare', name: 'Healthcare' },
                { id: 'education', name: 'Education' },
                { id: 'travel', name: 'Travel' },
                { id: 'other', name: 'Other' }
            ];

            expenseCategories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                categorySelect.appendChild(option);
            });
        }
    }

    /**
     * Hide routine modal using existing modal system
     */
    hideRoutineModal() {
        const modalOverlay = document.getElementById('modalOverlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
        }
    }

    /**
     * Hide routine modal
     */
    hideRoutineModal() {
        const modal = document.getElementById('routineModalOverlay');
        modal.style.display = 'none';
    }

    /**
     * Populate category dropdown
     */
    populateCategories() {
        const categorySelect = document.getElementById('routineCategory');
        const typeSelect = document.getElementById('routineType');

        const updateCategories = () => {
            const type = typeSelect.value;
            categorySelect.innerHTML = '<option value="">Select category</option>';

            if (type === 'income') {
                const incomeCategories = [
                    { id: 'salary', name: 'Salary' },
                    { id: 'freelance', name: 'Freelance' },
                    { id: 'investment', name: 'Investment' },
                    { id: 'business', name: 'Business' },
                    { id: 'other-income', name: 'Other Income' }
                ];

                incomeCategories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.id;
                    option.textContent = cat.name;
                    categorySelect.appendChild(option);
                });
            } else if (type === 'expense') {
                const expenseCategories = [
                    { id: 'food', name: 'Food & Dining' },
                    { id: 'transport', name: 'Transportation' },
                    { id: 'shopping', name: 'Shopping' },
                    { id: 'entertainment', name: 'Entertainment' },
                    { id: 'bills', name: 'Bills & Utilities' },
                    { id: 'healthcare', name: 'Healthcare' },
                    { id: 'education', name: 'Education' },
                    { id: 'travel', name: 'Travel' },
                    { id: 'other', name: 'Other' }
                ];

                expenseCategories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.id;
                    option.textContent = cat.name;
                    categorySelect.appendChild(option);
                });
            }
        };

        typeSelect.addEventListener('change', updateCategories);
    }

    /**
     * Handle routine form submission
     */
    async handleRoutineSubmit(form) {
        try {
            const formData = new FormData(form);
            const routineData = {
                name: formData.get('name'),
                amount: parseFloat(formData.get('amount')),
                frequency: formData.get('frequency'),
                category: formData.get('category'),
                description: formData.get('description') || '',
                nextDate: formData.get('nextDate'),
                isActive: formData.get('isActive') === 'on'
            };

            // Validate required fields
            if (!routineData.name || !routineData.amount || !routineData.frequency || !routineData.category) {
                throw new Error('Please fill in all required fields');
            }

            const routineId = formData.get('id');
            let savedRoutine;

            if (routineId) {
                // Update existing routine
                savedRoutine = await Storage.updateRoutine(routineId, routineData);
                app.showNotification('Routine updated successfully', 'success');
            } else {
                // Add new routine
                savedRoutine = await Storage.addRoutine(routineData);
                app.showNotification('Routine added successfully', 'success');
            }

            // Refresh the interface
            await this.refresh();
            this.hideRoutineModal();

        } catch (error) {
            console.error('Failed to save routine:', error);
            app.showNotification('Failed to save routine: ' + error.message, 'danger');
        }
    }

    /**
     * Edit routine
     */
    async editRoutine(routineId) {
        const routine = this.routines.find(r => r.id === routineId);
        if (!routine) return;

        const modal = document.getElementById('routineModalOverlay');
        const title = document.getElementById('routineModalTitle');
        const form = document.getElementById('routineForm');

        title.textContent = 'Edit Routine';

        // Populate form with routine data
        document.getElementById('routineId').value = routine.id;
        document.getElementById('routineName').value = routine.name;
        document.getElementById('routineAmount').value = Math.abs(routine.amount);
        document.getElementById('routineType').value = routine.amount > 0 ? 'income' : 'expense';
        document.getElementById('routineFrequency').value = routine.frequency;
        document.getElementById('routineCategory').value = routine.category;
        document.getElementById('routineNextDate').value = routine.nextDate;
        document.getElementById('routineDescription').value = routine.description || '';
        document.getElementById('routineActive').checked = routine.isActive;

        // Trigger category update
        document.getElementById('routineType').dispatchEvent(new Event('change'));

        // Set category after categories are populated
        setTimeout(() => {
            document.getElementById('routineCategory').value = routine.category;
        }, 100);

        modal.style.display = 'flex';
    }

    /**
     * Delete routine
     */
    async deleteRoutine(routineId) {
        const routine = this.routines.find(r => r.id === routineId);
        if (!routine) return;

        if (!confirm(`Are you sure you want to delete the routine "${routine.name}" ? `)) {
            return;
        }

        try {
            await Storage.deleteRoutine(routineId);
            app.showNotification('Routine deleted successfully', 'success');
            await this.refresh();
        } catch (error) {
            console.error('Failed to delete routine:', error);
            app.showNotification('Failed to delete routine: ' + error.message, 'danger');
        }
    }

    /**
     * Toggle routine active/inactive
     */
    async toggleRoutine(routineId) {
        const routine = this.routines.find(r => r.id === routineId);
        if (!routine) return;

        try {
            const updatedRoutine = await Storage.updateRoutine(routineId, {
                isActive: !routine.isActive
            });

            app.showNotification(
                `Routine ${updatedRoutine.isActive ? 'activated' : 'paused'} `,
                'success'
            );

            await this.refresh();
        } catch (error) {
            console.error('Failed to toggle routine:', error);
            app.showNotification('Failed to update routine: ' + error.message, 'danger');
        }
    }

    /**
     * Execute routine manually
     */
    async executeRoutine(routineId) {
        const routine = this.routines.find(r => r.id === routineId);
        if (!routine) return;

        try {
            // Create transaction from routine
            const transaction = {
                description: `${routine.name} (Routine)`,
                amount: routine.amount,
                category: routine.category,
                type: routine.amount > 0 ? 'income' : 'expense',
                date: new Date().toISOString(),
                tags: ['routine']
            };

            await Storage.addTransaction(transaction);

            // Update next execution date
            const nextDate = this.calculateNextDate(routine.nextDate, routine.frequency);
            await Storage.updateRoutine(routineId, { nextDate });

            app.showNotification(`Routine "${routine.name}" executed successfully`, 'success');

            // Refresh routines and trigger dashboard update
            await this.refresh();
            if (window.Dashboard && window.Dashboard.isInitialized) {
                await window.Dashboard.refresh();
            }

        } catch (error) {
            console.error('Failed to execute routine:', error);
            app.showNotification('Failed to execute routine: ' + error.message, 'danger');
        }
    }

    /**
     * Start routine checker for automatic execution
     */
    startRoutineChecker() {
        // Check every hour for due routines
        this.checkInterval = setInterval(() => {
            this.checkDueRoutines();
        }, 60 * 60 * 1000);

        // Also check immediately
        this.checkDueRoutines();
    }

    /**
     * Check for due routines and execute them
     */
    async checkDueRoutines() {
        const today = new Date().toISOString().split('T')[0];

        for (const routine of this.routines) {
            if (routine.isActive && routine.nextDate <= today) {
                console.log(`Routine "${routine.name}" is due for execution`);
                // Could implement automatic execution here
                // For now, we'll just log it
            }
        }
    }

    /**
     * Calculate next execution date based on frequency
     */
    calculateNextDate(currentDate, frequency) {
        const date = new Date(currentDate);

        switch (frequency) {
            case 'daily':
                date.setDate(date.getDate() + 1);
                break;
            case 'weekly':
                date.setDate(date.getDate() + 7);
                break;
            case 'biweekly':
                date.setDate(date.getDate() + 14);
                break;
            case 'monthly':
                date.setMonth(date.getMonth() + 1);
                break;
            case 'quarterly':
                date.setMonth(date.getMonth() + 3);
                break;
            case 'yearly':
                date.setFullYear(date.getFullYear() + 1);
                break;
            default:
                date.setDate(date.getDate() + 1);
        }

        return date.toISOString().split('T')[0];
    }

    /**
     * Get upcoming routine executions
     */
    getUpcomingExecutions() {
        const today = new Date();
        const upcoming = [];

        for (const routine of this.routines) {
            if (!routine.isActive) continue;

            const nextDate = new Date(routine.nextDate);
            const daysUntil = Math.ceil((nextDate - today) / (1000 * 60 * 60 * 24));

            if (daysUntil <= 7) { // Show executions within 7 days
                upcoming.push({
                    routine,
                    daysUntil: Math.max(0, daysUntil)
                });
            }
        }

        return upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
    }

    /**
     * Calculate monthly financial impact of all routines
     */
    calculateMonthlyImpact() {
        let monthlyImpact = 0;

        for (const routine of this.routines) {
            if (!routine.isActive) continue;

            const amount = routine.amount;

            switch (routine.frequency) {
                case 'daily':
                    monthlyImpact += amount * 30;
                    break;
                case 'weekly':
                    monthlyImpact += amount * 4.33; // Approx weeks per month
                    break;
                case 'biweekly':
                    monthlyImpact += amount * 2.17; // Approx biweeks per month
                    break;
                case 'monthly':
                    monthlyImpact += amount;
                    break;
                case 'quarterly':
                    monthlyImpact += amount / 3;
                    break;
                case 'yearly':
                    monthlyImpact += amount / 12;
                    break;
            }
        }

        return monthlyImpact;
    }

    /**
     * Format frequency for display
     */
    formatFrequency(frequency) {
        const frequencies = {
            'daily': 'Daily',
            'weekly': 'Weekly',
            'biweekly': 'Bi-weekly',
            'monthly': 'Monthly',
            'quarterly': 'Quarterly',
            'yearly': 'Yearly'
        };
        return frequencies[frequency] || frequency;
    }

    /**
     * Get category display name
     */
    getCategoryName(categoryId) {
        const categories = {
            // Income categories
            'salary': 'Salary',
            'freelance': 'Freelance',
            'investment': 'Investment',
            'business': 'Business',
            'other-income': 'Other Income',
            // Expense categories
            'food': 'Food & Dining',
            'transport': 'Transportation',
            'shopping': 'Shopping',
            'entertainment': 'Entertainment',
            'bills': 'Bills & Utilities',
            'healthcare': 'Healthcare',
            'education': 'Education',
            'travel': 'Travel',
            'other': 'Other'
        };
        return categories[categoryId] || categoryId;
    }

    /**
     * Refresh routines interface
     */
    async refresh() {
        try {
            await this.loadRoutines();
            if (this.isInitialized) {
                await this.renderRoutinesInterface();
            }
        } catch (error) {
            console.error('Failed to refresh routines:', error);
        }
    }

    /**
     * Show routines tab
     */
    async show() {
        if (!this.isInitialized) {
            await this.init();
        } else {
            await this.refresh();
        }
    }

    /**
     * Hide routines tab
     */
    hide() {
        // Nothing specific needed
    }

    /**
     * Get component statistics
     */
    getStats() {
        const activeRoutines = this.routines.filter(r => r.isActive);
        const upcomingExecutions = this.getUpcomingExecutions();

        return {
            totalRoutines: this.routines.length,
            activeRoutines: activeRoutines.length,
            upcomingExecutions: upcomingExecutions.length,
            monthlyImpact: this.calculateMonthlyImpact()
        };
    }

    /**
     * Cleanup
     */
    cleanup() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }

        this.routines = [];
        this.isInitialized = false;
        console.log('Routines component cleaned up');
    }
}

// Make Routines available globally
window.Routines = Routines;
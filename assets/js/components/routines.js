/**
 * FinancePro - Installments Component (Previously Routines)
 * Manages installment payments for purchases and debts
 * 
 * @version 3.0.0
 * NEW: Installment payment system
 */

class Routines {
    constructor() {
        this.routines = [];
        this.isInitialized = false;
    }

    async init() {
        try {
            await this.loadRoutines();
            this.setupEventListeners();
            await this.renderRoutinesInterface();

            this.isInitialized = true;
            console.log('Installments component initialized');
        } catch (error) {
            console.error('Failed to initialize Installments:', error);
            throw error;
        }
    }

    async loadRoutines() {
        try {
            this.routines = await Storage.getRoutines();
            console.log('Loaded installments:', this.routines.length);
        } catch (error) {
            console.error('Failed to load installments:', error);
            this.routines = [];
        }
    }

    setupEventListeners() {
        // Use event delegation with closest() for better button detection
        document.addEventListener('click', (e) => {
            // Add installment
            const addBtn = e.target.closest('.add-routine-btn') || e.target.closest('#addRoutineBtn');
            if (addBtn) {
                e.preventDefault();
                this.showAddRoutineModal();
                return;
            }

            // Pay installment (execute)
            const executeBtn = e.target.closest('[data-execute-routine]');
            if (executeBtn) {
                e.preventDefault();
                const routineId = parseInt(executeBtn.getAttribute('data-execute-routine'));
                this.payInstallment(routineId);
                return;
            }

            // Edit installment
            const editBtn = e.target.closest('[data-edit-routine]');
            if (editBtn) {
                e.preventDefault();
                const routineId = parseInt(editBtn.getAttribute('data-edit-routine'));
                this.editRoutine(routineId);
                return;
            }

            // Delete installment
            const deleteBtn = e.target.closest('[data-delete-routine]');
            if (deleteBtn) {
                e.preventDefault();
                const routineId = parseInt(deleteBtn.getAttribute('data-delete-routine'));
                this.deleteRoutine(routineId);
                return;
            }

            // Toggle active/paused
            const toggleBtn = e.target.closest('[data-toggle-routine]');
            if (toggleBtn) {
                e.preventDefault();
                const routineId = parseInt(toggleBtn.getAttribute('data-toggle-routine'));
                this.toggleRoutine(routineId);
                return;
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

    async renderRoutinesInterface() {
        const container = document.getElementById('routines');
        if (!container) return;

        const activeInstallments = this.routines.filter(r => r.isActive && r.installmentsRemaining > 0);
        const upcomingPayments = this.getUpcomingPayments();
        const monthlyTotal = this.calculateMonthlyTotal();

        container.innerHTML = `
            <div class="routines-container">
                <div class="routines-header">
                    <div class="header-content">
                        <h2>Installment Payments</h2>
                        <p>Track purchases and debts split into monthly payments</p>
                    </div>
                    <button class="btn btn-primary" id="addRoutineBtn">
                        <span class="btn-icon plus-icon"></span>
                        Add Installment
                    </button>
                </div>

                <div class="routines-stats">
                    <div class="stat-card">
                        <div class="stat-icon active-routines-icon"></div>
                        <div class="stat-content">
                            <h3>Active Payments</h3>
                            <div class="stat-value">${activeInstallments.length}</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon pending-icon"></div>
                        <div class="stat-content">
                            <h3>Due This Month</h3>
                            <div class="stat-value">${upcomingPayments}</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon monthly-impact-icon"></div>
                        <div class="stat-content">
                            <h3>Monthly Total</h3>
                            <div class="stat-value">${Helpers.formatCurrency(monthlyTotal)}</div>
                        </div>
                    </div>
                </div>

                <div class="routines-section">
                    <h3>All Installments</h3>
                    ${this.routines.length === 0 ? `
                        <div class="empty-state">
                            <div class="empty-icon routines-empty-icon"></div>
                            <h4>No installments yet</h4>
                            <p>Add your first installment to track payments over time</p>
                            <button class="btn btn-primary add-routine-btn">
                                <span class="btn-icon plus-icon"></span>
                                Add Your First Installment
                            </button>
                        </div>
                    ` : `
                        <div class="routines-grid">
                            ${this.routines.map(routine => this.renderRoutineCard(routine)).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    renderRoutineCard(routine) {
        const totalInstallments = routine.totalInstallments || routine.installmentsRemaining || 1;
        const paid = totalInstallments - routine.installmentsRemaining;
        const progress = (paid / totalInstallments) * 100;
        const isComplete = routine.installmentsRemaining <= 0;
        const monthlyAmount = routine.amount; // Amount per month
        const totalAmount = monthlyAmount * totalInstallments;
        const remaining = monthlyAmount * routine.installmentsRemaining;

        // Calculate if payment is overdue
        const now = new Date();
        const lastPayment = routine.lastPaymentDate ? new Date(routine.lastPaymentDate) : new Date(routine.createdAt);
        const daysSinceLastPayment = Math.floor((now - lastPayment) / (1000 * 60 * 60 * 24));
        const isOverdue = daysSinceLastPayment > 30 && !isComplete;

        return `
            <div class="routine-card ${routine.isActive ? 'active' : 'inactive'} ${isComplete ? 'completed' : ''}">
                <div class="routine-header">
                    <div class="routine-info">
                        <h4 class="routine-name">${routine.name}</h4>
                        <div class="routine-meta">
                            <span class="routine-amount ${routine.type === 'income' ? 'positive' : 'negative'}">
                                ${Helpers.formatCurrency(monthlyAmount)}/month
                            </span>
                            <span class="routine-total">Total: ${Helpers.formatCurrency(totalAmount)}</span>
                        </div>
                    </div>
                    <div class="routine-status">
                        ${isComplete ?
                '<span class="status-badge completed">Completed</span>' :
                `<span class="status-badge ${routine.isActive ? 'active' : 'inactive'}">
                                ${routine.isActive ? 'Active' : 'Paused'}
                            </span>`
            }
                    </div>
                </div>

                <div class="installment-progress">
                    <div class="progress-info">
                        <span>${paid} of ${totalInstallments} payments made</span>
                        <span>${Helpers.formatCurrency(remaining)} remaining</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar">
                            <div class="progress-fill ${isComplete ? 'completed' : ''}" 
                                 style="width: ${progress}%"></div>
                        </div>
                        <span class="progress-percentage">${progress.toFixed(0)}%</span>
                    </div>
                </div>

                <div class="routine-details">
                    <div class="detail-item">
                        <span class="detail-label">Category:</span>
                        <span class="detail-value">${this.getCategoryName(routine.category)}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Payments left:</span>
                        <span class="detail-value ${isOverdue ? 'overdue' : ''}">
                            ${routine.installmentsRemaining} ${isOverdue ? '(Overdue)' : ''}
                        </span>
                    </div>
                    ${routine.description ? `
                        <div class="detail-item">
                            <span class="detail-label">Description:</span>
                            <span class="detail-value">${routine.description}</span>
                        </div>
                    ` : ''}
                    ${routine.lastPaymentDate ? `
                        <div class="detail-item">
                            <span class="detail-label">Last payment:</span>
                            <span class="detail-value">${Helpers.formatDate(routine.lastPaymentDate, 'relative')}</span>
                        </div>
                    ` : ''}
                </div>

                <div class="routine-actions">
                    ${!isComplete ? `
                        <button class="btn btn-sm btn-outline" data-toggle-routine="${routine.id}">
                            <span class="btn-icon ${routine.isActive ? 'pause' : 'play'}-icon"></span>
                            ${routine.isActive ? 'Pause' : 'Resume'}
                        </button>
                        <button class="btn btn-sm btn-outline" data-edit-routine="${routine.id}">
                            <span class="btn-icon edit-icon"></span>
                            Edit
                        </button>
                        <button class="btn btn-sm btn-primary" data-execute-routine="${routine.id}">
                            <span class="btn-icon play-icon"></span>
                            Pay Now
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-danger" data-delete-routine="${routine.id}">
                        <span class="btn-icon trash-icon"></span>
                        Delete
                    </button>
                </div>
            </div>
        `;
    }

    showAddRoutineModal() {
        const modalOverlay = document.getElementById('modalOverlay');
        const modal = document.getElementById('quickAddModal');

        if (modalOverlay && modal) {
            const modalHeader = modal.querySelector('.modal-header h3');
            if (modalHeader) {
                modalHeader.textContent = 'Add New Installment';
            }

            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.innerHTML = this.generateRoutineFormHTML();
                this.setupRoutineForm();
            }

            modalOverlay.classList.add('active');

            setTimeout(() => {
                const firstInput = modal.querySelector('input, select');
                if (firstInput) firstInput.focus();
            }, 150);
        }
    }

    generateRoutineFormHTML() {
        return `
            <form id="routineForm" class="form">
                <input type="hidden" id="routineId" name="id">

                <div class="form-group">
                    <label class="form-label">What are you paying for?</label>
                    <input type="text" id="routineName" name="name" class="form-input" required
                        placeholder="e.g., New Phone, Laptop, Car Repair">
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Total Amount (€)</label>
                        <input type="number" id="routineTotalAmount" class="form-input"
                            step="0.01" required placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Number of Months</label>
                        <input type="number" id="routineMonths" class="form-input"
                            min="2" max="60" required placeholder="3">
                    </div>
                </div>

                <div class="form-group installment-preview" id="installmentPreview" style="display: none;">
                    <div class="preview-box">
                        <strong>Monthly Payment:</strong>
                        <span id="monthlyPayment" class="amount-large">0.00€</span>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Type</label>
                        <select id="routineType" name="type" class="form-select" required>
                            <option value="expense" selected>Expense (I'm paying)</option>
                            <option value="income">Income (I'm receiving)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Category</label>
                        <select id="routineCategory" name="category" class="form-select" required>
                            <option value="">Select category</option>
                            <option value="shopping">Shopping</option>
                            <option value="electronics">Electronics</option>
                            <option value="transport">Transportation</option>
                            <option value="home">Home & Furniture</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="education">Education</option>
                            <option value="debt">Debt Payment</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Description (Optional)</label>
                    <textarea id="routineDescription" name="description" class="form-input"
                        rows="2" placeholder="Additional details about this payment plan"></textarea>
                </div>

                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="routineActive" name="isActive" checked>
                        <span class="checkmark"></span>
                        Active (ready to make payments)
                    </label>
                </div>

                <div class="form-actions">
                    <button type="button" class="btn btn-secondary btn-lg" onclick="app.hideModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary btn-lg">
                        <span class="btn-icon save-icon"></span>
                        Create Installment
                    </button>
                </div>
            </form>
        `;
    }

    setupRoutineForm() {
        const form = document.getElementById('routineForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleRoutineSubmit(e.target);
            });
        }

        // Calculate monthly payment on the fly
        const totalAmountInput = document.getElementById('routineTotalAmount');
        const monthsInput = document.getElementById('routineMonths');
        const preview = document.getElementById('installmentPreview');
        const monthlyPaymentSpan = document.getElementById('monthlyPayment');

        const updatePreview = () => {
            const total = parseFloat(totalAmountInput.value) || 0;
            const months = parseInt(monthsInput.value) || 0;

            if (total > 0 && months > 0) {
                const monthly = total / months;
                monthlyPaymentSpan.textContent = Helpers.formatCurrency(monthly);
                preview.style.display = 'block';
            } else {
                preview.style.display = 'none';
            }
        };

        totalAmountInput.addEventListener('input', updatePreview);
        monthsInput.addEventListener('input', updatePreview);

        // Update categories when type changes
        const typeSelect = document.getElementById('routineType');
        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                this.updateRoutineCategories(e.target.value);
            });
        }
    }

    updateRoutineCategories(type) {
        const categorySelect = document.getElementById('routineCategory');
        if (!categorySelect) return;

        categorySelect.innerHTML = '<option value="">Select category</option>';

        let categories = [];

        if (type === 'income') {
            categories = [
                { id: 'salary', name: 'Salary Advance' },
                { id: 'loan', name: 'Loan Payment Received' },
                { id: 'refund', name: 'Refund' },
                { id: 'other-income', name: 'Other Income' }
            ];
        } else {
            categories = [
                { id: 'shopping', name: 'Shopping' },
                { id: 'electronics', name: 'Electronics' },
                { id: 'transport', name: 'Transportation' },
                { id: 'home', name: 'Home & Furniture' },
                { id: 'healthcare', name: 'Healthcare' },
                { id: 'education', name: 'Education' },
                { id: 'debt', name: 'Debt Payment' },
                { id: 'other', name: 'Other' }
            ];
        }

        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            categorySelect.appendChild(option);
        });
    }

    async handleRoutineSubmit(form) {
        try {
            const formData = new FormData(form);

            const totalAmount = parseFloat(document.getElementById('routineTotalAmount').value);
            const months = parseInt(document.getElementById('routineMonths').value);
            const type = formData.get('type') || 'expense';

            if (!totalAmount || totalAmount <= 0) {
                throw new Error('Please enter a valid total amount');
            }

            if (!months || months < 2) {
                throw new Error('Number of months must be at least 2');
            }

            const monthlyAmount = totalAmount / months;

            const routineData = {
                name: formData.get('name'),
                amount: monthlyAmount,
                type: type,
                totalInstallments: months,
                installmentsRemaining: months,
                category: formData.get('category'),
                description: formData.get('description') || '',
                isActive: formData.get('isActive') === 'on',
                frequency: 'monthly', // Keep for compatibility
                nextDate: new Date().toISOString().split('T')[0],
                lastPaymentDate: null
            };

            if (!routineData.name || !routineData.category) {
                throw new Error('Please fill in all required fields');
            }

            const routineId = formData.get('id');

            if (routineId) {
                await Storage.updateRoutine(routineId, routineData);
                app.showNotification('Installment updated successfully', 'success');
            } else {
                await Storage.addRoutine(routineData);
                app.showNotification('Installment created successfully', 'success');
            }

            await this.refresh();

            if (window.app && window.app.hideModal) {
                window.app.hideModal();
            }

        } catch (error) {
            console.error('Failed to save installment:', error);
            app.showNotification('Failed to save: ' + error.message, 'danger');
        }
    }

    async payInstallment(routineId) {
        const routine = this.routines.find(r => r.id === routineId);
        if (!routine) return;

        if (routine.installmentsRemaining <= 0) {
            app.showNotification('This installment is already complete!', 'info');
            return;
        }

        if (!confirm(`Pay ${Helpers.formatCurrency(routine.amount)} for "${routine.name}"?`)) {
            return;
        }

        try {
            // Create transaction
            const transaction = {
                description: `${routine.name} (${routine.totalInstallments - routine.installmentsRemaining + 1}/${routine.totalInstallments})`,
                amount: Math.abs(routine.amount),
                category: routine.category,
                type: routine.type || 'expense',
                date: new Date().toISOString().split('T')[0]
            };

            await Storage.addTransaction(transaction);

            // Update installment
            const newRemaining = routine.installmentsRemaining - 1;
            const updates = {
                installmentsRemaining: newRemaining,
                lastPaymentDate: new Date().toISOString(),
                isActive: newRemaining > 0 // Deactivate if complete
            };

            await Storage.updateRoutine(routineId, updates);

            if (newRemaining === 0) {
                app.showNotification(`🎉 Congratulations! "${routine.name}" is fully paid!`, 'success', 5000);
            } else {
                app.showNotification(`Payment recorded! ${newRemaining} payments remaining`, 'success');
            }

            await this.refresh();

            if (window.app && window.app.dashboard) {
                await window.app.dashboard.refresh();
            }
            if (window.app) {
                await window.app.updateHeaderBalance();
            }

        } catch (error) {
            console.error('Failed to pay installment:', error);
            app.showNotification('Failed to process payment: ' + error.message, 'danger');
        }
    }

    async editRoutine(routineId) {
        const routine = this.routines.find(r => r.id === routineId);
        if (!routine) return;

        this.showAddRoutineModal();

        setTimeout(() => {
            const totalAmount = routine.amount * routine.totalInstallments;

            document.getElementById('routineId').value = routine.id;
            document.getElementById('routineName').value = routine.name;
            document.getElementById('routineTotalAmount').value = totalAmount;
            document.getElementById('routineMonths').value = routine.totalInstallments;
            document.getElementById('routineType').value = routine.type || 'expense';
            document.getElementById('routineCategory').value = routine.category;
            document.getElementById('routineDescription').value = routine.description || '';
            document.getElementById('routineActive').checked = routine.isActive;

            const modalHeader = document.querySelector('#quickAddModal .modal-header h3');
            if (modalHeader) {
                modalHeader.textContent = 'Edit Installment';
            }

            // Trigger preview update
            document.getElementById('routineTotalAmount').dispatchEvent(new Event('input'));
        }, 200);
    }

    async deleteRoutine(routineId) {
        const routine = this.routines.find(r => r.id === routineId);
        if (!routine) return;

        if (!confirm(`Delete "${routine.name}"? This cannot be undone.`)) {
            return;
        }

        try {
            await Storage.deleteRoutine(routineId);
            app.showNotification('Installment deleted', 'info');
            await this.refresh();
        } catch (error) {
            console.error('Failed to delete:', error);
            app.showNotification('Failed to delete: ' + error.message, 'danger');
        }
    }

    async toggleRoutine(routineId) {
        const routine = this.routines.find(r => r.id === routineId);
        if (!routine) return;

        try {
            await Storage.updateRoutine(routineId, {
                isActive: !routine.isActive
            });

            app.showNotification(
                `Installment ${!routine.isActive ? 'resumed' : 'paused'}`,
                'success'
            );

            await this.refresh();
        } catch (error) {
            console.error('Failed to toggle:', error);
            app.showNotification('Failed to update: ' + error.message, 'danger');
        }
    }

    getUpcomingPayments() {
        return this.routines.filter(r =>
            r.isActive &&
            r.installmentsRemaining > 0
        ).length;
    }

    calculateMonthlyTotal() {
        return this.routines
            .filter(r => r.isActive && r.installmentsRemaining > 0)
            .reduce((sum, r) => sum + Math.abs(r.amount), 0);
    }

    getCategoryName(categoryId) {
        const categories = {
            'shopping': 'Shopping',
            'electronics': 'Electronics',
            'transport': 'Transportation',
            'home': 'Home & Furniture',
            'healthcare': 'Healthcare',
            'education': 'Education',
            'debt': 'Debt Payment',
            'salary': 'Salary Advance',
            'loan': 'Loan Payment',
            'refund': 'Refund',
            'other': 'Other',
            'other-income': 'Other Income'
        };
        return categories[categoryId] || categoryId;
    }

    async refresh() {
        try {
            await this.loadRoutines();
            if (this.isInitialized) {
                await this.renderRoutinesInterface();
            }
        } catch (error) {
            console.error('Failed to refresh:', error);
        }
    }

    async show() {
        if (!this.isInitialized) {
            await this.init();
        } else {
            await this.refresh();
        }
    }

    hide() { }

    cleanup() {
        this.routines = [];
        this.isInitialized = false;
    }
}

window.Routines = Routines;
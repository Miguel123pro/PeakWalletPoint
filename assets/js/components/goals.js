/**
 * FinancePro - Goals Component
 * Manages financial goals and progress tracking
 * 
 * @version 2.0.0
 */

class Goals {
    constructor() {
        this.goals = [];
        this.isInitialized = false;
        this.eventListenersAttached = false;
    }

    /**
     * Initialize goals component
     */
    async init() {
        try {
            await this.loadGoals();
            await this.show();

            this.isInitialized = true;
            console.log('Goals component initialized');
        } catch (error) {
            console.error('Failed to initialize goals:', error);
            throw error;
        }
    }

    /**
     * Load goals from storage
     */
    async loadGoals() {
        try {
            this.goals = await Storage.getGoals();
        } catch (error) {
            console.error('Failed to load goals:', error);
            this.goals = [];
        }
    }

    /**
     * Render the goals tab content
     */
    renderGoalsTab() {
        const tabContent = document.getElementById('goals');
        if (!tabContent) return;

        tabContent.innerHTML = `
            <div class="goals-container">
                <!-- Goals Overview -->
                <div class="goals-overview">
                    <div class="overview-stats">
                        <div class="stat-card">
                            <div class="stat-icon goals-icon"></div>
                            <div class="stat-content">
                                <div class="stat-value">${this.goals.length}</div>
                                <div class="stat-label">Active Goals</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon completed-icon"></div>
                            <div class="stat-content">
                                <div class="stat-value">${this.getCompletedGoalsCount()}</div>
                                <div class="stat-label">Completed</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon target-amount-icon"></div>
                            <div class="stat-content">
                                <div class="stat-value">${this.formatCurrency(this.getTotalGoalAmount())}</div>
                                <div class="stat-label">Total Target</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon progress-icon"></div>
                            <div class="stat-content">
                                <div class="stat-value">${this.getAverageProgress()}%</div>
                                <div class="stat-label">Avg Progress</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Add Goal Form -->
                <div class="goal-form-card">
                    <div class="card-header">
                        <h3>Create New Goal</h3>
                        <button class="btn-secondary btn-sm" id="toggleGoalForm">
                            <span class="add-icon"></span>
                            Add Goal
                        </button>
                    </div>
                    <div class="goal-form-container" id="goalFormContainer" style="display: none;">
                        <form id="goalForm" class="goal-form">
                            <input type="hidden" id="goalId">
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Goal Name</label>
                                    <input type="text" id="goalName" class="form-input" 
                                           placeholder="e.g., Emergency Fund, Vacation..." required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Goal Type</label>
                                    <select id="goalType" class="form-select" required>
                                        ${this.generateGoalTypeOptions()}
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Target Amount (€)</label>
                                    <input type="number" id="goalTargetAmount" class="form-input" 
                                           placeholder="0.00" step="0.01" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Current Amount (€)</label>
                                    <input type="number" id="goalCurrentAmount" class="form-input" 
                                           placeholder="0.00" step="0.01" value="0">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Target Date</label>
                                    <input type="date" id="goalDeadline" class="form-input" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Priority</label>
                                    <select id="goalPriority" class="form-select">
                                        <option value="low">Low Priority</option>
                                        <option value="medium" selected>Medium Priority</option>
                                        <option value="high">High Priority</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Description (Optional)</label>
                                <textarea id="goalDescription" class="form-textarea" 
                                          placeholder="Describe your goal and why it's important to you..." rows="3"></textarea>
                            </div>
                            
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">
                                    <span class="add-icon"></span>
                                    <span id="goalFormSubmitText">Create Goal</span>
                                </button>
                                <button type="button" class="btn btn-secondary" id="cancelGoalForm">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Goals List -->
                <div class="goals-list-card">
                    <div class="card-header">
                        <h3>Your Goals</h3>
                        <div class="card-actions">
                            <select id="goalsSortBy" class="form-select">
                                <option value="deadline">Sort by Deadline</option>
                                <option value="progress">Sort by Progress</option>
                                <option value="priority">Sort by Priority</option>
                                <option value="amount">Sort by Amount</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="goals-list" id="goalsList">
                        ${this.renderGoalsList()}
                    </div>
                </div>
            </div>
        `;

        this.updateGoalFormMinDate();
    }

    /**
     * Generate goal type options
     */
    generateGoalTypeOptions() {
        const goalTypes = typeof GOAL_TYPES !== 'undefined' ? GOAL_TYPES : [
            { id: 'savings', name: 'Savings Goal' },
            { id: 'debt', name: 'Debt Payoff' },
            { id: 'purchase', name: 'Purchase Goal' },
            { id: 'emergency', name: 'Emergency Fund' },
            { id: 'vacation', name: 'Vacation Fund' },
            { id: 'retirement', name: 'Retirement' },
            { id: 'education', name: 'Education Fund' },
            { id: 'investment', name: 'Investment Goal' },
            { id: 'home', name: 'Home Purchase' },
            { id: 'other', name: 'Other Goal' }
        ];

        return goalTypes.map(type =>
            `<option value="${type.id}">${type.name}</option>`
        ).join('');
    }

    /**
     * Setup event listeners - USANDO EVENT DELEGATION NO CONTAINER PRINCIPAL
     */
    setupEventListeners() {
        const goalsTab = document.getElementById('goals');
        if (!goalsTab) {
            console.error('Goals tab not found!');
            return;
        }

        console.log('Setting up event listeners for goals...');

        // Remove listener antigo se existir
        if (this.clickHandler) {
            goalsTab.removeEventListener('click', this.clickHandler);
        }

        // Cria novo handler
        this.clickHandler = (e) => {
            console.log('Click detected in goals tab:', e.target);

            // Toggle Goal Form Button
            const toggleBtn = e.target.closest('#toggleGoalForm');
            if (toggleBtn) {
                console.log('Toggle button clicked');
                e.preventDefault();
                this.toggleGoalForm();
                return;
            }

            // Cancel Goal Form Button
            const cancelBtn = e.target.closest('#cancelGoalForm');
            if (cancelBtn) {
                console.log('Cancel button clicked');
                e.preventDefault();
                this.hideGoalForm();
                return;
            }

            // Update Progress Button
            const updateBtn = e.target.closest('[data-action="update-progress"]');
            if (updateBtn) {
                console.log('Update progress button clicked');
                e.preventDefault();
                const goalId = parseInt(updateBtn.getAttribute('data-goal-id'));
                console.log('Goal ID:', goalId, typeof goalId);
                this.showProgressModal(goalId);
                return;
            }

            // Edit Goal Button
            const editBtn = e.target.closest('[data-action="edit-goal"]');
            if (editBtn) {
                console.log('Edit button clicked');
                e.preventDefault();
                const goalId = parseInt(editBtn.getAttribute('data-goal-id'));
                console.log('Goal ID:', goalId, typeof goalId);
                this.editGoal(goalId);
                return;
            }

            // Delete Goal Button
            const deleteBtn = e.target.closest('[data-action="delete-goal"]');
            if (deleteBtn) {
                console.log('Delete button clicked');
                e.preventDefault();
                const goalId = parseInt(deleteBtn.getAttribute('data-goal-id'));
                console.log('Goal ID:', goalId, typeof goalId);
                this.deleteGoal(goalId);
                return;
            }

            // Create First Goal Button
            const createFirstBtn = e.target.closest('[data-action="create-first-goal"]');
            if (createFirstBtn) {
                console.log('Create first goal button clicked');
                e.preventDefault();
                this.showGoalForm();
                return;
            }
        };

        // Adiciona o listener
        goalsTab.addEventListener('click', this.clickHandler);

        // Remove listener antigo de submit se existir
        if (this.submitHandler) {
            goalsTab.removeEventListener('submit', this.submitHandler);
        }

        // Form submission
        this.submitHandler = (e) => {
            if (e.target.id === 'goalForm') {
                console.log('Form submitted');
                e.preventDefault();
                this.saveGoal();
            }
        };

        goalsTab.addEventListener('submit', this.submitHandler);

        // Remove listener antigo de change se existir
        if (this.changeHandler) {
            goalsTab.removeEventListener('change', this.changeHandler);
        }

        // Sort dropdown change
        this.changeHandler = (e) => {
            if (e.target.id === 'goalsSortBy') {
                console.log('Sort changed:', e.target.value);
                this.sortGoals(e.target.value);
            }
        };

        goalsTab.addEventListener('change', this.changeHandler);

        console.log('Event listeners configured successfully');
    }

    /**
     * Toggle goal form visibility
     */
    toggleGoalForm() {
        const container = document.getElementById('goalFormContainer');
        if (container.style.display === 'none') {
            this.showGoalForm();
        } else {
            this.hideGoalForm();
        }
    }

    /**
     * Show goal form
     */
    showGoalForm() {
        const container = document.getElementById('goalFormContainer');
        const toggleBtn = document.getElementById('toggleGoalForm');

        if (container && toggleBtn) {
            container.style.display = 'block';
            toggleBtn.innerHTML = '<span class="close-icon"></span> Cancel';
            toggleBtn.className = 'btn-danger btn-sm';

            setTimeout(() => {
                const firstInput = document.getElementById('goalName');
                if (firstInput) firstInput.focus();
            }, 100);
        }
    }

    /**
     * Hide goal form
     */
    hideGoalForm() {
        const container = document.getElementById('goalFormContainer');
        const toggleBtn = document.getElementById('toggleGoalForm');

        if (container && toggleBtn) {
            container.style.display = 'none';
            toggleBtn.innerHTML = '<span class="add-icon"></span> Add Goal';
            toggleBtn.className = 'btn-secondary btn-sm';

            this.clearGoalForm();
        }
    }

    /**
     * Clear goal form
     */
    clearGoalForm() {
        const form = document.getElementById('goalForm');
        if (form) {
            form.reset();
            const goalId = document.getElementById('goalId');
            const currentAmount = document.getElementById('goalCurrentAmount');
            const submitText = document.getElementById('goalFormSubmitText');

            if (goalId) goalId.value = '';
            if (currentAmount) currentAmount.value = '0';
            if (submitText) submitText.textContent = 'Create Goal';

            this.updateGoalFormMinDate();
        }
    }

    /**
     * Update minimum date for goal deadline
     */
    updateGoalFormMinDate() {
        const deadlineInput = document.getElementById('goalDeadline');
        if (deadlineInput) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            deadlineInput.min = tomorrow.toISOString().split('T')[0];
        }
    }

    /**
     * Save goal (create or update)
     */
    async saveGoal() {
        try {
            const goalId = document.getElementById('goalId').value;
            const name = document.getElementById('goalName').value.trim();
            const type = document.getElementById('goalType').value;
            const targetAmount = parseFloat(document.getElementById('goalTargetAmount').value);
            const currentAmount = parseFloat(document.getElementById('goalCurrentAmount').value) || 0;
            const deadline = document.getElementById('goalDeadline').value;
            const priority = document.getElementById('goalPriority').value;
            const description = document.getElementById('goalDescription').value.trim();

            // Validation
            if (!name) {
                this.showNotification('Please enter a goal name', 'danger');
                return;
            }

            if (!targetAmount || targetAmount <= 0) {
                this.showNotification('Please enter a valid target amount', 'danger');
                return;
            }

            if (currentAmount < 0) {
                this.showNotification('Current amount cannot be negative', 'danger');
                return;
            }

            if (currentAmount > targetAmount) {
                this.showNotification('Current amount cannot exceed target amount', 'danger');
                return;
            }

            const goalData = {
                name,
                type,
                targetAmount,
                currentAmount,
                deadline,
                priority,
                description
            };

            if (goalId) {
                // Update existing goal
                await Storage.updateGoal(goalId, goalData);

                const index = this.goals.findIndex(g => g.id === goalId);
                if (index !== -1) {
                    this.goals[index] = { ...this.goals[index], ...goalData };
                }

                this.showNotification('Goal updated successfully!', 'success');
            } else {
                // Add new goal
                const newGoal = await Storage.addGoal(goalData);
                this.goals.push(newGoal);
                this.showNotification('Goal created successfully!', 'success');

                if (currentAmount >= targetAmount) {
                    this.showNotification(`Congratulations! You've already achieved your ${name} goal!`, 'success');
                }
            }

            this.updateGoalsList();
            this.updateOverviewStats();
            this.hideGoalForm();

        } catch (error) {
            console.error('Failed to save goal:', error);
            this.showNotification('Failed to save goal', 'danger');
        }
    }

    /**
     * Edit goal
     */
    editGoal(goalId) {
        console.log('editGoal called with goalId:', goalId, typeof goalId);

        // CONVERTE PARA NÚMERO
        goalId = parseInt(goalId);

        const goal = this.goals.find(g => g.id === goalId);
        console.log('Goal found:', goal);

        if (!goal) {
            console.error('Goal not found!');
            return;
        }

        this.showGoalForm();

        setTimeout(() => {
            const fields = {
                goalId: goal.id,
                goalName: goal.name,
                goalType: goal.type,
                goalTargetAmount: goal.targetAmount,
                goalCurrentAmount: goal.currentAmount,
                goalDeadline: goal.deadline,
                goalPriority: goal.priority,
                goalDescription: goal.description || ''
            };

            Object.entries(fields).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.value = value;
                }
            });

            const submitText = document.getElementById('goalFormSubmitText');
            if (submitText) {
                submitText.textContent = 'Update Goal';
            }
        }, 150);
    }


    /**
     * Update goal progress
     */
    async updateGoalProgress(goalId, newAmount) {
        try {
            const goalIndex = this.goals.findIndex(g => g.id === goalId);
            if (goalIndex === -1) return;

            const goal = this.goals[goalIndex];
            const oldAmount = goal.currentAmount;
            const wasCompleted = goal.isCompleted;

            const updatedGoal = await Storage.updateGoal(goalId, { currentAmount: newAmount });
            this.goals[goalIndex] = updatedGoal;

            this.updateGoalsList();
            this.updateOverviewStats();

            if (!wasCompleted && updatedGoal.isCompleted) {
                this.showNotification(`Congratulations! You've completed your ${goal.name} goal!`, 'success');
                this.celebrateGoalCompletion(goal);
            } else if (newAmount > oldAmount) {
                this.showNotification(`Progress updated for ${goal.name}`, 'success');
            }

        } catch (error) {
            console.error('Failed to update goal progress:', error);
            this.showNotification('Failed to update progress', 'danger');
        }
    }

    /**
     * Delete goal
     */
    async deleteGoal(goalId) {
        console.log('deleteGoal called with goalId:', goalId, typeof goalId);

        // CONVERTE PARA NÚMERO
        goalId = parseInt(goalId);

        const goal = this.goals.find(g => g.id === goalId);
        console.log('Goal found:', goal);

        if (!goal) {
            console.error('Goal not found!');
            return;
        }

        if (!confirm(`Are you sure you want to delete the goal "${goal.name}"?`)) {
            return;
        }

        try {
            await Storage.deleteGoal(goalId);

            this.goals = this.goals.filter(g => g.id !== goalId);

            this.updateGoalsList();
            this.updateOverviewStats();

            this.showNotification('Goal deleted', 'info');

        } catch (error) {
            console.error('Failed to delete goal:', error);
            this.showNotification('Failed to delete goal', 'danger');
        }
    }

    /**
     * Sort goals
     */
    sortGoals(sortBy) {
        let sortedGoals = [...this.goals];

        switch (sortBy) {
            case 'deadline':
                sortedGoals.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
                break;
            case 'progress':
                sortedGoals.sort((a, b) => (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount));
                break;
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                sortedGoals.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
                break;
            case 'amount':
                sortedGoals.sort((a, b) => b.targetAmount - a.targetAmount);
                break;
        }

        this.goals = sortedGoals;
        this.updateGoalsList();
    }

    /**
     * Render goals list
     */
    renderGoalsList() {
        if (!this.goals.length) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">
                        <div class="goals-icon" style="width: 48px; height: 48px; opacity: 0.3;"></div>
                    </div>
                    <h3>No goals yet</h3>
                    <p>Create your first financial goal to start tracking your progress!</p>
                    <button class="btn btn-primary" data-action="create-first-goal">
                        <span class="add-icon"></span>
                        Create Your First Goal
                    </button>
                </div>
            `;
        }

        return this.goals.map(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const daysLeft = this.getDaysUntilDeadline(goal.deadline);
            const isCompleted = goal.isCompleted || goal.currentAmount >= goal.targetAmount;
            const isOverdue = daysLeft < 0 && !isCompleted;

            return `
                <div class="goal-item ${isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}">
                    <div class="goal-header">
                        <div class="goal-info">
                            <div class="goal-type-icon">
                                <i class="fi fi-rs-flag"></i>
                            </div>
                            <div>
                                <h4 class="goal-title">${goal.name}</h4>
                                <div class="goal-meta">
                                    <span class="goal-priority priority-${goal.priority}">${goal.priority.toUpperCase()}</span>
                                    <span class="goal-deadline">
                                        ${isOverdue ? `${Math.abs(daysLeft)} days overdue` :
                    daysLeft === 0 ? 'Due today' :
                        daysLeft === 1 ? '1 day left' :
                            `${daysLeft} days left`}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="goal-actions">
                            <button class="btn-icon" data-action="update-progress" data-goal-id="${goal.id}" title="Update Progress">
                                <span class="icon-chart"></span>
                            </button>
                            <button class="btn-icon" data-action="edit-goal" data-goal-id="${goal.id}" title="Edit Goal">
                                <span class="icon-edit"></span>
                            </button>
                            <button class="btn-icon delete-btn" data-action="delete-goal" data-goal-id="${goal.id}" title="Delete Goal">
                                <span class="icon-delete"></span>
                            </button>
                        </div>
                    </div>

                    <div class="goal-progress-section">
                        <div class="goal-amounts">
                            <span class="current-amount">${this.formatCurrency(goal.currentAmount)}</span>
                            <span class="target-amount">of ${this.formatCurrency(goal.targetAmount)}</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar">
                                <div class="progress-fill ${isCompleted ? 'completed' : ''}" 
                                     style="width: ${Math.min(progress, 100)}%"></div>
                            </div>
                            <span class="progress-percentage">${progress.toFixed(1)}%</span>
                        </div>
                    </div>

                    ${goal.description ? `
                        <div class="goal-description">
                            <p>${goal.description}</p>
                        </div>
                    ` : ''}

                    <div class="goal-insights">
                        ${this.generateGoalInsights(goal)}
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Update goals list display
     */
    updateGoalsList() {
        const listContainer = document.getElementById('goalsList');
        if (listContainer) {
            listContainer.innerHTML = this.renderGoalsList();
        }
    }

    /**
     * Update overview statistics
     */
    updateOverviewStats() {
        const tabContent = document.getElementById('goals');
        if (tabContent) {
            const statsSection = tabContent.querySelector('.overview-stats');
            if (statsSection) {
                statsSection.innerHTML = `
                    <div class="stat-card">
                        <div class="stat-icon goals-icon"></div>
                        <div class="stat-content">
                            <div class="stat-value">${this.goals.length}</div>
                            <div class="stat-label">Active Goals</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon completed-icon"></div>
                        <div class="stat-content">
                            <div class="stat-value">${this.getCompletedGoalsCount()}</div>
                            <div class="stat-label">Completed</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon target-amount-icon"></div>
                        <div class="stat-content">
                            <div class="stat-value">${this.formatCurrency(this.getTotalGoalAmount())}</div>
                            <div class="stat-label">Total Target</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon progress-icon"></div>
                        <div class="stat-content">
                            <div class="stat-value">${this.getAverageProgress()}%</div>
                            <div class="stat-label">Avg Progress</div>
                        </div>
                    </div>
                `;
            }
        }
    }

    /**
     * Show progress update modal
     */
    showProgressModal(goalId) {
        console.log('showProgressModal called with goalId:', goalId);

        // CONVERTE PARA NÚMERO
        goalId = parseInt(goalId);

        const goal = this.goals.find(g => g.id === goalId);
        console.log('Goal found:', goal);

        if (!goal) {
            console.error('Goal not found!');
            return;
        }

        // Remove modal antigo se existir
        const oldModal = document.getElementById('progressModal');
        if (oldModal) {
            oldModal.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'progressModal';
        modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>Update Progress: ${goal.name}</h3>
                <button class="modal-close" data-action="close-progress-modal">×</button>
            </div>
            <ред class="modal-content">
                <div class="progress-update-form">
                    <div class="current-progress">
                        <p>Current: ${this.formatCurrency(goal.currentAmount)} of ${this.formatCurrency(goal.targetAmount)}</p>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(goal.currentAmount / goal.targetAmount * 100)}%"></div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">New Amount (€)</label>
                        <input type="number" id="newProgressAmount" class="form-input" 
                               value="${goal.currentAmount}" step="0.01" min="0" max="${goal.targetAmount}">
                    </div>
                    
                    <div class="form-actions">
                        <button class="btn btn-primary" data-action="save-progress" data-goal-id="${goalId}">
                            <span class="save-icon"></span>
                            Update Progress
                        </button>
                        <button class="btn btn-secondary" data-action="close-progress-modal">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

        document.body.appendChild(modal);

        // Show modal
        setTimeout(() => modal.classList.add('active'), 10);

        // Setup event delegation for modal buttons
        modal.addEventListener('click', async (e) => {
            // Close button
            if (e.target.closest('[data-action="close-progress-modal"]')) {
                e.preventDefault();
                this.closeProgressModal();
                return;
            }

            // Save button
            if (e.target.closest('[data-action="save-progress"]')) {
                e.preventDefault();
                const btn = e.target.closest('[data-action="save-progress"]');
                const goalId = parseInt(btn.getAttribute('data-goal-id')); // CONVERTE AQUI TAMBÉM
                await this.saveProgress(goalId);
                return;
            }

            // Click outside modal
            if (e.target === modal) {
                this.closeProgressModal();
            }
        });

        // Focus on input
        setTimeout(() => {
            const input = document.getElementById('newProgressAmount');
            if (input) input.focus();
        }, 100);
    }


    /**
     * Save progress update
     */
    async saveProgress(goalId) {
        // CONVERTE PARA NÚMERO AQUI TAMBÉM
        goalId = parseInt(goalId);

        const newAmount = parseFloat(document.getElementById('newProgressAmount').value);

        if (isNaN(newAmount) || newAmount < 0) {
            this.showNotification('Please enter a valid amount', 'danger');
            return;
        }

        await this.updateGoalProgress(goalId, newAmount);
        this.closeProgressModal();
    }

    /**
     * Close progress modal
     */
    closeProgressModal() {
        const modal = document.getElementById('progressModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    /**
     * Generate goal insights
     */
    generateGoalInsights(goal) {
        const daysLeft = this.getDaysUntilDeadline(goal.deadline);
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        const remaining = goal.targetAmount - goal.currentAmount;

        if (goal.isCompleted || goal.currentAmount >= goal.targetAmount) {
            return '<div class="goal-insight success"><span class="success-icon"></span> Goal completed! Congratulations!</div>';
        }

        if (daysLeft <= 0) {
            return '<div class="goal-insight danger"><span class="warning-icon"></span> This goal is overdue. Consider adjusting the deadline.</div>';
        }

        if (daysLeft <= 7) {
            const dailyNeeded = remaining / daysLeft;
            return `<div class="goal-insight warning"><span class="clock-icon"></span> Only ${daysLeft} days left! Save ${this.formatCurrency(dailyNeeded)} daily.</div>`;
        }

        if (progress < 25 && daysLeft <= 30) {
            return '<div class="goal-insight info"><span class="trend-up-icon"></span> Consider increasing your savings rate to stay on track.</div>';
        }

        const monthlyNeeded = remaining / Math.max(1, Math.ceil(daysLeft / 30));
        return `<div class="goal-insight neutral"><span class="lightbulb-icon"></span> Save ${this.formatCurrency(monthlyNeeded)} monthly to reach your goal.</div>`;
    }

    /**
     * Get goal type icon
     */
    getGoalTypeIcon(type) {
        const icons = {
            savings: '<i class="fi fi-rs-piggy-bank"></i>',
            debt: '<i class="fi fi-rs-hand-holding-usd"></i>',
            purchase: '<i class="fi fi-rs-shopping-cart"></i>',
            emergency: '<i class="fi fi-rs-shield-check"></i>',
            vacation: '<i class="fi fi-rs-plane"></i>',
            retirement: '<i class="fi fi-rs-user-time"></i>',
            education: '<i class="fi fi-rs-graduation-cap"></i>',
            investment: '<i class="fi fi-rs-chart-line-up"></i>',
            home: '<i class="fi fi-rs-home"></i>',
            other: '<i class="fi fi-rs-flag"></i>'
        };
        return icons[type] || '<i class="fi fi-rs-flag"></i>';
    }

    /**
     * Get days until deadline
     */
    getDaysUntilDeadline(deadline) {
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Get completed goals count
     */
    getCompletedGoalsCount() {
        return this.goals.filter(g => g.isCompleted || g.currentAmount >= g.targetAmount).length;
    }

    /**
     * Get total goal amount
     */
    getTotalGoalAmount() {
        return this.goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    }

    /**
     * Get average progress
     */
    getAverageProgress() {
        if (!this.goals.length) return 0;

        const totalProgress = this.goals.reduce((sum, goal) => {
            return sum + ((goal.currentAmount / goal.targetAmount) * 100);
        }, 0);

        return Math.round(totalProgress / this.goals.length);
    }

    /**
     * Celebrate goal completion
     */
    celebrateGoalCompletion(goal) {
        console.log(`Goal "${goal.name}" completed!`);
    }

    /**
     * Format currency
     */
    formatCurrency(amount) {
        if (typeof Helpers !== 'undefined' && Helpers.formatCurrency) {
            return Helpers.formatCurrency(amount);
        }
        return `€${(amount || 0).toFixed(2)}`;
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
     * Refresh goals
     */
    async refresh() {
        await this.loadGoals();
        this.renderGoalsTab();
        this.setupEventListeners();
    }

    /**
     * Show goals tab
     */
    async show() {
        this.renderGoalsTab();
        // Configura os listeners DEPOIS do render
        this.setupEventListeners();
    }

    /**
     * Hide goals tab
     */
    hide() {
        // Cleanup if needed
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        this.goals = [];
        this.isInitialized = false;
        this.eventListenersAttached = false;
        console.log('Goals component cleaned up');
    }
}

// Make Goals available globally
window.Goals = Goals;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Goals;
}
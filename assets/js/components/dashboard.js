/**
 * FinancePro - Dashboard Component
 * Clean version with no sample data - ready for real data integration
 * 
 * @version 2.0.0
 */

class Dashboard {
    constructor() {
        this.charts = {};
        this.data = {
            metrics: {},
            trends: [],
            categories: [],
            recentActivity: []
        };
        this.refreshInterval = null;
        this.isInitialized = false;
    }

    /**
     * Format currency amounts
     */
    formatCurrency(amount) {
        if (typeof Helpers !== 'undefined' && Helpers.formatCurrency) {
            return Helpers.formatCurrency(amount);
        }
        return `€${(amount || 0).toFixed(2)}`;
    }

    /**
     * Format dates
     */
    formatDate(date, format = 'medium') {
        if (typeof Helpers !== 'undefined' && Helpers.formatDate) {
            return Helpers.formatDate(date, format);
        }

        const dateObj = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(dateObj.getTime())) return 'Invalid Date';

        if (format === 'relative') {
            const now = new Date();
            const diffDays = Math.floor((now - dateObj) / (1000 * 60 * 60 * 24));

            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Yesterday';
            if (diffDays > 0) return `${diffDays} days ago`;
            if (diffDays === -1) return 'Tomorrow';
            return `In ${Math.abs(diffDays)} days`;
        }

        return dateObj.toLocaleDateString();
    }

    /**
     * Initialize dashboard
     */
    async init() {
        try {
            console.log('Starting Dashboard...');

            await this.loadData();
            this.setupEventListeners();
            this.initializeCharts();
            this.startAutoRefresh();

            this.isInitialized = true;
            console.log('Dashboard initialized successfully');

        } catch (error) {
            console.error('Dashboard failed to start:', error);
            throw error;
        }
    }

    /**
     * Load all dashboard data
     */
    async loadData() {
        try {
            await this.loadMetrics();
            await this.loadTrends();
            await this.loadCategories();
            await this.loadRecentActivity();
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    }

    /**
     * Load financial metrics
     */
    async loadMetrics() {
        try {
            // Get data from Storage when available
            let totalBalance = 0;
            let monthlyIncome = 0;
            let monthlyExpenses = 0;
            let monthlySavings = 0;

            // Try to get real data from Storage
            if (typeof Storage !== 'undefined') {
                if (Storage.getBalance) {
                    totalBalance = Storage.getBalance();
                }

                if (Storage.getMonthlySummary) {
                    const now = new Date();
                    const currentMonth = now.getMonth() + 1;
                    const currentYear = now.getFullYear();

                    const summary = await Storage.getMonthlySummary(currentYear, currentMonth);
                    if (summary) {
                        monthlyIncome = summary.income || 0;
                        monthlyExpenses = summary.expenses || 0;
                        monthlySavings = monthlyIncome - monthlyExpenses;
                    }
                }
            }

            this.data.metrics = {
                totalBalance,
                monthlyIncome,
                monthlyExpenses,
                monthlySavings,
                changes: {
                    balance: 0,
                    income: 0,
                    expenses: 0,
                    savings: 0
                }
            };

            this.updateMetricsDisplay();

        } catch (error) {
            console.error('Failed to load metrics:', error);
            // Set safe defaults
            this.data.metrics = {
                totalBalance: 0,
                monthlyIncome: 0,
                monthlyExpenses: 0,
                monthlySavings: 0,
                changes: { balance: 0, income: 0, expenses: 0, savings: 0 }
            };
            this.updateMetricsDisplay();
        }
    }

    /**
     * Load financial trends
     */
    async loadTrends() {
        try {
            this.data.trends = [];

            // Try to get real data from Storage
            if (typeof Storage !== 'undefined' && Storage.getFinancialTrends) {
                this.data.trends = await Storage.getFinancialTrends(6);
            }

            if (this.charts.trendChart) {
                this.updateTrendChart();
            }
        } catch (error) {
            console.error('Failed to load trends:', error);
            this.data.trends = [];
        }
    }

    /**
     * Load spending categories
     */
    async loadCategories() {
        try {
            this.data.categories = [];

            // Try to get real data from Storage
            if (typeof Storage !== 'undefined' && Storage.getSpendingByCategory) {
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
                    .toISOString().split('T')[0];
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                    .toISOString().split('T')[0];

                this.data.categories = await Storage.getSpendingByCategory(startOfMonth, endOfMonth);
            }

            if (this.charts.categoryChart) {
                this.updateCategoryChart();
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
            this.data.categories = [];
        }
    }

    /**
     * Load recent activity
     */
    async loadRecentActivity() {
        try {
            this.data.recentActivity = [];

            // Try to get real data from Storage
            if (typeof Storage !== 'undefined' && Storage.getTransactions) {
                this.data.recentActivity = await Storage.getTransactions({ limit: 10 });
            }

            this.updateRecentActivity();
        } catch (error) {
            console.error('Failed to load recent activity:', error);
            this.data.recentActivity = [];
            this.updateRecentActivity();
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const categoryPeriod = document.getElementById('categoryPeriod');
        if (categoryPeriod) {
            categoryPeriod.addEventListener('change', (e) => {
                this.updateCategoryPeriod(e.target.value);
            });
        }

        const trendPeriod = document.getElementById('trendPeriod');
        if (trendPeriod) {
            trendPeriod.addEventListener('change', (e) => {
                this.updateTrendPeriod(e.target.value);
            });
        }
    }

    /**
     * Initialize charts
     */
    initializeCharts() {
        try {
            console.log('Initializing charts...');
            this.initializeCategoryChart();
            this.initializeTrendChart();
        } catch (error) {
            console.error('Failed to initialize charts:', error);
        }
    }

    /**
     * Initialize category chart
     */
    initializeCategoryChart() {
        try {
            const canvas = document.getElementById('categoryChart');
            if (!canvas) {
                console.warn('Category chart canvas not found');
                return;
            }

            const ctx = canvas.getContext('2d');

            this.charts.categoryChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
                            '#f59e0b', '#ef4444', '#ec4899', '#84cc16',
                            '#f97316', '#6b7280', '#14b8a6', '#a855f7'
                        ],
                        borderWidth: 0,
                        hoverBorderWidth: 2,
                        hoverBorderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                usePointStyle: true,
                                padding: 15,
                                color: '#e2e8f0',
                                font: {
                                    family: 'Inter',
                                    size: 11,
                                    weight: '500'
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: '#1e293b',
                            titleColor: '#e2e8f0',
                            bodyColor: '#94a3b8',
                            borderColor: '#334155',
                            borderWidth: 1,
                            cornerRadius: 8,
                            callbacks: {
                                label: (context) => {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                                    return `${label}: ${this.formatCurrency(value)} (${percentage}%)`;
                                }
                            }
                        }
                    },
                    cutout: '65%'
                }
            });

            this.updateCategoryChart();

        } catch (error) {
            console.error('Failed to initialize category chart:', error);
        }
    }

    /**
     * Initialize trend chart
     */
    initializeTrendChart() {
        try {
            const canvas = document.getElementById('trendChart');
            if (!canvas) {
                console.warn('Trend chart canvas not found');
                return;
            }

            const ctx = canvas.getContext('2d');

            this.charts.trendChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Income',
                            data: [],
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: '#10b981',
                            pointBorderColor: '#ffffff',
                            pointBorderWidth: 2,
                            pointRadius: 5,
                            pointHoverRadius: 7
                        },
                        {
                            label: 'Expenses',
                            data: [],
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderWidth: 3,
                            fill: true,
                            tension: 0.4,
                            pointBackgroundColor: '#ef4444',
                            pointBorderColor: '#ffffff',
                            pointBorderWidth: 2,
                            pointRadius: 5,
                            pointHoverRadius: 7
                        },
                        {
                            label: 'Balance',
                            data: [],
                            borderColor: '#6366f1',
                            backgroundColor: 'rgba(99, 102, 241, 0.05)',
                            borderWidth: 3,
                            fill: false,
                            tension: 0.4,
                            pointBackgroundColor: '#6366f1',
                            pointBorderColor: '#ffffff',
                            pointBorderWidth: 2,
                            pointRadius: 5,
                            pointHoverRadius: 7
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: '#e2e8f0',
                                font: {
                                    family: 'Inter',
                                    size: 11,
                                    weight: '500'
                                },
                                usePointStyle: true,
                                padding: 20
                            }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: '#1e293b',
                            titleColor: '#e2e8f0',
                            bodyColor: '#94a3b8',
                            borderColor: '#334155',
                            borderWidth: 1,
                            cornerRadius: 8,
                            callbacks: {
                                label: (context) => {
                                    const label = context.dataset.label || '';
                                    const value = context.parsed.y;
                                    return `${label}: ${this.formatCurrency(value)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#94a3b8',
                                font: {
                                    family: 'Inter',
                                    size: 10
                                }
                            }
                        },
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(148, 163, 184, 0.1)'
                            },
                            ticks: {
                                color: '#94a3b8',
                                font: {
                                    family: 'Inter',
                                    size: 10
                                },
                                callback: function (value) {
                                    return '€' + value.toLocaleString();
                                }
                            }
                        }
                    },
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                    }
                }
            });

            this.updateTrendChart();

        } catch (error) {
            console.error('Failed to initialize trend chart:', error);
        }
    }

    /**
     * Update metrics display
     */
    updateMetricsDisplay() {
        // Update main balance in header
        const headerBalance = document.getElementById('headerBalance');
        if (headerBalance) {
            headerBalance.textContent = this.formatCurrency(this.data.metrics.totalBalance);
        }

        // Update metric cards
        this.updateMetricValue('totalBalance', this.data.metrics.totalBalance);
        this.updateMetricValue('monthlyIncome', this.data.metrics.monthlyIncome);
        this.updateMetricValue('monthlyExpenses', this.data.metrics.monthlyExpenses);
        this.updateMetricValue('monthlySavings', this.data.metrics.monthlySavings);

        // Update change indicators
        this.updateMetricChange('balanceChange', this.data.metrics.changes.balance);
        this.updateMetricChange('incomeChange', this.data.metrics.changes.income);
        this.updateMetricChange('expenseChange', this.data.metrics.changes.expenses);
        this.updateMetricChange('savingsChange', this.data.metrics.changes.savings);
    }

    /**
     * Update individual metric value
     */
    updateMetricValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = this.formatCurrency(value);
        }
    }

    /**
     * Update individual metric change
     */
    updateMetricChange(elementId, change) {
        const element = document.getElementById(elementId);
        if (element) {
            const isPositive = change >= 0;
            element.textContent = `${isPositive ? '+' : ''}${change.toFixed(1)}%`;
            element.className = `metric-change ${isPositive ? 'positive' : 'negative'}`;
        }
    }

    /**
     * Update category chart
     */
    updateCategoryChart() {
        if (!this.charts.categoryChart) return;

        if (!this.data.categories.length) {
            // Show empty chart
            this.charts.categoryChart.data.labels = ['No Data'];
            this.charts.categoryChart.data.datasets[0].data = [1];
            this.charts.categoryChart.data.datasets[0].backgroundColor = ['#374151'];
            this.charts.categoryChart.update('none');
            return;
        }

        const categoryNames = {
            'food': 'Food & Dining',
            'transport': 'Transportation',
            'entertainment': 'Entertainment',
            'shopping': 'Shopping',
            'bills': 'Bills & Utilities',
            'healthcare': 'Healthcare',
            'education': 'Education',
            'travel': 'Travel',
            'other': 'Other'
        };

        const labels = this.data.categories.map(cat => categoryNames[cat.category] || cat.category);
        const data = this.data.categories.map(cat => cat.amount);

        this.charts.categoryChart.data.labels = labels;
        this.charts.categoryChart.data.datasets[0].data = data;
        this.charts.categoryChart.data.datasets[0].backgroundColor = [
            '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
            '#f59e0b', '#ef4444', '#ec4899', '#84cc16',
            '#f97316', '#6b7280', '#14b8a6', '#a855f7'
        ];
        this.charts.categoryChart.update('active');
    }

    /**
     * Update trend chart
     */
    updateTrendChart() {
        if (!this.charts.trendChart) return;

        if (!this.data.trends.length) {
            // Show empty chart
            this.charts.trendChart.data.labels = [];
            this.charts.trendChart.data.datasets[0].data = [];
            this.charts.trendChart.data.datasets[1].data = [];
            this.charts.trendChart.data.datasets[2].data = [];
            this.charts.trendChart.update('none');
            return;
        }

        const labels = this.data.trends.map(trend => trend.month);
        const incomeData = this.data.trends.map(trend => trend.income);
        const expenseData = this.data.trends.map(trend => trend.expenses);
        const balanceData = this.data.trends.map(trend => trend.balance);

        this.charts.trendChart.data.labels = labels;
        this.charts.trendChart.data.datasets[0].data = incomeData;
        this.charts.trendChart.data.datasets[1].data = expenseData;
        this.charts.trendChart.data.datasets[2].data = balanceData;
        this.charts.trendChart.update('active');
    }

    /**
     * Update recent activity
     */
    updateRecentActivity() {
        const container = document.getElementById('recentActivity');
        if (!container) return;

        if (!this.data.recentActivity.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"></div>
                    <p>No transactions yet</p>
                    <small>Add your first transaction to see activity here</small>
                </div>
            `;
            return;
        }

        const categoryNames = {
            'food': 'Food & Dining',
            'transport': 'Transportation',
            'entertainment': 'Entertainment',
            'shopping': 'Shopping',
            'bills': 'Bills & Utilities',
            'salary': 'Salary',
            'freelance': 'Freelance',
            'other': 'Other'
        };

        const html = this.data.recentActivity.map(transaction => {
            const isIncome = transaction.amount > 0;

            return `
                <div class="activity-item">
                    <div class="activity-icon ${isIncome ? 'income' : 'expense'}">
                        <div class="icon ${isIncome ? 'arrow-up' : 'arrow-down'}"></div>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">${transaction.description}</div>
                        <div class="activity-meta">
                            ${categoryNames[transaction.category] || transaction.category} • ${this.formatDate(transaction.date, 'relative')}
                        </div>
                    </div>
                    <div class="activity-amount ${isIncome ? 'positive' : 'negative'}">
                        ${this.formatCurrency(Math.abs(transaction.amount))}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    /**
     * Update category period
     */
    async updateCategoryPeriod(period) {
        console.log(`Updating category period to: ${period}`);
        await this.loadCategories();
    }

    /**
     * Update trend period
     */
    async updateTrendPeriod(period) {
        console.log(`Updating trend period to: ${period}`);
        await this.loadTrends();
    }

    /**
     * Start auto refresh
     */
    startAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        this.refreshInterval = setInterval(() => {
            this.loadData();
        }, 5 * 60 * 1000); // 5 minutes
    }

    /**
     * Stop auto refresh
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    /**
     * Refresh dashboard
     */
    async refresh(showNotification = true) {
        try {
            await this.loadData();

            if (showNotification && window.app && window.app.showNotification) {
                window.app.showNotification('Dashboard updated', 'success', 2000);
            }
        } catch (error) {
            console.error('Failed to refresh dashboard:', error);
        }
    }

    /**
     * Handle resize
     */
    handleResize() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }

    /**
     * Cleanup
     */
    cleanup() {
        this.stopAutoRefresh();

        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });

        this.charts = {};
        this.data = {
            metrics: {},
            trends: [],
            categories: [],
            recentActivity: []
        };
        this.isInitialized = false;

        console.log('Dashboard cleaned up');
    }


}


// Make Dashboard available globally
window.Dashboard = Dashboard;
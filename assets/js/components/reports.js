/**
 * FinancePro - Reports Component
 * Manages report generation and analytics interface
 * 
 * @version 2.0.0
 */

class Reports {
    constructor() {
        this.currentReport = null;
        this.isGenerating = false;
        this.reportHistory = [];
        this.isInitialized = false;
    }

    /**
     * Initialize reports component
     */
    async init() {
        try {
            this.setupEventListeners();
            this.loadReportHistory();
            await this.renderReportsInterface();

            this.isInitialized = true;
            console.log('Reports component initialized');
        } catch (error) {
            console.error('Failed to initialize Reports:', error);
            throw error;
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Report generation buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-generate-report]')) {
                const reportType = e.target.getAttribute('data-generate-report');
                this.generateReport(reportType);
            }
        });

        // Report period selectors
        document.addEventListener('change', (e) => {
            if (e.target.matches('[data-report-period]')) {
                const reportType = e.target.getAttribute('data-report-period');
                this.updateReportPreview(reportType, e.target.value);
            }
        });

        // Export buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-export-data]')) {
                const exportType = e.target.getAttribute('data-export-data');
                this.exportData(exportType);
            }
        });
    }

    /**
     * Load report generation history
     */
    loadReportHistory() {
        try {
            const history = localStorage.getItem('financepro-report-history');
            this.reportHistory = history ? JSON.parse(history) : [];
        } catch (error) {
            console.error('Failed to load report history:', error);
            this.reportHistory = [];
        }
    }

    /**
     * Save report to history
     */
    saveToHistory(reportInfo) {
        try {
            this.reportHistory.unshift(reportInfo);

            // Keep only last 10 reports
            if (this.reportHistory.length > 10) {
                this.reportHistory = this.reportHistory.slice(0, 10);
            }

            localStorage.setItem('financepro-report-history', JSON.stringify(this.reportHistory));
        } catch (error) {
            console.error('Failed to save report history:', error);
        }
    }

    /**
     * Render reports interface
     */
    async renderReportsInterface() {
        const container = document.getElementById('reports');
        if (!container) return;

        // Get current financial summary for preview
        const summary = await this.getFinancialSummary();

        container.innerHTML = `
            <div class="reports-container">
                <!-- Reports Header -->
                <div class="reports-header">
                    <h2>Financial Reports</h2>
                    <p>Generate comprehensive reports and export your financial data</p>
                </div>

                <!-- Quick Stats -->
                <div class="quick-stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon balance-icon"></div>
                        <div class="stat-content">
                            <h3>Current Balance</h3>
                            <div class="stat-value">${Helpers.formatCurrency(summary.totalBalance)}</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon transactions-icon"></div>
                        <div class="stat-content">
                            <h3>Total Transactions</h3>
                            <div class="stat-value">${summary.totalTransactions}</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon goals-icon"></div>
                        <div class="stat-content">
                            <h3>Active Goals</h3>
                            <div class="stat-value">${summary.activeGoals}</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon savings-icon"></div>
                        <div class="stat-content">
                            <h3>This Month Savings</h3>
                            <div class="stat-value ${summary.monthlySavings >= 0 ? 'positive' : 'negative'}">
                                ${Helpers.formatCurrency(summary.monthlySavings)}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Report Generation Section -->
                <div class="reports-section">
                    <h3>Generate Reports</h3>
                    
                    <div class="report-types-grid">
                        <!-- Weekly Report -->
                        <div class="report-card">
                            <div class="report-header">
                                <div class="report-icon weekly-icon"></div>
                                <div>
                                    <h4>Weekly Report</h4>
                                    <p>Last 7 days financial summary</p>
                                </div>
                            </div>
                            <div class="report-preview">
                                <div class="preview-item">
                                    <span>Transactions:</span>
                                    <span>${summary.weeklyTransactions}</span>
                                </div>
                                <div class="preview-item">
                                    <span>Income:</span>
                                    <span class="positive">${Helpers.formatCurrency(summary.weeklyIncome)}</span>
                                </div>
                                <div class="preview-item">
                                    <span>Expenses:</span>
                                    <span class="negative">${Helpers.formatCurrency(summary.weeklyExpenses)}</span>
                                </div>
                            </div>
                            <button class="btn btn-primary" data-generate-report="weekly">
                                <span class="btn-icon download-icon"></span>
                                Generate PDF
                            </button>
                        </div>

                        <!-- Monthly Report -->
                        <div class="report-card">
                            <div class="report-header">
                                <div class="report-icon monthly-icon"></div>
                                <div>
                                    <h4>Monthly Report</h4>
                                    <p>Comprehensive monthly analysis</p>
                                </div>
                            </div>
                            <div class="report-preview">
                                <div class="preview-item">
                                    <span>Transactions:</span>
                                    <span>${summary.monthlyTransactions}</span>
                                </div>
                                <div class="preview-item">
                                    <span>Categories:</span>
                                    <span>${summary.activeCategories}</span>
                                </div>
                                <div class="preview-item">
                                    <span>Savings Rate:</span>
                                    <span class="${summary.savingsRate >= 0 ? 'positive' : 'negative'}">
                                        ${summary.savingsRate.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            <button class="btn btn-primary" data-generate-report="monthly">
                                <span class="btn-icon download-icon"></span>
                                Generate PDF
                            </button>
                        </div>

                        <!-- Goals Report -->
                        <div class="report-card">
                            <div class="report-header">
                                <div class="report-icon goals-report-icon"></div>
                                <div>
                                    <h4>Goals Progress</h4>
                                    <p>Financial goals tracking report</p>
                                </div>
                            </div>
                            <div class="report-preview">
                                <div class="preview-item">
                                    <span>Total Goals:</span>
                                    <span>${summary.totalGoals}</span>
                                </div>
                                <div class="preview-item">
                                    <span>Completed:</span>
                                    <span class="positive">${summary.completedGoals}</span>
                                </div>
                                <div class="preview-item">
                                    <span>Avg Progress:</span>
                                    <span>${summary.avgGoalProgress.toFixed(1)}%</span>
                                </div>
                            </div>
                            <button class="btn btn-primary" data-generate-report="goals">
                                <span class="btn-icon download-icon"></span>
                                Generate PDF
                            </button>
                        </div>

                        <!-- Custom Report -->
                        <div class="report-card">
                            <div class="report-header">
                                <div class="report-icon custom-icon"></div>
                                <div>
                                    <h4>Custom Report</h4>
                                    <p>Choose your own date range</p>
                                </div>
                            </div>
                            <div class="report-options">
                                <div class="form-group">
                                    <label>Start Date:</label>
                                    <input type="date" id="customStartDate" class="form-control">
                                </div>
                                <div class="form-group">
                                    <label>End Date:</label>
                                    <input type="date" id="customEndDate" class="form-control">
                                </div>
                            </div>
                            <button class="btn btn-primary" data-generate-report="custom">
                                <span class="btn-icon download-icon"></span>
                                Generate PDF
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Data Export Section -->
                <div class="reports-section">
                    <h3>Export Data</h3>
                    
                    <div class="export-options">
                        <div class="export-card">
                            <div class="export-header">
                                <div class="export-icon json-icon"></div>
                                <div>
                                    <h4>Full Backup (JSON)</h4>
                                    <p>Complete data backup for restore</p>
                                </div>
                            </div>
                            <button class="btn btn-secondary" data-export-data="json">
                                <span class="btn-icon export-icon"></span>
                                Export JSON
                            </button>
                        </div>

                        <div class="export-card">
                            <div class="export-header">
                                <div class="export-icon csv-icon"></div>
                                <div>
                                    <h4>Transactions (CSV)</h4>
                                    <p>Transaction data for spreadsheets</p>
                                </div>
                            </div>
                            <button class="btn btn-secondary" data-export-data="csv">
                                <span class="btn-icon export-icon"></span>
                                Export CSV
                            </button>
                        </div>

                        <div class="export-card">
                            <div class="export-header">
                                <div class="export-icon pdf-icon"></div>
                                <div>
                                    <h4>All Reports (ZIP)</h4>
                                    <p>Generate all reports in one package</p>
                                </div>
                            </div>
                            <button class="btn btn-secondary" data-export-data="all-reports">
                                <span class="btn-icon export-icon"></span>
                                Export All
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Report History -->
                <div class="reports-section">
                    <h3>Recent Reports</h3>
                    <div class="report-history">
                        ${this.renderReportHistory()}
                    </div>
                </div>
            </div>
        `;

        // Set default dates for custom report
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        document.getElementById('customStartDate').value = startOfMonth.toISOString().split('T')[0];
        document.getElementById('customEndDate').value = today.toISOString().split('T')[0];
    }

    /**
     * Get financial summary for preview
     */
    async getFinancialSummary() {
        try {
            const totalBalance = await Storage.getTotalBalance();
            const transactions = await Storage.getTransactions();
            const goals = await Storage.getGoals();

            // Calculate date ranges
            const now = new Date();
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

            // Weekly data
            const weeklyTransactions = transactions.filter(t => new Date(t.date) >= weekAgo);
            const weeklyIncome = weeklyTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
            const weeklyExpenses = Math.abs(weeklyTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));

            // Monthly data
            const monthlyTransactions = transactions.filter(t => new Date(t.date) >= monthStart);
            const monthlyIncome = monthlyTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
            const monthlyExpenses = Math.abs(monthlyTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
            const monthlySavings = monthlyIncome - monthlyExpenses;
            const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

            // Goals data
            const activeGoals = goals.filter(g => !g.isCompleted);
            const completedGoals = goals.filter(g => g.isCompleted);
            const avgGoalProgress = goals.length > 0
                ? goals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount * 100), 0) / goals.length
                : 0;

            // Categories
            const categories = [...new Set(monthlyTransactions.map(t => t.category))];

            return {
                totalBalance,
                totalTransactions: transactions.length,
                weeklyTransactions: weeklyTransactions.length,
                weeklyIncome,
                weeklyExpenses,
                monthlyTransactions: monthlyTransactions.length,
                monthlySavings,
                savingsRate,
                activeGoals: activeGoals.length,
                totalGoals: goals.length,
                completedGoals: completedGoals.length,
                avgGoalProgress,
                activeCategories: categories.length
            };
        } catch (error) {
            console.error('Failed to get financial summary:', error);
            return {
                totalBalance: 0,
                totalTransactions: 0,
                weeklyTransactions: 0,
                weeklyIncome: 0,
                weeklyExpenses: 0,
                monthlyTransactions: 0,
                monthlySavings: 0,
                savingsRate: 0,
                activeGoals: 0,
                totalGoals: 0,
                completedGoals: 0,
                avgGoalProgress: 0,
                activeCategories: 0
            };
        }
    }

    /**
     * Generate report
     */
    async generateReport(reportType) {
        if (this.isGenerating) {
            app.showNotification('Report generation in progress...', 'info');
            return;
        }

        try {
            this.isGenerating = true;

            // Show loading state
            const button = document.querySelector(`[data-generate-report="${reportType}"]`);
            if (!button) {
                throw new Error('Generate button not found');
            }

            const originalText = button.innerHTML;
            button.innerHTML = '<span class="loading-spinner"></span> Generating...';
            button.disabled = true;

            app.showNotification('Generating report...', 'info', 3000);

            // Check if jsPDF is available
            if (typeof window.jspdf === 'undefined' && typeof jsPDF === 'undefined') {
                throw new Error('jsPDF library not loaded. Please check your internet connection and refresh the page.');
            }

            let filename;

            // Initialize PDF generator if not already done
            if (!window.PDFGenerator.isInitialized) {
                await window.PDFGenerator.init();
            }

            // Generate appropriate report
            switch (reportType) {
                case 'weekly':
                    filename = await window.PDFGenerator.generateWeeklyReport();
                    break;
                case 'monthly':
                    filename = await window.PDFGenerator.generateMonthlyReport();
                    break;
                case 'goals':
                    filename = await window.PDFGenerator.generateGoalsReport();
                    break;
                case 'custom':
                    filename = await this.generateCustomReport();
                    break;
                default:
                    throw new Error('Unknown report type');
            }

            // Save to history
            this.saveToHistory({
                type: reportType,
                filename: filename,
                generatedAt: new Date().toISOString(),
                size: 'Unknown' // PDF size not easily available
            });

            // Update history display
            this.updateReportHistory();

            app.showNotification(`${reportType} report generated successfully!`, 'success');

            // Reset button state
            button.innerHTML = originalText;
            button.disabled = false;

        } catch (error) {
            console.error('Failed to generate report:', error);
            app.showNotification('Failed to generate report: ' + error.message, 'danger');

            // Reset button state
            const button = document.querySelector(`[data-generate-report="${reportType}"]`);
            if (button) {
                button.innerHTML = '<span class="btn-icon download-icon"></span>Generate PDF';
                button.disabled = false;
            }
        } finally {
            this.isGenerating = false;
        }
    }

    /**
     * Generate custom report
     */
    async generateCustomReport() {
        const startDate = document.getElementById('customStartDate').value;
        const endDate = document.getElementById('customEndDate').value;

        if (!startDate || !endDate) {
            throw new Error('Please select both start and end dates');
        }

        if (new Date(startDate) > new Date(endDate)) {
            throw new Error('Start date must be before end date');
        }

        // Generate custom report with date range
        // This would need to be implemented in PDFGenerator
        return await window.PDFGenerator.generateCustomReport(startDate, endDate);
    }

    /**
     * Export data
     */
    async exportData(exportType) {
        try {
            app.showNotification('Preparing export...', 'info');

            switch (exportType) {
                case 'json':
                    await this.exportJSON();
                    break;
                case 'csv':
                    await this.exportCSV();
                    break;
                case 'all-reports':
                    await this.exportAllReports();
                    break;
                default:
                    throw new Error('Unknown export type');
            }

            app.showNotification('Data exported successfully!', 'success');

        } catch (error) {
            console.error('Failed to export data:', error);
            app.showNotification('Failed to export data: ' + error.message, 'danger');
        }
    }

    /**
     * Export JSON backup
     */
    async exportJSON() {
        const data = await Storage.exportAllData();

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `financepro-backup-${new Date().toISOString().split('T')[0]}.json`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }

    /**
     * Export CSV transactions
     */
    async exportCSV() {
        const transactions = await Storage.getTransactions();

        const csvHeaders = ['Date', 'Description', 'Category', 'Type', 'Amount'];
        const csvRows = transactions.map(t => [
            t.date.split('T')[0], // Date only
            `"${t.description}"`,
            t.category,
            t.type,
            t.amount
        ]);

        const csvContent = [csvHeaders, ...csvRows]
            .map(row => row.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `financepro-transactions-${new Date().toISOString().split('T')[0]}.csv`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }

    /**
     * Export all reports as ZIP (placeholder)
     */
    async exportAllReports() {
        // This would require a ZIP library or multiple file downloads
        // For now, generate all reports individually
        await this.generateReport('weekly');
        await this.generateReport('monthly');
        await this.generateReport('goals');

        app.showNotification('All reports generated. Check your downloads folder.', 'info', 5000);
    }

    /**
     * Render report history
     */
    renderReportHistory() {
        if (!this.reportHistory.length) {
            return `
                <div class="empty-state">
                    <p>No reports generated yet</p>
                    <small>Generate your first report above</small>
                </div>
            `;
        }

        return this.reportHistory.map(report => `
            <div class="history-item">
                <div class="history-icon ${report.type}-icon"></div>
                <div class="history-content">
                    <div class="history-title">${this.formatReportType(report.type)} Report</div>
                    <div class="history-meta">
                        ${Helpers.formatDate(report.generatedAt, 'relative')} • ${report.filename}
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Update report history display
     */
    updateReportHistory() {
        const historyContainer = document.querySelector('.report-history');
        if (historyContainer) {
            historyContainer.innerHTML = this.renderReportHistory();
        }
    }

    /**
     * Format report type for display
     */
    formatReportType(type) {
        const types = {
            'weekly': 'Weekly',
            'monthly': 'Monthly',
            'goals': 'Goals',
            'custom': 'Custom'
        };
        return types[type] || type;
    }

    /**
     * Update report preview
     */
    async updateReportPreview(reportType, period) {
        // This could be implemented to show different previews based on selected periods
        console.log(`Updating ${reportType} report preview for ${period}`);
    }

    /**
     * Refresh reports data and interface
     */
    async refresh() {
        try {
            console.log('Refreshing reports...');

            if (!this.isInitialized) {
                await this.init();
                return;
            }

            // Re-render the interface with updated data
            await this.renderReportsInterface();

            console.log('Reports refreshed successfully');

        } catch (error) {
            console.error('Failed to refresh reports:', error);
            throw error;
        }
    }

    /**
     * Show reports tab content
     */
    async show() {
        if (!this.isInitialized) {
            await this.init();
        } else {
            await this.refresh();
        }
    }

    /**
     * Hide reports tab content
     */
    hide() {
        // Nothing specific needed when hiding
    }

    /**
     * Get component statistics
     */
    getStats() {
        return {
            reportHistory: this.reportHistory.length,
            isGenerating: this.isGenerating,
            lastReport: this.reportHistory[0]?.type || 'None'
        };
    }

    /**
     * Cleanup
     */
    cleanup() {
        this.currentReport = null;
        this.isGenerating = false;
        this.isInitialized = false;
        console.log('Reports component cleaned up');
    }
}

// Make Reports available globally
window.Reports = Reports;
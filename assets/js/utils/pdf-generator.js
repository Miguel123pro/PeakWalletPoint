/**
 * FinancePro - PDF Generator
 * Creates professional PDF reports with charts and analytics
 * 
 * @version 2.0.0
 */

class PDFGenerator {
    constructor() {
        this.doc = null;
        this.pageWidth = 210; // A4 width in mm
        this.pageHeight = 297; // A4 height in mm
        this.margin = 20;
        this.currentY = 20;
        this.lineHeight = 6;
        this.isInitialized = false;
    }

    /**
     * Initialize PDF generator
     */
    init() {
        try {
            if (typeof window.jspdf === 'undefined') {
                throw new Error('jsPDF library not loaded');
            }

            this.isInitialized = true;
            console.log('PDF Generator initialized');
        } catch (error) {
            console.error('Failed to initialize PDF generator:', error);
            throw error;
        }
    }

    /**
     * Create new PDF document
     */
    createDocument(orientation = 'portrait') {
        const { jsPDF } = window.jspdf;
        this.doc = new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: 'a4'
        });

        this.currentY = this.margin;
        return this.doc;
    }

    /**
     * Generate weekly financial report
     */
    async generateWeeklyReport() {
        try {
            if (!this.isInitialized) {
                await this.init();
            }

            this.createDocument();

            // Get data for the report
            const reportData = await this.getWeeklyReportData();

            // Build report sections
            this.addReportHeader('Weekly Financial Report', reportData.dateRange);
            this.addExecutiveSummary(reportData.summary);
            this.addTransactionsSummary(reportData.transactions);
            this.addGoalsProgress(reportData.goals);
            this.addCategoryBreakdown(reportData.categories);
            this.addInsightsAndRecommendations(reportData.insights);
            this.addFooter();

            // Generate filename
            const filename = `FinancePro_Weekly_Report_${new Date().toISOString().split('T')[0]}.pdf`;

            // Save the PDF
            this.doc.save(filename);

            console.log('Weekly report generated successfully');
            return filename;

        } catch (error) {
            console.error('Failed to generate weekly report:', error);
            throw error;
        }
    }

    /**
     * Generate monthly financial report
     */
    async generateMonthlyReport() {
        try {
            if (!this.isInitialized) {
                await this.init();
            }

            this.createDocument();

            // Get data for the report
            const reportData = await this.getMonthlyReportData();

            // Build report sections
            this.addReportHeader('Monthly Financial Report', reportData.dateRange);
            this.addExecutiveSummary(reportData.summary);
            this.addDetailedTransactions(reportData.transactions);
            this.addGoalsProgress(reportData.goals);
            this.addCategoryAnalysis(reportData.categories);
            this.addTrendAnalysis(reportData.trends);
            this.addBudgetAnalysis(reportData.budget);
            this.addInsightsAndRecommendations(reportData.insights);
            this.addFooter();

            // Generate filename
            const filename = `FinancePro_Monthly_Report_${new Date().toISOString().split('T')[0]}.pdf`;

            // Save the PDF
            this.doc.save(filename);

            console.log('Monthly report generated successfully');
            return filename;

        } catch (error) {
            console.error('Failed to generate monthly report:', error);
            throw error;
        }
    }

    /**
     * Generate goals progress report
     */
    async generateGoalsReport() {
        try {
            if (!this.isInitialized) {
                await this.init();
            }

            this.createDocument();

            // Get goals data
            const goalsData = await this.getGoalsReportData();

            // Build report sections
            this.addReportHeader('Goals Progress Report', 'Current Status');
            this.addGoalsOverview(goalsData.overview);
            this.addDetailedGoalsProgress(goalsData.goals);
            this.addGoalsInsights(goalsData.insights);
            this.addActionPlan(goalsData.actionPlan);
            this.addFooter();

            // Generate filename
            const filename = `FinancePro_Goals_Report_${new Date().toISOString().split('T')[0]}.pdf`;

            // Save the PDF
            this.doc.save(filename);

            console.log('Goals report generated successfully');
            return filename;

        } catch (error) {
            console.error('Failed to generate goals report:', error);
            throw error;
        }
    }

    /**
     * Add report header
     */
    addReportHeader(title, subtitle) {
        // Company logo area (placeholder)
        this.doc.setFillColor(99, 102, 241);
        this.doc.rect(this.margin, this.currentY, 40, 15, 'F');

        this.doc.setTextColor(255, 255, 255);
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('FinancePro', this.margin + 5, this.currentY + 9);

        // Report title
        this.doc.setTextColor(0, 0, 0);
        this.doc.setFontSize(24);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(title, this.margin + 50, this.currentY + 10);

        // Subtitle and date
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(100, 100, 100);
        this.doc.text(subtitle, this.margin + 50, this.currentY + 18);
        this.doc.text(`Generated on ${new Date().toLocaleDateString()}`, this.margin + 50, this.currentY + 25);

        // Line separator
        this.currentY += 35;
        this.doc.setDrawColor(200, 200, 200);
        this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
        this.currentY += 10;
    }

    /**
     * Add executive summary section
     */
    addExecutiveSummary(summary) {
        this.addSectionTitle('Executive Summary');

        // Key metrics in boxes
        const metrics = [
            { label: 'Total Balance', value: this.formatCurrency(summary.totalBalance), color: [99, 102, 241] },
            { label: 'Period Income', value: this.formatCurrency(summary.income), color: [16, 185, 129] },
            { label: 'Period Expenses', value: this.formatCurrency(summary.expenses), color: [239, 68, 68] },
            { label: 'Net Savings', value: this.formatCurrency(summary.savings), color: summary.savings >= 0 ? [16, 185, 129] : [239, 68, 68] }
        ];

        const boxWidth = (this.pageWidth - 2 * this.margin - 15) / 4;
        let startX = this.margin;

        metrics.forEach(metric => {
            // Box background
            this.doc.setFillColor(metric.color[0], metric.color[1], metric.color[2]);
            this.doc.rect(startX, this.currentY, boxWidth, 20, 'F');

            // White text
            this.doc.setTextColor(255, 255, 255);
            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'normal');
            this.doc.text(metric.label, startX + 2, this.currentY + 6);

            this.doc.setFontSize(12);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(metric.value, startX + 2, this.currentY + 15);

            startX += boxWidth + 5;
        });

        this.currentY += 30;

        // Summary text
        this.doc.setTextColor(0, 0, 0);
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'normal');

        const summaryText = this.generateSummaryText(summary);
        const splitText = this.doc.splitTextToSize(summaryText, this.pageWidth - 2 * this.margin);
        this.doc.text(splitText, this.margin, this.currentY);
        this.currentY += splitText.length * this.lineHeight + 10;
    }

    /**
     * Add transactions summary
     */
    addTransactionsSummary(transactions) {
        this.addSectionTitle('Transactions Summary');

        if (!transactions.list.length) {
            this.doc.setFontSize(11);
            this.doc.text('No transactions recorded in this period.', this.margin, this.currentY);
            this.currentY += 20;
            return;
        }

        // Summary stats
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`Total Transactions: ${transactions.count}`, this.margin, this.currentY);
        this.doc.text(`Average Transaction: ${this.formatCurrency(transactions.average)}`, this.margin + 60, this.currentY);
        this.doc.text(`Largest Transaction: ${this.formatCurrency(transactions.largest)}`, this.margin + 120, this.currentY);
        this.currentY += 15;

        // Top transactions table
        this.addTableHeader(['Date', 'Description', 'Category', 'Amount']);

        const displayTransactions = transactions.list.slice(0, 10); // Show top 10
        displayTransactions.forEach(transaction => {
            const isIncome = transaction.amount > 0;
            this.doc.setTextColor(isIncome ? 16 : 239, isIncome ? 185 : 68, isIncome ? 129 : 68);

            this.addTableRow([
                new Date(transaction.date).toLocaleDateString(),
                this.truncateText(transaction.description, 25),
                this.getCategoryName(transaction.category),
                (isIncome ? '+' : '') + this.formatCurrency(Math.abs(transaction.amount))
            ]);
        });

        this.doc.setTextColor(0, 0, 0);
        this.currentY += 10;
    }

    /**
     * Add detailed transactions
     */
    addDetailedTransactions(transactions) {
        this.addSectionTitle('Detailed Transactions');

        // Group by category
        const byCategory = this.groupTransactionsByCategory(transactions.list);

        Object.entries(byCategory).forEach(([category, categoryTransactions]) => {
            this.doc.setFontSize(12);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(`${this.getCategoryName(category)} (${categoryTransactions.length} transactions)`, this.margin, this.currentY);
            this.currentY += 8;

            const categoryTotal = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'normal');
            this.doc.setTextColor(100, 100, 100);
            this.doc.text(`Total: ${this.formatCurrency(categoryTotal)}`, this.margin + 100, this.currentY - 8);
            this.doc.setTextColor(0, 0, 0);

            // Add transactions for this category
            categoryTransactions.slice(0, 5).forEach(transaction => {
                const isIncome = transaction.amount > 0;
                this.doc.setTextColor(isIncome ? 16 : 100, isIncome ? 185 : 100, isIncome ? 129 : 100);

                this.doc.text(
                    `${new Date(transaction.date).toLocaleDateString()} - ${this.truncateText(transaction.description, 30)} - ${(isIncome ? '+' : '') + this.formatCurrency(Math.abs(transaction.amount))}`,
                    this.margin + 5, this.currentY
                );
                this.currentY += 5;
            });

            this.doc.setTextColor(0, 0, 0);
            this.currentY += 5;

            // Check for page break
            this.checkPageBreak(50);
        });
    }

    /**
     * Add goals progress section
     */
    addGoalsProgress(goals) {
        this.addSectionTitle('Goals Progress');

        if (!goals.list.length) {
            this.doc.setFontSize(11);
            this.doc.text('No financial goals have been set.', this.margin, this.currentY);
            this.currentY += 20;
            return;
        }

        goals.list.forEach(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const daysLeft = this.calculateDaysLeft(goal.deadline);

            // Goal header
            this.doc.setFontSize(12);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(goal.name, this.margin, this.currentY);

            // Progress percentage
            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'normal');
            this.doc.setTextColor(100, 100, 100);
            this.doc.text(`${progress.toFixed(1)}% complete`, this.margin + 100, this.currentY);
            this.doc.setTextColor(0, 0, 0);

            this.currentY += 8;

            // Progress bar
            this.drawProgressBar(goal.currentAmount, goal.targetAmount);

            // Goal details
            this.doc.setFontSize(9);
            this.doc.text(`Target: ${this.formatCurrency(goal.targetAmount)} | Current: ${this.formatCurrency(goal.currentAmount)} | Days left: ${daysLeft}`, this.margin, this.currentY);
            this.currentY += 12;

            // Check for page break
            this.checkPageBreak(30);
        });
    }

    /**
     * Add detailed goals progress
     */
    addDetailedGoalsProgress(goals) {
        goals.forEach(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const daysLeft = this.calculateDaysLeft(goal.deadline);
            const monthlyNeeded = daysLeft > 0 ? (goal.targetAmount - goal.currentAmount) / Math.max(1, Math.ceil(daysLeft / 30)) : 0;

            // Goal box
            this.doc.setDrawColor(200, 200, 200);
            this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 35);

            // Goal name and type
            this.doc.setFontSize(14);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(goal.name, this.margin + 5, this.currentY + 8);

            this.doc.setFontSize(9);
            this.doc.setFont('helvetica', 'normal');
            this.doc.setTextColor(100, 100, 100);
            this.doc.text(this.getGoalTypeName(goal.type), this.margin + 5, this.currentY + 15);
            this.doc.setTextColor(0, 0, 0);

            // Progress info
            this.doc.setFontSize(11);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(`${progress.toFixed(1)}%`, this.pageWidth - this.margin - 30, this.currentY + 8);

            this.doc.setFontSize(9);
            this.doc.setFont('helvetica', 'normal');
            this.doc.text(`${this.formatCurrency(goal.currentAmount)} of ${this.formatCurrency(goal.targetAmount)}`, this.pageWidth - this.margin - 80, this.currentY + 15);

            // Progress bar
            const barWidth = 120;
            const barHeight = 6;
            const barX = this.pageWidth - this.margin - barWidth - 5;
            const barY = this.currentY + 20;

            // Background
            this.doc.setFillColor(240, 240, 240);
            this.doc.rect(barX, barY, barWidth, barHeight, 'F');

            // Progress fill
            const fillWidth = (progress / 100) * barWidth;
            this.doc.setFillColor(progress >= 100 ? 16 : progress >= 75 ? 245 : progress >= 50 ? 251 : 239,
                progress >= 100 ? 185 : progress >= 75 ? 158 : progress >= 50 ? 191 : 68,
                progress >= 100 ? 129 : progress >= 75 ? 11 : progress >= 50, 142, 68);
            this.doc.rect(barX, barY, fillWidth, barHeight, 'F');

            // Insights
            this.doc.setFontSize(9);
            this.doc.setTextColor(100, 100, 100);
            if (daysLeft > 0 && progress < 100) {
                this.doc.text(`Save ${this.formatCurrency(monthlyNeeded)} monthly to reach goal`, this.margin + 5, this.currentY + 30);
            } else if (progress >= 100) {
                this.doc.setTextColor(16, 185, 129);
                this.doc.text('Goal completed! Congratulations!', this.margin + 5, this.currentY + 30);
            } else {
                this.doc.setTextColor(239, 68, 68);
                this.doc.text('Goal overdue - consider adjusting target date', this.margin + 5, this.currentY + 30);
            }

            this.doc.setTextColor(0, 0, 0);
            this.currentY += 45;

            this.checkPageBreak(50);
        });
    }

    /**
     * Add goals overview section
     */
    addGoalsOverview(overview) {
        this.addSectionTitle('Goals Overview');

        // Overview metrics
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`Total Target Amount: ${this.formatCurrency(overview.totalTarget)}`, this.margin, this.currentY);
        this.doc.text(`Total Current Amount: ${this.formatCurrency(overview.totalCurrent)}`, this.margin + 80, this.currentY);
        this.doc.text(`Average Progress: ${overview.avgProgress.toFixed(1)}%`, this.margin + 160, this.currentY);
        this.currentY += 15;

        // Overall progress bar
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Overall Goals Progress:', this.margin, this.currentY);
        this.currentY += 8;

        this.drawProgressBar(overview.totalCurrent, overview.totalTarget);
        this.currentY += 10;
    }

    /**
     * Add goals insights section
     */
    addGoalsInsights(insights) {
        this.addSectionTitle('Goals Insights');

        if (!insights.length) {
            this.doc.setFontSize(11);
            this.doc.text('No specific insights available for your goals.', this.margin, this.currentY);
            this.currentY += 20;
            return;
        }

        insights.forEach(insight => {
            this.doc.setFontSize(10);
            this.doc.text(`• ${insight}`, this.margin + 5, this.currentY);
            this.currentY += 6;
        });

        this.currentY += 10;
    }

    /**
     * Add action plan section
     */
    addActionPlan(actionPlan) {
        this.addSectionTitle('Recommended Action Plan');

        if (!actionPlan.length) {
            this.doc.setFontSize(11);
            this.doc.text('All goals are on track or completed!', this.margin, this.currentY);
            this.currentY += 20;
            return;
        }

        actionPlan.forEach((plan, index) => {
            this.doc.setFontSize(11);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(`${index + 1}. ${plan.goal}`, this.margin, this.currentY);
            this.currentY += 6;

            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'normal');
            this.doc.setTextColor(100, 100, 100);
            const splitAction = this.doc.splitTextToSize(plan.action, this.pageWidth - 2 * this.margin - 10);
            this.doc.text(splitAction, this.margin + 5, this.currentY);
            this.currentY += splitAction.length * 5 + 8;

            this.doc.setTextColor(0, 0, 0);
            this.checkPageBreak(30);
        });
    }

    /**
     * Add category breakdown
     */
    addCategoryBreakdown(categories) {
        this.addSectionTitle('Spending by Category');

        if (!categories.length) {
            this.doc.setFontSize(11);
            this.doc.text('No spending data available.', this.margin, this.currentY);
            this.currentY += 20;
            return;
        }

        const total = categories.reduce((sum, cat) => sum + cat.amount, 0);

        categories.slice(0, 8).forEach(category => {
            const percentage = (category.amount / total) * 100;

            // Category name
            this.doc.setFontSize(11);
            this.doc.setFont('helvetica', 'normal');
            this.doc.text(this.getCategoryName(category.category), this.margin, this.currentY);

            // Amount and percentage
            this.doc.text(`${this.formatCurrency(category.amount)} (${percentage.toFixed(1)}%)`, this.margin + 80, this.currentY);

            // Progress bar
            const barWidth = 80;
            const barHeight = 4;
            const barX = this.margin + 130;

            this.doc.setFillColor(240, 240, 240);
            this.doc.rect(barX, this.currentY - 2, barWidth, barHeight, 'F');

            const fillWidth = (percentage / 100) * barWidth;
            this.doc.setFillColor(99, 102, 241);
            this.doc.rect(barX, this.currentY - 2, fillWidth, barHeight, 'F');

            this.currentY += 8;
        });

        this.currentY += 10;
    }

    /**
     * Add category analysis
     */
    addCategoryAnalysis(categories) {
        this.addSectionTitle('Category Analysis');

        const analysis = this.analyzeCategorySpending(categories);

        // Top spending category
        if (analysis.topCategory) {
            this.doc.setFontSize(11);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text('Highest Spending Category:', this.margin, this.currentY);
            this.doc.setFont('helvetica', 'normal');
            this.doc.text(`${analysis.topCategory.name} - ${this.formatCurrency(analysis.topCategory.amount)}`, this.margin + 60, this.currentY);
            this.currentY += 8;
        }

        // Category insights
        analysis.insights.forEach(insight => {
            this.doc.setFontSize(10);
            this.doc.text(`• ${insight}`, this.margin + 5, this.currentY);
            this.currentY += 6;
        });

        this.currentY += 10;
    }

    /**
     * Add trend analysis
     */
    addTrendAnalysis(trends) {
        this.addSectionTitle('Trend Analysis');

        if (trends.length < 2) {
            this.doc.setFontSize(11);
            this.doc.text('Insufficient data for trend analysis.', this.margin, this.currentY);
            this.currentY += 20;
            return;
        }

        const trendAnalysis = this.analyzeTrends(trends);

        trendAnalysis.forEach(trend => {
            this.doc.setFontSize(10);
            this.doc.setTextColor(trend.type === 'positive' ? 16 : trend.type === 'negative' ? 239 : 100,
                trend.type === 'positive' ? 185 : trend.type === 'negative' ? 68 : 100,
                trend.type === 'positive' ? 129 : trend.type === 'negative' ? 68 : 100);
            this.doc.text(`• ${trend.message}`, this.margin + 5, this.currentY);
            this.currentY += 6;
        });

        this.doc.setTextColor(0, 0, 0);
        this.currentY += 10;
    }

    /**
     * Add budget analysis
     */
    addBudgetAnalysis(budget) {
        if (!budget) return;

        this.addSectionTitle('Budget Analysis');

        // 50/30/20 rule analysis
        const needs = budget.needs || 0;
        const wants = budget.wants || 0;
        const savings = budget.savings || 0;
        const total = needs + wants + savings;

        if (total > 0) {
            this.doc.setFontSize(11);
            this.doc.text('50/30/20 Budget Rule Analysis:', this.margin, this.currentY);
            this.currentY += 10;

            const categories = [
                { label: 'Needs (Target: 50%)', amount: needs, target: 0.5, color: [239, 68, 68] },
                { label: 'Wants (Target: 30%)', amount: wants, target: 0.3, color: [245, 158, 11] },
                { label: 'Savings (Target: 20%)', amount: savings, target: 0.2, color: [16, 185, 129] }
            ];

            categories.forEach(category => {
                const actual = (category.amount / total);
                const percentage = (actual * 100).toFixed(1);
                const targetPercentage = (category.target * 100);
                const variance = actual - category.target;

                this.doc.setFontSize(10);
                this.doc.text(category.label, this.margin + 5, this.currentY);
                this.doc.text(`${percentage}% (Target: ${targetPercentage}%)`, this.margin + 80, this.currentY);

                // Status indicator
                const status = Math.abs(variance) < 0.05 ? 'On Track' : variance > 0 ? 'Over Budget' : 'Under Budget';
                this.doc.setTextColor(Math.abs(variance) < 0.05 ? 16 : variance > 0 ? 239 : 100,
                    Math.abs(variance) < 0.05 ? 185 : variance > 0 ? 68 : 100,
                    Math.abs(variance) < 0.05 ? 129 : variance > 0 ? 68 : 100);
                this.doc.text(status, this.margin + 140, this.currentY);
                this.doc.setTextColor(0, 0, 0);

                this.currentY += 7;
            });
        }

        this.currentY += 10;
    }

    /**
     * Add insights and recommendations
     */
    addInsightsAndRecommendations(insights) {
        this.addSectionTitle('Insights & Recommendations');

        if (!insights.length) {
            this.doc.setFontSize(11);
            this.doc.text('No specific insights available for this period.', this.margin, this.currentY);
            this.currentY += 20;
            return;
        }

        insights.forEach(insight => {
            const icon = insight.type === 'positive' ? '✓' : insight.type === 'warning' ? '⚠' : 'ℹ';

            this.doc.setFontSize(11);
            this.doc.setFont('helvetica', 'bold');
            this.doc.text(`${icon} ${insight.title}`, this.margin, this.currentY);
            this.currentY += 6;

            this.doc.setFontSize(10);
            this.doc.setFont('helvetica', 'normal');
            const splitText = this.doc.splitTextToSize(insight.message, this.pageWidth - 2 * this.margin - 10);
            this.doc.text(splitText, this.margin + 5, this.currentY);
            this.currentY += splitText.length * 5 + 8;

            this.checkPageBreak(30);
        });
    }

    /**
     * Add section title
     */
    addSectionTitle(title) {
        this.checkPageBreak(30);

        this.doc.setFontSize(16);
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(99, 102, 241);
        this.doc.text(title, this.margin, this.currentY);

        // Underline
        this.doc.setDrawColor(99, 102, 241);
        this.doc.line(this.margin, this.currentY + 2, this.margin + this.doc.getTextWidth(title), this.currentY + 2);

        this.doc.setTextColor(0, 0, 0);
        this.currentY += 12;
    }

    /**
     * Add footer to each page
     */
    /**
     * Add footer to each page
     */
    addFooter() {
        const pageCount = this.doc.internal.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {
            this.doc.setPage(i);

            // Footer line
            this.doc.setDrawColor(200, 200, 200);
            this.doc.line(this.margin, this.pageHeight - 15, this.pageWidth - this.margin, this.pageHeight - 15);

            // Footer text
            this.doc.setFontSize(8);
            this.doc.setFont('helvetica', 'normal');
            this.doc.setTextColor(100, 100, 100);

            // Left: Company info
            this.doc.text('Generated by FinancePro', this.margin, this.pageHeight - 8);

            // Center: Generation date
            const centerText = `Generated on ${new Date().toLocaleDateString()}`;
            const centerX = (this.pageWidth - this.doc.getTextWidth(centerText)) / 2;
            this.doc.text(centerText, centerX, this.pageHeight - 8);

            // Right: Page number
            const pageText = `Page ${i} of ${pageCount}`;
            const pageX = this.pageWidth - this.margin - this.doc.getTextWidth(pageText);
            this.doc.text(pageText, pageX, this.pageHeight - 8);
        }

        this.doc.setTextColor(0, 0, 0);
    }

    /**
     * Add table header
     */
    addTableHeader(headers) {
        const colWidth = (this.pageWidth - 2 * this.margin) / headers.length;
        let startX = this.margin;

        // Header background
        this.doc.setFillColor(99, 102, 241);
        this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 8, 'F');

        // Header text
        this.doc.setTextColor(255, 255, 255);
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'bold');

        headers.forEach(header => {
            this.doc.text(header, startX + 2, this.currentY + 5);
            startX += colWidth;
        });

        this.doc.setTextColor(0, 0, 0);
        this.currentY += 10;
    }

    /**
     * Add table row
     */
    addTableRow(data) {
        const colWidth = (this.pageWidth - 2 * this.margin) / data.length;
        let startX = this.margin;

        // Alternating row colors
        const rowIndex = Math.floor((this.currentY - this.margin) / 6) % 2;
        if (rowIndex === 0) {
            this.doc.setFillColor(248, 249, 250);
            this.doc.rect(this.margin, this.currentY - 1, this.pageWidth - 2 * this.margin, 6, 'F');
        }

        this.doc.setFontSize(9);
        this.doc.setFont('helvetica', 'normal');

        data.forEach(item => {
            this.doc.text(String(item), startX + 2, this.currentY + 3);
            startX += colWidth;
        });

        this.currentY += 6;
        this.checkPageBreak();
    }

    /**
     * Draw progress bar
     */
    drawProgressBar(current, target, width = 120) {
        const progress = Math.min((current / target) * 100, 100);
        const barHeight = 6;
        const barX = this.margin;

        // Background
        this.doc.setFillColor(240, 240, 240);
        this.doc.rect(barX, this.currentY, width, barHeight, 'F');

        // Progress fill
        const fillWidth = (progress / 100) * width;
        this.doc.setFillColor(
            progress >= 100 ? 16 : progress >= 75 ? 245 : progress >= 50 ? 251 : 239,
            progress >= 100 ? 185 : progress >= 75 ? 158 : progress >= 50 ? 191 : 68,
            progress >= 100 ? 129 : progress >= 75 ? 11 : progress >= 50 ? 142 : 68
        );
        this.doc.rect(barX, this.currentY, fillWidth, barHeight, 'F');

        // Progress text
        this.doc.setFontSize(8);
        this.doc.setTextColor(100, 100, 100);
        this.doc.text(`${progress.toFixed(1)}%`, barX + width + 5, this.currentY + 4);
        this.doc.setTextColor(0, 0, 0);

        this.currentY += barHeight + 5;
    }

    /**
     * Check if page break is needed
     */
    checkPageBreak(requiredSpace = 20) {
        if (this.currentY + requiredSpace > this.pageHeight - 30) {
            this.doc.addPage();
            this.currentY = this.margin;
        }
    }

    // Data retrieval methods for reports
    async getWeeklyReportData() {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        // Use your Storage system's actual methods
        const transactions = await Storage.getTransactions({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });
        const goals = await Storage.getGoals();

        return {
            dateRange: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
            summary: this.calculateSummary(transactions),
            transactions: this.processTransactions(transactions),
            goals: { list: goals },
            categories: this.calculateCategorySummary(transactions),
            insights: this.generateInsights(transactions, goals, 'weekly')
        };
    }

    async getMonthlyReportData() {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(1); // First day of current month

        // Use your Storage system's actual methods
        const transactions = await Storage.getTransactions({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
        });
        const goals = await Storage.getGoals();

        return {
            dateRange: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
            summary: this.calculateSummary(transactions),
            transactions: this.processTransactions(transactions),
            goals: { list: goals },
            categories: this.calculateCategorySummary(transactions),
            trends: this.calculateTrends(transactions),
            budget: this.calculateBudgetAnalysis(transactions),
            insights: this.generateInsights(transactions, goals, 'monthly')
        };
    }

    async getGoalsReportData() {
        const goals = await Storage.getGoals();

        return {
            overview: this.calculateGoalsOverview(goals),
            goals: goals,
            insights: this.generateGoalsInsights(goals),
            actionPlan: this.generateActionPlan(goals)
        };
    }

    // Helper methods for calculations
    calculateSummary(transactions) {
        const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const expenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
        const savings = income - expenses;

        return {
            totalBalance: income - expenses, // This could be improved to get actual balance
            income: income,
            expenses: expenses,
            savings: savings
        };
    }

    processTransactions(transactions) {
        const sorted = transactions.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));

        return {
            list: sorted,
            count: transactions.length,
            average: transactions.length ? transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length : 0,
            largest: sorted.length ? Math.abs(sorted[0].amount) : 0
        };
    }

    calculateCategorySummary(transactions) {
        const categories = {};

        transactions.filter(t => t.amount < 0).forEach(transaction => {
            const category = transaction.category || 'Other';
            categories[category] = (categories[category] || 0) + Math.abs(transaction.amount);
        });

        return Object.entries(categories)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount);
    }

    calculateGoalsOverview(goals) {
        const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
        const totalCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0);
        const avgProgress = goals.length ? (totalCurrent / totalTarget) * 100 : 0;

        return {
            totalTarget,
            totalCurrent,
            avgProgress
        };
    }

    generateInsights(transactions, goals, period) {
        const insights = [];
        const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const expenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
        const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

        // Savings rate analysis
        if (savingsRate >= 20) {
            insights.push({
                type: 'positive',
                title: 'Excellent Savings Rate',
                message: `You're saving ${savingsRate.toFixed(1)}% of your income, which exceeds the recommended 20%. Keep up the great work!`
            });
        } else if (savingsRate >= 10) {
            insights.push({
                type: 'warning',
                title: 'Moderate Savings Rate',
                message: `You're saving ${savingsRate.toFixed(1)}% of your income. Consider increasing to 20% for better financial health.`
            });
        } else if (savingsRate < 0) {
            insights.push({
                type: 'negative',
                title: 'Spending Exceeds Income',
                message: `Your expenses exceed your income by ${this.formatCurrency(Math.abs(income - expenses))}. Review and reduce unnecessary spending.`
            });
        }

        // Category analysis
        const categories = this.calculateCategorySummary(transactions);
        if (categories.length > 0) {
            const topCategory = categories[0];
            const percentage = (topCategory.amount / expenses) * 100;

            if (percentage > 40) {
                insights.push({
                    type: 'warning',
                    title: 'High Category Concentration',
                    message: `${this.getCategoryName(topCategory.category)} represents ${percentage.toFixed(1)}% of your expenses. Consider diversifying or reducing this category.`
                });
            }
        }

        // Goals analysis
        const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount);
        if (activeGoals.length > 0) {
            const avgGoalProgress = activeGoals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount), 0) / activeGoals.length * 100;

            if (avgGoalProgress >= 75) {
                insights.push({
                    type: 'positive',
                    title: 'Goals On Track',
                    message: `Your average goal completion is ${avgGoalProgress.toFixed(1)}%. You're doing great!`
                });
            }
        }

        return insights;
    }

    generateGoalsInsights(goals) {
        const insights = [];

        if (goals.length === 0) {
            return ['Consider setting some financial goals to improve your money management.'];
        }

        const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount);
        const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount);
        const overdueGoals = activeGoals.filter(g => new Date(g.deadline) < new Date());

        if (completedGoals.length > 0) {
            insights.push(`You've completed ${completedGoals.length} goal(s). Congratulations!`);
        }

        if (overdueGoals.length > 0) {
            insights.push(`${overdueGoals.length} goal(s) are overdue. Consider revising deadlines or increasing contributions.`);
        }

        if (activeGoals.length > 0) {
            const avgProgress = activeGoals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount), 0) / activeGoals.length * 100;
            insights.push(`Average progress on active goals: ${avgProgress.toFixed(1)}%`);
        }

        return insights;
    }

    generateActionPlan(goals) {
        const actionPlan = [];
        const today = new Date();

        goals.forEach(goal => {
            if (goal.currentAmount >= goal.targetAmount) return; // Skip completed goals

            const daysLeft = Math.max(0, Math.ceil((new Date(goal.deadline) - today) / (1000 * 60 * 60 * 24)));
            const remaining = goal.targetAmount - goal.currentAmount;

            if (daysLeft === 0) {
                actionPlan.push({
                    goal: goal.name,
                    action: `Goal is overdue by ${this.formatCurrency(remaining)}. Consider extending the deadline or adjusting the target amount.`
                });
            } else if (daysLeft < 30) {
                const dailyNeeded = remaining / daysLeft;
                actionPlan.push({
                    goal: goal.name,
                    action: `Save ${this.formatCurrency(dailyNeeded)} daily for the next ${daysLeft} days to reach your goal.`
                });
            } else {
                const monthlyNeeded = remaining / Math.ceil(daysLeft / 30);
                actionPlan.push({
                    goal: goal.name,
                    action: `Save ${this.formatCurrency(monthlyNeeded)} monthly to comfortably reach your goal by the deadline.`
                });
            }
        });

        return actionPlan;
    }

    // Utility methods
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0);
    }

    getCategoryName(category) {
        const categoryNames = {
            'food': 'Food & Dining',
            'transport': 'Transportation',
            'entertainment': 'Entertainment',
            'shopping': 'Shopping',
            'bills': 'Bills & Utilities',
            'healthcare': 'Healthcare',
            'education': 'Education',
            'travel': 'Travel',
            'other': 'Other',
            'salary': 'Salary',
            'freelance': 'Freelance',
            'investment': 'Investments',
            'gift': 'Gifts'
        };
        return categoryNames[category] || category;
    }

    getGoalTypeName(type) {
        const typeNames = {
            'saving': 'Savings Goal',
            'purchase': 'Purchase Goal',
            'debt': 'Debt Payoff',
            'emergency': 'Emergency Fund'
        };
        return typeNames[type] || 'Financial Goal';
    }

    calculateDaysLeft(deadline) {
        const today = new Date();
        const targetDate = new Date(deadline);
        const diffTime = targetDate - today;
        return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
    }

    generateSummaryText(summary) {
        const savingsRate = summary.income > 0 ? ((summary.savings / summary.income) * 100).toFixed(1) : 0;

        let text = `During this period, you earned ${this.formatCurrency(summary.income)} and spent ${this.formatCurrency(summary.expenses)}, `;

        if (summary.savings >= 0) {
            text += `resulting in net savings of ${this.formatCurrency(summary.savings)} (${savingsRate}% savings rate). `;
        } else {
            text += `resulting in a deficit of ${this.formatCurrency(Math.abs(summary.savings))}. `;
        }

        text += `Your current total balance is ${this.formatCurrency(summary.totalBalance)}.`;

        return text;
    }

    groupTransactionsByCategory(transactions) {
        const groups = {};

        transactions.forEach(transaction => {
            const category = transaction.category || 'other';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(transaction);
        });

        return groups;
    }

    analyzeCategorySpending(categories) {
        if (!categories.length) return { insights: [] };

        const total = categories.reduce((sum, cat) => sum + cat.amount, 0);
        const topCategory = categories[0];
        const insights = [];

        if (topCategory && (topCategory.amount / total) > 0.4) {
            insights.push(`${this.getCategoryName(topCategory.category)} dominates your spending at ${((topCategory.amount / total) * 100).toFixed(1)}% of total expenses.`);
        }

        if (categories.length > 5) {
            insights.push('Your spending is well-diversified across multiple categories.');
        }

        return {
            topCategory: topCategory ? {
                name: this.getCategoryName(topCategory.category),
                amount: topCategory.amount
            } : null,
            insights
        };
    }

    calculateTrends(transactions) {
        // Simple trend calculation - you could implement more sophisticated analysis
        const now = new Date();
        const thisMonth = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
        });

        const lastMonth = transactions.filter(t => {
            const tDate = new Date(t.date);
            const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
            return tDate.getMonth() === lastMonthDate.getMonth() && tDate.getFullYear() === lastMonthDate.getFullYear();
        });

        return [
            { period: 'This Month', transactions: thisMonth },
            { period: 'Last Month', transactions: lastMonth }
        ];
    }

    analyzeTrends(trends) {
        const analysis = [];

        if (trends.length >= 2) {
            const current = trends[0].transactions;
            const previous = trends[1].transactions;

            const currentIncome = current.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
            const previousIncome = previous.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);

            const currentExpenses = Math.abs(current.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
            const previousExpenses = Math.abs(previous.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));

            const incomeChange = previousIncome > 0 ? ((currentIncome - previousIncome) / previousIncome) * 100 : 0;
            const expenseChange = previousExpenses > 0 ? ((currentExpenses - previousExpenses) / previousExpenses) * 100 : 0;

            if (Math.abs(incomeChange) > 5) {
                analysis.push({
                    type: incomeChange > 0 ? 'positive' : 'negative',
                    message: `Income ${incomeChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(incomeChange).toFixed(1)}% from last month`
                });
            }

            if (Math.abs(expenseChange) > 5) {
                analysis.push({
                    type: expenseChange < 0 ? 'positive' : 'negative',
                    message: `Expenses ${expenseChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(expenseChange).toFixed(1)}% from last month`
                });
            }
        }

        return analysis;
    }

    calculateBudgetAnalysis(transactions) {
        // This is a simplified analysis - you could implement more sophisticated categorization
        const income = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));

        // Simple approximation
        const needs = totalExpenses * 0.6; // Approximate needs as 60% of expenses
        const wants = totalExpenses * 0.4;  // Approximate wants as 40% of expenses
        const savings = income - totalExpenses;

        return { needs, wants, savings };
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        this.doc = null;
        this.currentY = 20;
        this.isInitialized = false;
        console.log('PDF Generator cleaned up');
    }
}

// Create global PDFGenerator instance
window.PDFGenerator = new PDFGenerator();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PDFGenerator;
}

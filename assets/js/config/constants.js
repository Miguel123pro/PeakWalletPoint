/**
 * FinancePro - Application Constants and Configuration
 * 
 * @version 2.0.0
 */

// Application Configuration
const CONFIG = {
    APP_NAME: 'FinancePro',
    VERSION: '2.0.0',
    API_VERSION: 'v1',
    STORAGE_PREFIX: 'financepro_',

    // Chart Configuration
    CHART_COLORS: [
        '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
        '#f59e0b', '#ef4444', '#ec4899', '#84cc16',
        '#f97316', '#6b7280', '#14b8a6', '#8b5cf6'
    ],

    // Currency Settings
    CURRENCY: {
        SYMBOL: '$',
        CODE: 'USD',
        DECIMALS: 2,
        LOCALE: 'en-US'
    },

    // Date Settings
    DATE_FORMAT: 'YYYY-MM-DD',
    DISPLAY_DATE_FORMAT: 'MMM DD, YYYY',

    // Pagination
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,

    // Validation
    MAX_AMOUNT: 1000000,
    MIN_AMOUNT: 0.01,
    MAX_DESCRIPTION_LENGTH: 255,

    // UI Settings
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 300,
    NOTIFICATION_DURATION: 5000,

    // Chart Settings
    CHART_HEIGHT: 300,
    CHART_ANIMATION_DURATION: 750,

    // Auto-save Settings
    AUTO_SAVE_INTERVAL: 30000, // 30 seconds

    // Export Settings
    EXPORT_FILENAME_PREFIX: 'financepro-export',

    // Backup Settings
    MAX_BACKUP_COUNT: 10,
    BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
};

// Transaction Categories
const EXPENSE_CATEGORIES = [
    { id: 'food', name: 'Food & Dining', color: '#ef4444', icon: 'utensils' },
    { id: 'transport', name: 'Transportation', color: '#3b82f6', icon: 'car' },
    { id: 'shopping', name: 'Shopping', color: '#ec4899', icon: 'shopping-bag' },
    { id: 'bills', name: 'Bills & Utilities', color: '#f59e0b', icon: 'receipt' },
    { id: 'entertainment', name: 'Entertainment', color: '#8b5cf6', icon: 'film' },
    { id: 'health', name: 'Health & Fitness', color: '#10b981', icon: 'heart' },
    { id: 'education', name: 'Education', color: '#06b6d4', icon: 'book' },
    { id: 'travel', name: 'Travel', color: '#84cc16', icon: 'plane' },
    { id: 'insurance', name: 'Insurance', color: '#6b7280', icon: 'shield' },
    { id: 'gifts', name: 'Gifts & Donations', color: '#f97316', icon: 'gift' },
    { id: 'personal', name: 'Personal Care', color: '#14b8a6', icon: 'user' },
    { id: 'home', name: 'Home & Garden', color: '#a855f7', icon: 'home' },
    { id: 'other', name: 'Other Expenses', color: '#64748b', icon: 'more-horizontal' }
];

const INCOME_CATEGORIES = [
    { id: 'salary', name: 'Salary', color: '#10b981', icon: 'briefcase' },
    { id: 'freelance', name: 'Freelance', color: '#3b82f6', icon: 'laptop' },
    { id: 'business', name: 'Business', color: '#8b5cf6', icon: 'trending-up' },
    { id: 'investment', name: 'Investment', color: '#06b6d4', icon: 'bar-chart' },
    { id: 'rental', name: 'Rental Income', color: '#f59e0b', icon: 'key' },
    { id: 'bonus', name: 'Bonus', color: '#ec4899', icon: 'award' },
    { id: 'gift', name: 'Gift Money', color: '#f97316', icon: 'gift' },
    { id: 'refund', name: 'Refunds', color: '#84cc16', icon: 'rotate-ccw' },
    { id: 'other', name: 'Other Income', color: '#64748b', icon: 'plus-circle' }
];

// All Categories Combined
const CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

// Goal Types
const GOAL_TYPES = [
    { id: 'savings', name: 'Savings Goal', color: '#10b981', icon: 'piggy-bank' },
    { id: 'debt', name: 'Debt Payoff', color: '#ef4444', icon: 'credit-card' },
    { id: 'purchase', name: 'Purchase Goal', color: '#3b82f6', icon: 'shopping-cart' },
    { id: 'emergency', name: 'Emergency Fund', color: '#f59e0b', icon: 'shield' },
    { id: 'vacation', name: 'Vacation Fund', color: '#ec4899', icon: 'plane' },
    { id: 'retirement', name: 'Retirement', color: '#8b5cf6', icon: 'clock' },
    { id: 'education', name: 'Education Fund', color: '#06b6d4', icon: 'graduation-cap' },
    { id: 'investment', name: 'Investment Goal', color: '#84cc16', icon: 'trending-up' },
    { id: 'home', name: 'Home Purchase', color: '#f97316', icon: 'home' },
    { id: 'other', name: 'Other Goal', color: '#64748b', icon: 'target' }
];

// Routine Frequencies
const ROUTINE_FREQUENCIES = [
    { id: 'daily', name: 'Daily', multiplier: 365, icon: 'calendar' },
    { id: 'weekly', name: 'Weekly', multiplier: 52, icon: 'calendar' },
    { id: 'biweekly', name: 'Bi-weekly', multiplier: 26, icon: 'calendar' },
    { id: 'monthly', name: 'Monthly', multiplier: 12, icon: 'calendar' },
    { id: 'quarterly', name: 'Quarterly', multiplier: 4, icon: 'calendar' },
    { id: 'yearly', name: 'Yearly', multiplier: 1, icon: 'calendar' }
];

// Transaction Types
const TRANSACTION_TYPES = [
    { id: 'income', name: 'Income', color: '#10b981', icon: 'trending-up' },
    { id: 'expense', name: 'Expense', color: '#ef4444', icon: 'trending-down' },
    { id: 'transfer', name: 'Transfer', color: '#3b82f6', icon: 'arrow-right-left' }
];

// Account Types
const ACCOUNT_TYPES = [
    { id: 'checking', name: 'Checking Account', color: '#3b82f6', icon: 'credit-card' },
    { id: 'savings', name: 'Savings Account', color: '#10b981', icon: 'piggy-bank' },
    { id: 'credit', name: 'Credit Card', color: '#ef4444', icon: 'credit-card' },
    { id: 'investment', name: 'Investment Account', color: '#8b5cf6', icon: 'trending-up' },
    { id: 'cash', name: 'Cash', color: '#f59e0b', icon: 'dollar-sign' },
    { id: 'loan', name: 'Loan Account', color: '#f97316', icon: 'minus-circle' },
    { id: 'other', name: 'Other Account', color: '#64748b', icon: 'more-horizontal' }
];

// Budget Categories
const BUDGET_CATEGORIES = [
    { id: 'needs', name: 'Needs (50%)', percentage: 50, color: '#ef4444' },
    { id: 'wants', name: 'Wants (30%)', percentage: 30, color: '#f59e0b' },
    { id: 'savings', name: 'Savings (20%)', percentage: 20, color: '#10b981' }
];

// Time Periods for Reports
const TIME_PERIODS = [
    { id: 'week', name: 'This Week', days: 7 },
    { id: 'month', name: 'This Month', days: 30 },
    { id: 'quarter', name: 'This Quarter', days: 90 },
    { id: 'year', name: 'This Year', days: 365 },
    { id: 'custom', name: 'Custom Range', days: null }
];

// Chart Types
const CHART_TYPES = [
    { id: 'line', name: 'Line Chart', icon: 'trending-up' },
    { id: 'bar', name: 'Bar Chart', icon: 'bar-chart' },
    { id: 'pie', name: 'Pie Chart', icon: 'pie-chart' },
    { id: 'doughnut', name: 'Doughnut Chart', icon: 'circle' },
    { id: 'area', name: 'Area Chart', icon: 'area-chart' }
];

// Default Chart Options
const DEFAULT_CHART_OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
        duration: CONFIG.CHART_ANIMATION_DURATION
    },
    plugins: {
        legend: {
            display: true,
            position: 'bottom',
            labels: {
                usePointStyle: true,
                padding: 20,
                color: '#e2e8f0',
                font: {
                    family: 'Inter',
                    size: 12,
                    weight: '500'
                }
            }
        },
        tooltip: {
            backgroundColor: '#1e1e2e',
            titleColor: '#e2e8f0',
            bodyColor: '#94a3b8',
            borderColor: '#334155',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            titleFont: {
                family: 'Inter',
                size: 13,
                weight: '600'
            },
            bodyFont: {
                family: 'Inter',
                size: 12,
                weight: '500'
            }
        }
    },
    scales: {
        x: {
            grid: {
                color: '#334155',
                borderColor: '#475569'
            },
            ticks: {
                color: '#94a3b8',
                font: {
                    family: 'Inter',
                    size: 11,
                    weight: '500'
                }
            }
        },
        y: {
            grid: {
                color: '#334155',
                borderColor: '#475569'
            },
            ticks: {
                color: '#94a3b8',
                font: {
                    family: 'Inter',
                    size: 11,
                    weight: '500'
                },
                callback: function (value) {
                    return CONFIG.CURRENCY.SYMBOL + value.toFixed(CONFIG.CURRENCY.DECIMALS);
                }
            }
        }
    }
};

// Notification Types
const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'danger',
    WARNING: 'warning',
    INFO: 'info'
};

// Local Storage Keys
const STORAGE_KEYS = {
    TRANSACTIONS: CONFIG.STORAGE_PREFIX + 'transactions',
    GOALS: CONFIG.STORAGE_PREFIX + 'goals',
    ROUTINES: CONFIG.STORAGE_PREFIX + 'routines',
    ACCOUNTS: CONFIG.STORAGE_PREFIX + 'accounts',
    BUDGETS: CONFIG.STORAGE_PREFIX + 'budgets',
    SETTINGS: CONFIG.STORAGE_PREFIX + 'settings',
    THEME: CONFIG.STORAGE_PREFIX + 'theme',
    STATE: CONFIG.STORAGE_PREFIX + 'state',
    VERSION: CONFIG.STORAGE_PREFIX + 'version',
    BACKUPS: CONFIG.STORAGE_PREFIX + 'backups'
};

// Default Settings
const DEFAULT_SETTINGS = {
    currency: CONFIG.CURRENCY,
    dateFormat: CONFIG.DISPLAY_DATE_FORMAT,
    theme: 'dark',
    notifications: true,
    autoSave: true,
    autoBackup: true,
    defaultAccount: null,
    budgetAlerts: true,
    goalReminders: true,
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
};

// Validation Rules
const VALIDATION_RULES = {
    amount: {
        required: true,
        min: CONFIG.MIN_AMOUNT,
        max: CONFIG.MAX_AMOUNT,
        decimal: CONFIG.CURRENCY.DECIMALS
    },
    description: {
        required: true,
        minLength: 1,
        maxLength: CONFIG.MAX_DESCRIPTION_LENGTH
    },
    date: {
        required: true,
        format: CONFIG.DATE_FORMAT
    },
    category: {
        required: true,
        validOptions: CATEGORIES.map(c => c.id)
    },
    goalAmount: {
        required: true,
        min: CONFIG.MIN_AMOUNT,
        max: CONFIG.MAX_AMOUNT * 10 // Goals can be larger
    }
};

// API Endpoints (for future API integration)
const API_ENDPOINTS = {
    BASE_URL: '/api/v1',
    TRANSACTIONS: '/transactions',
    GOALS: '/goals',
    ROUTINES: '/routines',
    ACCOUNTS: '/accounts',
    REPORTS: '/reports',
    EXPORT: '/export',
    IMPORT: '/import'
};

// Feature Flags
const FEATURE_FLAGS = {
    MULTIPLE_ACCOUNTS: false,
    BUDGETS: false,
    INVESTMENTS: false,
    BILL_REMINDERS: false,
    BANK_SYNC: false,
    MOBILE_APP: false,
    ADVANCED_ANALYTICS: true,
    GOAL_TRACKING: true,
    ROUTINE_TRACKING: true,
    PDF_REPORTS: true,
    DATA_EXPORT: true,
    THEMES: true
};

// Error Messages
const ERROR_MESSAGES = {
    REQUIRED_FIELD: 'This field is required',
    INVALID_AMOUNT: 'Please enter a valid amount',
    INVALID_DATE: 'Please enter a valid date',
    INVALID_EMAIL: 'Please enter a valid email address',
    AMOUNT_TOO_LARGE: `Amount cannot exceed ${CONFIG.CURRENCY.SYMBOL}${CONFIG.MAX_AMOUNT.toLocaleString()}`,
    AMOUNT_TOO_SMALL: `Amount must be at least ${CONFIG.CURRENCY.SYMBOL}${CONFIG.MIN_AMOUNT}`,
    DESCRIPTION_TOO_LONG: `Description cannot exceed ${CONFIG.MAX_DESCRIPTION_LENGTH} characters`,
    NETWORK_ERROR: 'Network error. Please check your connection.',
    STORAGE_ERROR: 'Failed to save data. Please try again.',
    INVALID_FILE: 'Invalid file format. Please select a valid file.',
    IMPORT_ERROR: 'Failed to import data. Please check the file format.'
};

// Success Messages
const SUCCESS_MESSAGES = {
    TRANSACTION_ADDED: 'Transaction added successfully',
    TRANSACTION_UPDATED: 'Transaction updated successfully',
    TRANSACTION_DELETED: 'Transaction deleted successfully',
    GOAL_ADDED: 'Goal created successfully',
    GOAL_UPDATED: 'Goal updated successfully',
    GOAL_DELETED: 'Goal deleted successfully',
    GOAL_COMPLETED: 'Congratulations! Goal completed!',
    ROUTINE_ADDED: 'Routine added successfully',
    ROUTINE_UPDATED: 'Routine updated successfully',
    ROUTINE_DELETED: 'Routine deleted successfully',
    DATA_EXPORTED: 'Data exported successfully',
    DATA_IMPORTED: 'Data imported successfully',
    DATA_CLEARED: 'All data cleared successfully',
    SETTINGS_SAVED: 'Settings saved successfully',
    BACKUP_CREATED: 'Backup created successfully',
    BACKUP_RESTORED: 'Backup restored successfully'
};

// Export all constants
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        EXPENSE_CATEGORIES,
        INCOME_CATEGORIES,
        CATEGORIES,
        GOAL_TYPES,
        ROUTINE_FREQUENCIES,
        TRANSACTION_TYPES,
        ACCOUNT_TYPES,
        BUDGET_CATEGORIES,
        TIME_PERIODS,
        CHART_TYPES,
        DEFAULT_CHART_OPTIONS,
        NOTIFICATION_TYPES,
        STORAGE_KEYS,
        DEFAULT_SETTINGS,
        VALIDATION_RULES,
        API_ENDPOINTS,
        FEATURE_FLAGS,
        ERROR_MESSAGES,
        SUCCESS_MESSAGES
    };
}
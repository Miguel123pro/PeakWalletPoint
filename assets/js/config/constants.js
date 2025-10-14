/**
 * FinancePro - Application Constants
 * Global configuration and constant values
 * 
 * @version 2.0.0
 */

// Expense Categories
const EXPENSE_CATEGORIES = [
    { id: 'food', name: 'Food & Dining' },
    { id: 'transport', name: 'Transportation' },
    { id: 'shopping', name: 'Shopping' },
    { id: 'bills', name: 'Bills & Utilities' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'healthcare', name: 'Healthcare' },
    { id: 'education', name: 'Education' },
    { id: 'travel', name: 'Travel' },
    { id: 'personal', name: 'Personal Care' },
    { id: 'gifts', name: 'Gifts & Donations' },
    { id: 'insurance', name: 'Insurance' },
    { id: 'rent', name: 'Rent & Mortgage' },
    { id: 'other', name: 'Other' }
];

// Income Categories
const INCOME_CATEGORIES = [
    { id: 'salary', name: 'Salary' },
    { id: 'freelance', name: 'Freelance' },
    { id: 'business', name: 'Business Income' },
    { id: 'investment', name: 'Investment Returns' },
    { id: 'rental', name: 'Rental Income' },
    { id: 'gift', name: 'Gift/Bonus' },
    { id: 'refund', name: 'Refund' },
    { id: 'other', name: 'Other Income' }
];

// Goal Categories
const GOAL_CATEGORIES = [
    { id: 'savings', name: 'Emergency Fund' },
    { id: 'vacation', name: 'Vacation' },
    { id: 'purchase', name: 'Major Purchase' },
    { id: 'education', name: 'Education' },
    { id: 'retirement', name: 'Retirement' },
    { id: 'investment', name: 'Investment' },
    { id: 'debt', name: 'Debt Payment' },
    { id: 'other', name: 'Other Goal' }
];

// Routine Frequencies
const ROUTINE_FREQUENCIES = [
    { id: 'daily', name: 'Daily' },
    { id: 'weekly', name: 'Weekly' },
    { id: 'biweekly', name: 'Bi-weekly' },
    { id: 'monthly', name: 'Monthly' },
    { id: 'quarterly', name: 'Quarterly' },
    { id: 'yearly', name: 'Yearly' }
];

// Currency Settings
const CURRENCY_SETTINGS = {
    symbol: '€',
    code: 'EUR',
    position: 'after', // 'before' or 'after'
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
};

// Date Format Options
const DATE_FORMATS = [
    { id: 'DD/MM/YYYY', name: 'DD/MM/YYYY' },
    { id: 'MM/DD/YYYY', name: 'MM/DD/YYYY' },
    { id: 'YYYY-MM-DD', name: 'YYYY-MM-DD' }
];

// Chart Colors
const CHART_COLORS = {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#06b6d4',
    income: '#10b981',
    expense: '#ef4444',
    balance: '#6366f1',
    categories: [
        '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
        '#f59e0b', '#ef4444', '#ec4899', '#84cc16',
        '#f97316', '#6b7280', '#14b8a6', '#a855f7'
    ]
};

// Application Settings
const APP_SETTINGS = {
    name: 'FinancePro',
    version: '2.0.0',
    defaultTheme: 'dark',
    autoSaveInterval: 30000, // 30 seconds
    refreshInterval: 300000, // 5 minutes
    maxTransactionsPerPage: 50,
    maxGoalsDisplay: 10,
    maxRoutinesDisplay: 20,
    dateFormat: 'DD/MM/YYYY',
    currency: 'EUR'
};

// Notification Types
const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'danger',
    WARNING: 'warning',
    INFO: 'info'
};

// Notification Duration (milliseconds)
const NOTIFICATION_DURATION = {
    SHORT: 2000,
    MEDIUM: 5000,
    LONG: 8000
};

// Report Types
const REPORT_TYPES = [
    { id: 'monthly', name: 'Monthly Summary' },
    { id: 'yearly', name: 'Yearly Summary' },
    { id: 'category', name: 'Category Analysis' },
    { id: 'trends', name: 'Trend Analysis' },
    { id: 'goals', name: 'Goals Progress' },
    { id: 'custom', name: 'Custom Report' }
];

// Export Formats
const EXPORT_FORMATS = [
    { id: 'json', name: 'JSON', extension: '.json' },
    { id: 'csv', name: 'CSV', extension: '.csv' },
    { id: 'pdf', name: 'PDF', extension: '.pdf' }
];

// Transaction Types
const TRANSACTION_TYPES = {
    INCOME: 'income',
    EXPENSE: 'expense'
};

// Sort Options
const SORT_OPTIONS = [
    { id: 'date-desc', name: 'Date (Newest First)', field: 'date', order: 'desc' },
    { id: 'date-asc', name: 'Date (Oldest First)', field: 'date', order: 'asc' },
    { id: 'amount-desc', name: 'Amount (High to Low)', field: 'amount', order: 'desc' },
    { id: 'amount-asc', name: 'Amount (Low to High)', field: 'amount', order: 'asc' },
    { id: 'category', name: 'Category', field: 'category', order: 'asc' }
];

// Filter Periods
const FILTER_PERIODS = [
    { id: 'today', name: 'Today' },
    { id: 'yesterday', name: 'Yesterday' },
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' },
    { id: 'quarter', name: 'This Quarter' },
    { id: 'year', name: 'This Year' },
    { id: 'last30', name: 'Last 30 Days' },
    { id: 'last90', name: 'Last 90 Days' },
    { id: 'custom', name: 'Custom Range' }
];

// Keyboard Shortcuts
const KEYBOARD_SHORTCUTS = {
    QUICK_ADD: 'Ctrl+N',
    TOGGLE_THEME: 'Ctrl+T',
    DASHBOARD: 'Ctrl+1',
    TRANSACTIONS: 'Ctrl+2',
    GOALS: 'Ctrl+3',
    ROUTINES: 'Ctrl+4',
    REPORTS: 'Ctrl+5',
    SEARCH: 'Ctrl+F',
    EXPORT: 'Ctrl+E',
    HELP: 'Ctrl+H'
};

// Validation Rules
const VALIDATION_RULES = {
    transaction: {
        minAmount: 0.01,
        maxAmount: 1000000,
        maxDescriptionLength: 200,
        maxNotesLength: 500
    },
    goal: {
        minAmount: 1,
        maxAmount: 10000000,
        maxNameLength: 100,
        maxNotesLength: 500
    },
    routine: {
        minAmount: 0.01,
        maxAmount: 100000,
        maxNameLength: 100,
        maxNotesLength: 500
    }
};

// Error Messages
const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
    SAVE_ERROR: 'Failed to save data. Please try again.',
    LOAD_ERROR: 'Failed to load data. Please refresh the page.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    GENERAL_ERROR: 'An unexpected error occurred. Please try again.',
    INSUFFICIENT_FUNDS: 'Insufficient funds for this transaction.',
    INVALID_DATE: 'Please enter a valid date.',
    INVALID_AMOUNT: 'Please enter a valid amount.'
};

// Success Messages
const SUCCESS_MESSAGES = {
    TRANSACTION_ADDED: 'Transaction added successfully',
    TRANSACTION_UPDATED: 'Transaction updated successfully',
    TRANSACTION_DELETED: 'Transaction deleted successfully',
    GOAL_ADDED: 'Goal added successfully',
    GOAL_UPDATED: 'Goal updated successfully',
    GOAL_DELETED: 'Goal deleted successfully',
    ROUTINE_ADDED: 'Routine added successfully',
    ROUTINE_UPDATED: 'Routine updated successfully',
    ROUTINE_DELETED: 'Routine deleted successfully',
    DATA_EXPORTED: 'Data exported successfully',
    DATA_IMPORTED: 'Data imported successfully',
    SETTINGS_SAVED: 'Settings saved successfully'
};

// Make constants available globally
window.EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;
window.INCOME_CATEGORIES = INCOME_CATEGORIES;
window.GOAL_CATEGORIES = GOAL_CATEGORIES;
window.ROUTINE_FREQUENCIES = ROUTINE_FREQUENCIES;
window.CURRENCY_SETTINGS = CURRENCY_SETTINGS;
window.DATE_FORMATS = DATE_FORMATS;
window.CHART_COLORS = CHART_COLORS;
window.APP_SETTINGS = APP_SETTINGS;
window.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
window.NOTIFICATION_DURATION = NOTIFICATION_DURATION;
window.REPORT_TYPES = REPORT_TYPES;
window.EXPORT_FORMATS = EXPORT_FORMATS;
window.TRANSACTION_TYPES = TRANSACTION_TYPES;
window.SORT_OPTIONS = SORT_OPTIONS;
window.FILTER_PERIODS = FILTER_PERIODS;
window.KEYBOARD_SHORTCUTS = KEYBOARD_SHORTCUTS;
window.VALIDATION_RULES = VALIDATION_RULES;
window.ERROR_MESSAGES = ERROR_MESSAGES;
window.SUCCESS_MESSAGES = SUCCESS_MESSAGES;
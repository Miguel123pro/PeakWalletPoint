/**
 * FinancePro - Charts Utility
 * Manages chart creation, updates, and configuration
 * 
 * @version 2.0.0
 */

class Charts {
    constructor() {
        this.charts = {};
        this.defaultOptions = null;
        this.colorPalette = [];
        this.isInitialized = false;
    }

    /**
     * Initialize charts utility
     */
    init() {
        try {
            this.setupDefaultOptions();
            this.setupColorPalette();
            this.registerCustomPlugins();

            this.isInitialized = true;
            console.log('Charts utility initialized');
        } catch (error) {
            console.error('Failed to initialize charts:', error);
            throw error;
        }
    }

    /**
     * Setup default chart options
     */
    setupDefaultOptions() {
        this.defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
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
                            family: 'Inter, sans-serif',
                            size: 12,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: '#1e1e2e',
                    titleColor: '#e2e8f0',
                    bodyColor: '#94a3b8',
                    borderColor: '#334155',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    titleFont: {
                        family: 'Inter, sans-serif',
                        size: 13,
                        weight: '600'
                    },
                    bodyFont: {
                        family: 'Inter, sans-serif',
                        size: 12,
                        weight: '500'
                    },
                    padding: 12,
                    caretPadding: 6
                }
            },
            scales: {
                x: {
                    grid: {
                        color: '#334155',
                        borderColor: '#475569',
                        drawTicks: true,
                        tickLength: 8
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            family: 'Inter, sans-serif',
                            size: 11,
                            weight: '500'
                        },
                        padding: 8
                    },
                    border: {
                        color: '#475569'
                    }
                },
                y: {
                    grid: {
                        color: '#334155',
                        borderColor: '#475569',
                        drawTicks: true,
                        tickLength: 8
                    },
                    ticks: {
                        color: '#94a3b8',
                        font: {
                            family: 'Inter, sans-serif',
                            size: 11,
                            weight: '500'
                        },
                        padding: 8,
                        callback: function (value) {
                            return '$' + value.toFixed(0);
                        }
                    },
                    border: {
                        color: '#475569'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        };
    }

    /**
     * Setup color palette
     */
    setupColorPalette() {
        this.colorPalette = [
            '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
            '#f59e0b', '#ef4444', '#ec4899', '#84cc16',
            '#f97316', '#6b7280', '#14b8a6', '#a855f7',
            '#3b82f6', '#eab308', '#22c55e', '#f43f5e'
        ];
    }

    /**
     * Register custom Chart.js plugins
     */
    registerCustomPlugins() {
        // Custom gradient plugin
        const gradientPlugin = {
            id: 'gradientBackground',
            beforeDatasetsDraw: (chart) => {
                const { ctx, chartArea } = chart;
                if (!chartArea) return;

                chart.data.datasets.forEach((dataset, index) => {
                    if (dataset.gradient && chart.getDatasetMeta(index).visible) {
                        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                        gradient.addColorStop(0, dataset.gradient.start);
                        gradient.addColorStop(1, dataset.gradient.end);
                        dataset.backgroundColor = gradient;
                    }
                });
            }
        };

        // Custom animation plugin
        const animationPlugin = {
            id: 'customAnimation',
            beforeInit: (chart) => {
                chart.options.animation.onProgress = function (animation) {
                    if (animation.currentStep === 0) {
                        chart.canvas.style.opacity = '0';
                    } else {
                        chart.canvas.style.opacity = '1';
                    }
                };
            }
        };

        // Register plugins globally
        if (typeof Chart !== 'undefined') {
            Chart.register(gradientPlugin, animationPlugin);
        }
    }

    /**
     * Create a new chart
     */
    createChart(canvasId, config) {
        try {
            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                throw new Error(`Canvas element with id '${canvasId}' not found`);
            }

            const ctx = canvas.getContext('2d');

            // Merge with default options
            const chartConfig = this.mergeConfigs(config);

            // Create chart
            const chart = new Chart(ctx, chartConfig);

            // Store reference
            this.charts[canvasId] = chart;

            // Add resize observer
            this.addResizeObserver(canvasId);

            return chart;
        } catch (error) {
            console.error(`Failed to create chart '${canvasId}':`, error);
            throw error;
        }
    }

    /**
     * Create doughnut chart
     */
    createDoughnutChart(canvasId, data, options = {}) {
        const config = {
            type: 'doughnut',
            data: {
                labels: data.labels || [],
                datasets: [{
                    data: data.values || [],
                    backgroundColor: data.colors || this.colorPalette,
                    borderWidth: 2,
                    borderColor: '#1e1e2e',
                    hoverBorderWidth: 3,
                    hoverBorderColor: '#ffffff'
                }]
            },
            options: {
                ...this.defaultOptions,
                ...options,
                cutout: options.cutout || '65%',
                plugins: {
                    ...this.defaultOptions.plugins,
                    ...options.plugins,
                    legend: {
                        ...this.defaultOptions.plugins.legend,
                        position: options.legendPosition || 'bottom'
                    },
                    tooltip: {
                        ...this.defaultOptions.plugins.tooltip,
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        };

        return this.createChart(canvasId, config);
    }

    /**
     * Create line chart
     */
    createLineChart(canvasId, data, options = {}) {
        const datasets = data.datasets.map((dataset, index) => ({
            label: dataset.label,
            data: dataset.data,
            borderColor: dataset.color || this.colorPalette[index],
            backgroundColor: dataset.fillColor || this.addAlpha(dataset.color || this.colorPalette[index], 0.1),
            borderWidth: dataset.borderWidth || 3,
            fill: dataset.fill !== undefined ? dataset.fill : true,
            tension: dataset.tension || 0.4,
            pointBackgroundColor: dataset.color || this.colorPalette[index],
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: dataset.pointRadius || 4,
            pointHoverRadius: dataset.pointHoverRadius || 6,
            pointHoverBackgroundColor: dataset.color || this.colorPalette[index],
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 3
        }));

        const config = {
            type: 'line',
            data: {
                labels: data.labels || [],
                datasets: datasets
            },
            options: {
                ...this.defaultOptions,
                ...options,
                plugins: {
                    ...this.defaultOptions.plugins,
                    ...options.plugins
                },
                scales: {
                    ...this.defaultOptions.scales,
                    x: {
                        ...this.defaultOptions.scales.x,
                        grid: {
                            ...this.defaultOptions.scales.x.grid,
                            display: options.showXGrid !== false
                        }
                    },
                    y: {
                        ...this.defaultOptions.scales.y,
                        beginAtZero: options.beginAtZero !== false
                    }
                }
            }
        };

        return this.createChart(canvasId, config);
    }

    /**
     * Create bar chart
     */
    createBarChart(canvasId, data, options = {}) {
        const datasets = data.datasets.map((dataset, index) => ({
            label: dataset.label,
            data: dataset.data,
            backgroundColor: dataset.colors || this.colorPalette.slice(0, dataset.data.length),
            borderColor: dataset.borderColors || this.colorPalette.slice(0, dataset.data.length),
            borderWidth: dataset.borderWidth || 1,
            borderRadius: dataset.borderRadius || 4,
            borderSkipped: false
        }));

        const config = {
            type: 'bar',
            data: {
                labels: data.labels || [],
                datasets: datasets
            },
            options: {
                ...this.defaultOptions,
                ...options,
                plugins: {
                    ...this.defaultOptions.plugins,
                    ...options.plugins
                }
            }
        };

        return this.createChart(canvasId, config);
    }

    /**
     * Create area chart
     */
    createAreaChart(canvasId, data, options = {}) {
        return this.createLineChart(canvasId, {
            ...data,
            datasets: data.datasets.map(dataset => ({
                ...dataset,
                fill: true,
                gradient: dataset.gradient || {
                    start: this.addAlpha(dataset.color, 0.3),
                    end: this.addAlpha(dataset.color, 0.05)
                }
            }))
        }, options);
    }

    /**
     * Update chart data
     */
    updateChart(canvasId, newData, animationDuration = 750) {
        const chart = this.charts[canvasId];
        if (!chart) {
            console.warn(`Chart '${canvasId}' not found`);
            return;
        }

        try {
            // Update labels if provided
            if (newData.labels) {
                chart.data.labels = newData.labels;
            }

            // Update datasets
            if (newData.datasets) {
                newData.datasets.forEach((newDataset, index) => {
                    if (chart.data.datasets[index]) {
                        chart.data.datasets[index].data = newDataset.data;

                        // Update other properties if provided
                        if (newDataset.label) chart.data.datasets[index].label = newDataset.label;
                        if (newDataset.backgroundColor) chart.data.datasets[index].backgroundColor = newDataset.backgroundColor;
                        if (newDataset.borderColor) chart.data.datasets[index].borderColor = newDataset.borderColor;
                    }
                });
            } else if (newData.values) {
                // For simple data updates (like doughnut charts)
                chart.data.datasets[0].data = newData.values;
                if (newData.colors) chart.data.datasets[0].backgroundColor = newData.colors;
            }

            // Set animation duration
            chart.options.animation.duration = animationDuration;

            // Update chart
            chart.update('active');

        } catch (error) {
            console.error(`Failed to update chart '${canvasId}':`, error);
        }
    }

    /**
     * Destroy chart
     */
    destroyChart(canvasId) {
        const chart = this.charts[canvasId];
        if (chart) {
            chart.destroy();
            delete this.charts[canvasId];
        }
    }

    /**
     * Destroy all charts
     */
    destroyAllCharts() {
        Object.keys(this.charts).forEach(canvasId => {
            this.destroyChart(canvasId);
        });
    }

    /**
     * Export chart as image
     */
    exportChart(canvasId, format = 'image/png', quality = 1) {
        const chart = this.charts[canvasId];
        if (!chart) {
            console.warn(`Chart '${canvasId}' not found`);
            return null;
        }

        try {
            return chart.toBase64Image(format, quality);
        } catch (error) {
            console.error(`Failed to export chart '${canvasId}':`, error);
            return null;
        }
    }

    /**
     * Download chart as image
     */
    downloadChart(canvasId, filename, format = 'png') {
        const imageData = this.exportChart(canvasId, `image/${format}`);
        if (!imageData) return;

        const link = document.createElement('a');
        link.download = `${filename}.${format}`;
        link.href = imageData;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Resize chart
     */
    resizeChart(canvasId) {
        const chart = this.charts[canvasId];
        if (chart) {
            chart.resize();
        }
    }

    /**
     * Resize all charts
     */
    resizeAllCharts() {
        Object.values(this.charts).forEach(chart => {
            chart.resize();
        });
    }

    /**
     * Add resize observer to chart
     */
    addResizeObserver(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(() => {
                this.resizeChart(canvasId);
            });

            resizeObserver.observe(canvas.parentElement);
        }
    }

    /**
     * Get chart statistics
     */
    getChartStats(canvasId) {
        const chart = this.charts[canvasId];
        if (!chart) return null;

        const data = chart.data.datasets[0].data;
        const total = data.reduce((sum, value) => sum + value, 0);
        const average = total / data.length;
        const max = Math.max(...data);
        const min = Math.min(...data);

        return {
            total,
            average: average.toFixed(2),
            max,
            min,
            count: data.length
        };
    }

    /**
     * Add animation to chart
     */
    animateChart(canvasId, animationType = 'bounce', duration = 1000) {
        const chart = this.charts[canvasId];
        if (!chart) return;

        const animations = {
            bounce: 'easeOutBounce',
            elastic: 'easeOutElastic',
            smooth: 'easeInOutQuart',
            quick: 'easeOutQuad'
        };

        chart.options.animation = {
            duration: duration,
            easing: animations[animationType] || animations.smooth
        };

        chart.update('active');
    }

    /**
     * Toggle chart legend
     */
    toggleLegend(canvasId) {
        const chart = this.charts[canvasId];
        if (!chart) return;

        chart.options.plugins.legend.display = !chart.options.plugins.legend.display;
        chart.update();
    }

    /**
     * Update chart colors
     */
    updateChartColors(canvasId, colors) {
        const chart = this.charts[canvasId];
        if (!chart) return;

        chart.data.datasets.forEach((dataset, datasetIndex) => {
            if (colors[datasetIndex]) {
                if (Array.isArray(dataset.backgroundColor)) {
                    dataset.backgroundColor = colors[datasetIndex];
                } else {
                    dataset.backgroundColor = colors[datasetIndex][0] || colors[datasetIndex];
                    dataset.borderColor = colors[datasetIndex][0] || colors[datasetIndex];
                }
            }
        });

        chart.update();
    }

    /**
     * Merge configuration objects
     */
    mergeConfigs(config) {
        return {
            ...config,
            options: {
                ...this.defaultOptions,
                ...config.options,
                plugins: {
                    ...this.defaultOptions.plugins,
                    ...config.options?.plugins
                },
                scales: config.options?.scales ? {
                    ...this.defaultOptions.scales,
                    ...config.options.scales
                } : this.defaultOptions.scales
            }
        };
    }

    /**
     * Add alpha to color
     */
    addAlpha(color, alpha) {
        if (!color) return color;

        // Convert hex to rgba
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        // If already rgba, replace alpha
        if (color.includes('rgba')) {
            return color.replace(/[\d\.]+\)$/g, `${alpha})`);
        }

        // If rgb, convert to rgba
        if (color.includes('rgb')) {
            return color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
        }

        return color;
    }

    /**
     * Generate color palette
     */
    generateColorPalette(count, baseColor = '#6366f1') {
        const colors = [];
        const hsl = this.hexToHsl(baseColor);

        for (let i = 0; i < count; i++) {
            const hue = (hsl.h + (360 / count) * i) % 360;
            colors.push(this.hslToHex(hue, hsl.s, hsl.l));
        }

        return colors;
    }

    /**
     * Convert hex to HSL
     */
    hexToHsl(hex) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return { h: h * 360, s: s * 100, l: l * 100 };
    }

    /**
     * Convert HSL to hex
     */
    hslToHex(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;

        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        const toHex = (c) => {
            const hex = Math.round(c * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    /**
     * Get chart instance
     */
    getChart(canvasId) {
        return this.charts[canvasId] || null;
    }

    /**
     * Get all charts
     */
    getAllCharts() {
        return { ...this.charts };
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        this.destroyAllCharts();
        this.charts = {};
        this.isInitialized = false;
        console.log('Charts utility cleaned up');
    }
}

// Create global Charts instance
window.Charts = new Charts();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Charts;
}
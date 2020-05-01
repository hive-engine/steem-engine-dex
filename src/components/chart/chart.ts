import { customElement, bindable, TaskQueue, autoinject, DOM } from 'aurelia-framework';

import Chart from 'chart.js';
import './../../../custom_scripts/chartjs-chart-financial/scale.financialLinear.js';
import './../../../custom_scripts/chartjs-chart-financial/controller.candlestick.js';
import { faWallet } from '@fortawesome/pro-duotone-svg-icons'
import 'hammerjs'
import 'chartjs-plugin-zoom'

const DefaultChartOptions = {
    options: {
        animation: {},
        legend: {
            display: false
        },
        steppedLine: true,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true//,
                    //max: 100000
                }
            }]
        },
        plugins: {
            zoom: {
                // Container for pan options
                pan: {
                    // Boolean to enable panning
                    enabled: true,

                    // Panning directions. Remove the appropriate direction to disable 
                    // Eg. 'y' would only allow panning in the y direction
                    mode: 'xy'
                },

                // Container for zoom options
                zoom: {
                    // Boolean to enable zooming
                    enabled: true,

                    // Zooming directions. Remove the appropriate direction to disable 
                    // Eg. 'y' would only allow zooming in the y direction
                    mode: 'xy',
                }
            }
        }
    }    
};

@autoinject()
@customElement('chart')
export class ChartComponent {
    private chartRef: HTMLCanvasElement;
    private chartRefCandle: HTMLCanvasElement;
    private chart;
    private chartCandle;
    private created = false;  
    private iteration = 1;  

    @bindable loading = true;
    @bindable type = 'candlestick';
    @bindable options: any = {};
    @bindable data: any = {};
    @bindable iconWallet = faWallet;

    constructor(private element: Element, private taskQueue: TaskQueue) {

    }

    attached() {
        this.taskQueue.queueMicroTask(() => {
            this.createChart('line');
            this.createChart('candlestick');

            this.created = true;
        });
    }

    dataChanged() {
        this.iteration += 1;
        this.loading = (this.iteration === 2);
    }

    detached() {
        this.chart.destroy();
        this.created = false;
    }

    getOptionsOfChartType(chartType) {
        const options = { ...this.options, ...DefaultChartOptions };

        options.type = chartType;

        if (chartType == 'line') {
            options.data = this.data;
        } else {            
            options.data = {
                datasets: [{
                    label: 'SE Dex',
                    data: this.data.ohlcData
                }]
            };            
        }

        options.options.animation.onComplete = () => {
            const event = DOM.createCustomEvent('complete', {
                bubbles: true
            });

            this.element.dispatchEvent(event);
        };

        return options;
    }

    createChart(chartType) {
        const options = this.getOptionsOfChartType(chartType);
        if (chartType == 'line') {
            this.chart = new Chart(this.chartRef, options);
            this.refreshChart(this.chart);
        }
        else {            
            this.chartCandle = new Chart(this.chartRefCandle, options);            
            this.refreshChart(this.chartCandle);
        }
    }

    refreshChart(chart) {
        chart.update();
        chart.resize();
    }

    setChartType(type) {
        this.type = type;
    }

    propertyChanged() {
        if (this.created) {
            this.refreshChart(this.chart);
            this.refreshChart(this.chartCandle);
        }
    }
}

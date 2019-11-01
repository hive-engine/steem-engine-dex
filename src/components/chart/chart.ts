import { customElement, bindable, TaskQueue, autoinject, DOM } from 'aurelia-framework';

import Chart from 'chart.js';
import './../../../custom_scripts/chartjs-chart-financial/scale.financialLinear.js';
import './../../../custom_scripts/chartjs-chart-financial/controller.candlestick.js';

const DefaultChartOptions = {
    options: {
        animation: {},
        legend: {
            display: false
        },
        steppedLine: true
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
        var options = { ...options, ...DefaultChartOptions };

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
        var options = this.getOptionsOfChartType(chartType);
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

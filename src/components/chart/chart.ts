import { customElement, bindable, TaskQueue, autoinject, DOM } from 'aurelia-framework';

import Chart from 'chart.js';
import './../../../custom_scripts/chartjs-chart-financial/scale.financialLinear.js';
import './../../../custom_scripts/chartjs-chart-financial/controller.candlestick.js';

import { DateTime } from 'luxon';

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
    private initialDateStr = '01 Apr 2017 00:00 Z';
    private barCount = 60;

    @bindable type = 'line';
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
                    //data: this.data.ohlcData
                    data: this.getRandomData(this.initialDateStr, this.barCount)
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
            //this.refreshChart();
        }
    }

    getRandomInt = function (max) {
        return Math.floor(Math.random() * Math.floor(max));
    };

    randomNumber(min, max) {
        return Math.random() * (max - min) + min;
    }

    randomBar(date, lastClose) {
        var open = this.randomNumber(lastClose * 0.95, lastClose * 1.05).toFixed(2);
        var close = this.randomNumber(open * 0.95, open * 1.05).toFixed(2);
        var high = this.randomNumber(Math.max(open, close), Math.max(open, close) * 1.1).toFixed(2);
        var low = this.randomNumber(Math.min(open, close) * 0.9, Math.min(open, close)).toFixed(2);
        return {
            t: date.valueOf(),
            o: open,
            h: high,
            l: low,
            c: close
        };

    }

    getRandomData(dateStr, count) {
        var date = DateTime.fromRFC2822(dateStr);
        var data = [this.randomBar(date, 30)];
        while (data.length < count) {
            date = date.plus({ days: 1 });
            if (date.weekday <= 5) {
                data.push(this.randomBar(date, data[data.length - 1].c));
            }
        }
        return data;
    }
}

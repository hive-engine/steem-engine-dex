import { customElement, bindable, TaskQueue, autoinject, DOM } from 'aurelia-framework';

import Chart from 'chart.js';

const DefaultChartOptions = {
    legend: {
        display: false
    },
    options: {
        animation: {},
        steppedLine: true
    }
};

@autoinject()
@customElement('chart')
export class ChartComponent {
    private chartRef: HTMLCanvasElement;
    private chart;
    private created = false;

    @bindable type = 'line';
    @bindable options: any = {};
    @bindable data: any = {};

    constructor(private element: Element, private taskQueue: TaskQueue) {

    }

    attached() {
        this.taskQueue.queueMicroTask(() => {
            this.options = { ...this.options, ...DefaultChartOptions };

            this.options.type = this.type;
            this.options.data = this.data;
            this.options.options.animation.onComplete = () => {
                const event = DOM.createCustomEvent('complete', {
                    bubbles: true
                });

                this.element.dispatchEvent(event);
            };

            this.createChart();

            this.created = true;
        });
    }

    detached() {
        this.chart.destroy();
        this.created = false;
    }

    createChart() {
        this.chart = new Chart(this.chartRef, this.options);

        this.refreshChart();
    }

    refreshChart() {
        this.chart.update();
        this.chart.resize();
    }

    propertyChanged() {
        if (this.created) {
            this.refreshChart();
        }
    }
}

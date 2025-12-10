import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { SharedService } from '../../../services/admin/statistics.service';
import { OrdersInMonth } from '../../../dto/Statistics/orders-in-month.dto';
import { OrdersByStatus } from '../../../dto/Statistics/orders-by-status.dto';
import { OrdersByShippingMethod } from '../../../dto/Statistics/orders-by-shipping-method.dto';
import { OrdersByDay } from '../../../dto/Statistics/orders-by-day.dto';
import { OrdersByCategory } from '../../../dto/Statistics/orders-by-category.dto';
import { OrdersByBrand } from '../../../dto/Statistics/orders-by-brand.dto';

Chart.register(...registerables);

@Component({
  selector: 'app-mychart',
  standalone: true,
  imports: [],
  templateUrl: './mychart.component.html',
  styleUrls: ['./mychart.component.scss'],
})
export class MychartComponent implements OnInit {
  chartdata: OrdersInMonth[] = [];
  labeldata: string[] = [];
  realdata: number[] = [];

  o_status: OrdersByStatus[] = [];
  label_status: string[] = [];
  value_status: number[] = [];

  o_shipping: OrdersByShippingMethod[] = [];
  label_shipping: string[] = [];
  value_shipping: number[] = [];

  o_payment: OrdersByShippingMethod[] = [];
  label_payment: string[] = [];
  value_payment: number[] = [];

  o_obd: OrdersByDay[] = [];
  label_obd: string[] = [];
  value_obd: number[] = [];

  o_category: OrdersByCategory[] = [];
  label_category: string[] = [];
  value_category: number[] = [];

  o_brand: OrdersByBrand[] = [];
  label_brand: string[] = [];
  value_brand: number[] = [];

  private colorPalette = [
    '#b5d1ae',
    '#80ae9a',
    '#568b87',
    '#326b77',
    '#1b485e',
    '#122740',
    '#c6e2b9',
    '#94bba5',
    '#3f7c84',
    '#25556a',
    '#0d1a2d',
  ];

  private colorPaletteCircle = [
    '#fdbf52',
    '#f68b3d',
    '#e4604b',
    '#c9516d',
    '#8b1b59',
    '#703d76',
    '#055d8b',
  ];

  constructor(private service: SharedService) {}

  ngOnInit(): void {
    this.loadordersinmonth();
    this.loadordersbystatus();
    this.loadordersbyshippingmethod();
    this.loadordersbypaymentmethod();
    this.loadordersbyday();
    this.loadordersbycategory();
    this.loadordersbybrand();
  }

  loadordersinmonth() {
    this.service.loadordersinmonth().subscribe(
      (data) => {
        this.chartdata = data;
        if (this.chartdata.length) {
          this.labeldata = [];
          this.realdata = [];
          this.chartdata.forEach((o) => {
            // Include year and month in labels
            const monthStr = o.month.toString().padStart(2, '0');
            this.labeldata.push(`${o.year}-${monthStr}`);
            this.realdata.push(o.count);
          });
          this.RenderBarChart(this.labeldata, this.realdata);
        }
      },
      (error) => console.error('Error fetching data:', error)
    );
  }

  loadordersbyshippingmethod() {
    this.service.loadordersbyshippingmethod().subscribe(
      (data) => {
        this.o_shipping = data;
        if (this.o_shipping.length) {
          this.label_shipping = [];
          this.value_shipping = [];
          this.o_shipping.forEach((o) => {
            this.label_shipping.push(o.method);
            this.value_shipping.push(o.count);
          });
          this.RenderShippingMethodChart(
            this.label_shipping,
            this.value_shipping,
            'barchart2'
          );
        }
      },
      (error) =>
        console.error('Error fetching orders by shipping method:', error)
    );
  }

  loadordersbypaymentmethod() {
    this.service.loadordersbypaymentmethod().subscribe(
      (data) => {
        this.o_payment = data;
        if (this.o_payment.length) {
          this.label_payment = [];
          this.value_payment = [];
          this.o_payment.forEach((o) => {
            this.label_payment.push(o.method);
            this.value_payment.push(o.count);
          });
          this.RenderPaymentMethodDoughnutChart(
            this.label_payment,
            this.value_payment,
            'barchart3'
          );
        }
      },
      (error) =>
        console.error('Error fetching orders by payment method:', error)
    );
  }

  loadordersbystatus() {
    this.service.loadordersbystatus().subscribe(
      (data) => {
        this.o_status = data;
        if (this.o_status.length) {
          this.label_status = [];
          this.value_status = [];
          this.o_status.forEach((o) => {
            if (o.status.toLowerCase() !== 'cancelled') {
              this.label_status.push(o.status);
              this.value_status.push(o.count);
            }
          });
          this.RenderStatusPieChart(
            this.label_status,
            this.value_status,
            'doughnut'
          );
        }
      },
      (error) => console.error('Error fetching orders by status:', error)
    );
  }

  loadordersbyday() {
    this.service.loadordersbyday().subscribe(
      (data) => {
        this.o_obd = data;
        if (this.o_obd.length) {
          this.label_obd = [];
          this.value_obd = [];
          this.o_obd.forEach((o) => {
            this.label_obd.push(o.date);
            this.value_obd.push(o.count);
          });
          this.RenderLineChart(this.label_obd, this.value_obd);
        }
      },
      (error) => console.error('Error fetching orders by day:', error)
    );
  }

  loadordersbycategory() {
    this.service.loadordersbycategory().subscribe(
      (data) => {
        this.o_category = data;
        if (this.o_category.length) {
          this.label_category = [];
          this.value_category = [];
          this.o_category.forEach((o) => {
            this.label_category.push(o.categoryName);
            this.value_category.push(o.orderCount);
          });
          this.RenderCategoryChart(
            this.label_category,
            this.value_category,
            'barchart_category'
          );
        }
      },
      (error) => console.error('Error fetching orders by category:', error)
    );
  }

  loadordersbybrand() {
    this.service.loadordersbybrand().subscribe(
      (data) => {
        this.o_brand = data;
        if (this.o_brand.length) {
          this.label_brand = [];
          this.value_brand = [];
          this.o_brand.forEach((o) => {
            this.label_brand.push(o.brandName);
            this.value_brand.push(o.orderCount);
          });
          this.RenderBrandChart(
            this.label_brand,
            this.value_brand,
            'barchart_brand'
          );
        }
      },
      (error) => console.error('Error fetching orders by brand:', error)
    );
  }

  getColorFromPalette(index: number, isCirclePalette: boolean = false) {
    const palette = isCirclePalette
      ? this.colorPaletteCircle
      : this.colorPalette;
    return palette[index % palette.length];
  }

  RenderBarChart(labels: string[], data: number[]) {
    this.RenderChart(
      labels,
      data,
      'barchart',
      'bar',
      false,
      'Orders by Month',
      false
    );
  }

  RenderShippingMethodChart(labels: string[], data: number[], chartId: string) {
    this.RenderChart(
      labels,
      data,
      chartId,
      'bar',
      true,
      'Orders by Shipping Method',
      false
    );
  }

  RenderCategoryChart(labels: string[], data: number[], chartId: string) {
    this.RenderChart(
      labels,
      data,
      chartId,
      'bar',
      true,
      'Orders by Category',
      false
    );
  }

  RenderBrandChart(labels: string[], data: number[], chartId: string) {
    this.RenderChart(
      labels,
      data,
      chartId,
      'bar',
      true,
      'Orders by Brand',
      false
    );
  }

  RenderPaymentMethodDoughnutChart(
    labels: string[],
    data: number[],
    chartId: string
  ) {
    this.RenderChart(
      labels,
      data,
      chartId,
      'doughnut',
      false,
      'Orders by Payment Method',
      true
    );
  }

  RenderStatusPieChart(labels: string[], data: number[], chartId: string) {
    this.RenderChart(
      labels,
      data,
      chartId,
      'pie',
      false,
      'Orders by Status',
      true
    );
  }

  RenderLineChart(labels: string[], data: number[]) {
    this.RenderChart(
      labels,
      data,
      'line',
      'line',
      false,
      'Orders by Day',
      false
    );
  }

  RenderChart(
    labels: string[],
    data: number[],
    chartId: string,
    type: any,
    horizontal: boolean,
    label: string,
    useCirclePalette: boolean
  ) {
    const existing = Chart.getChart(chartId);
    if (existing) existing.destroy();

    const bgColors = data.map((_, i) =>
      this.getColorFromPalette(i, useCirclePalette)
    );
    // Override line chart colors to red
    const finalColors = type === 'line' ? data.map(() => 'red') : bgColors;

    new Chart(chartId, {
      type,
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: finalColors,
            borderColor: finalColors,
            borderWidth: 1,
            fill: type === 'line' ? false : undefined,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            labels: { color: '#333' },
          },
        },
        indexAxis: horizontal ? 'y' : 'x',
        scales: {
          x: { beginAtZero: true, ticks: { color: '#333' } },
          y: { beginAtZero: true, ticks: { color: '#333' } },
        },
      },
    });
  }
}

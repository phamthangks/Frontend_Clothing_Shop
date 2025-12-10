import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { SharedService } from '../../../services/admin/statistics.service';

Chart.register(...registerables);

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss',
})
export class StatisticsComponent implements OnInit, OnDestroy {
  isLoading = true;
  
  // Thống kê tổng quan
  totalRevenue: number = 0;
  totalOrders: number = 0;
  averageOrderValue: number = 0;
  averageItemsPerOrder: number = 0;

  // Dữ liệu biểu đồ
  revenueData: any[] = [];
  topProducts: any[] = [];
  userGrowthData: any[] = [];
  orderStatusData: any[] = [];

  // Filter options
  filterType: string = 'month'; // day, month, year
  availableYears: number[] = [];
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;
  months: any[] = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' }
  ];

  // Chart instances
  revenueChart: any;
  productChart: any;
  userGrowthChart: any;
  statusChart: any;

  constructor(private statisticsService: SharedService) {}

  ngOnInit() {
    this.loadAvailableYears();
    this.loadAllStatistics();
  }

  loadAvailableYears() {
    this.statisticsService.getAvailableYears().subscribe({
      next: (years) => {
        this.availableYears = years;
        if (years.length > 0 && !years.includes(this.selectedYear)) {
          this.selectedYear = years[0];
        }
      },
      error: (error) => console.error('Lỗi khi tải danh sách năm:', error)
    });
  }

  onFilterChange() {
    this.loadRevenueChart();
  }

  loadAllStatistics() {
    this.isLoading = true;

    // Load tổng quan
    this.statisticsService.getTotalRevenue().subscribe({
      next: (data) => {
        this.totalRevenue = data.totalRevenue;
        this.totalOrders = data.totalOrders;
        this.averageOrderValue = this.totalOrders > 0 ? this.totalRevenue / this.totalOrders : 0;
      },
      error: (error) => console.error('Lỗi khi tải tổng doanh thu:', error)
    });

    // Load average items per order
    this.statisticsService.loadAverageItemsPerOrder().subscribe({
      next: (data: any) => {
        this.averageItemsPerOrder = data.averageItemsPerOrder;
      },
      error: (error) => console.error('Lỗi khi tải TB sản phẩm/đơn:', error)
    });

    // Load biểu đồ doanh thu
    this.loadRevenueChart();

    // Load sản phẩm bán chạy
    this.statisticsService.getTopSellingProducts(5).subscribe({
      next: (data) => {
        this.topProducts = data;
        setTimeout(() => this.renderProductChart(), 100);
      },
      error: (error) => console.error('Lỗi khi tải sản phẩm bán chạy:', error)
    });

    // Load tăng trưởng người dùng
    this.statisticsService.getUserGrowth().subscribe({
      next: (data) => {
        this.userGrowthData = data;
        setTimeout(() => this.renderUserGrowthChart(), 100);
      },
      error: (error) => console.error('Lỗi khi tải tăng trưởng người dùng:', error)
    });

    // Load đơn hàng theo trạng thái
    this.statisticsService.loadordersbystatus().subscribe({
      next: (data) => {
        this.orderStatusData = data;
        setTimeout(() => this.renderStatusChart(), 100);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải trạng thái đơn hàng:', error);
        this.isLoading = false;
      }
    });
  }

  loadRevenueChart() {
    const year = this.filterType === 'year' ? undefined : this.selectedYear;
    const month = this.filterType === 'day' ? this.selectedMonth : undefined;

    this.statisticsService.getRevenueChart(this.filterType, year, month).subscribe({
      next: (data) => {
        this.revenueData = data;
        setTimeout(() => this.renderRevenueChart(), 100);
      },
      error: (error) => console.error('Lỗi khi tải biểu đồ doanh thu:', error)
    });
  }

  renderRevenueChart() {
    if (this.revenueChart) {
      this.revenueChart.destroy();
    }

    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!ctx) {
      console.log('Không tìm thấy canvas revenueChart');
      return;
    }

    const labels = this.revenueData.map(d => d.label);
    const revenues = this.revenueData.map(d => d.revenue);

    this.revenueChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Doanh thu (VNĐ)',
            data: revenues,
            backgroundColor: 'rgba(102, 126, 234, 0.8)',
            borderColor: '#667eea',
            borderWidth: 2,
            borderRadius: 8,
            hoverBackgroundColor: '#667eea',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('vi-VN').format(context.parsed.y) + ' VNĐ';
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Doanh thu (VNĐ)'
            },
            ticks: {
              callback: function(value: any) {
                return new Intl.NumberFormat('vi-VN', { 
                  notation: 'compact', 
                  compactDisplay: 'short' 
                }).format(value);
              }
            }
          },
          x: {
            title: {
              display: true,
              text: this.getChartXAxisLabel()
            }
          }
        }
      }
    });
  }

  getChartXAxisLabel(): string {
    switch (this.filterType) {
      case 'day':
        return `Ngày trong tháng ${this.selectedMonth}/${this.selectedYear}`;
      case 'month':
        return `Tháng trong năm ${this.selectedYear}`;
      case 'year':
        return 'Năm';
      default:
        return '';
    }
  }

  getChartTitle(): string {
    switch (this.filterType) {
      case 'day':
        return `Doanh Thu Theo Ngày - Tháng ${this.selectedMonth}/${this.selectedYear}`;
      case 'month':
        return `Doanh Thu Theo Tháng - Năm ${this.selectedYear}`;
      case 'year':
        return 'Doanh Thu Theo Năm';
      default:
        return 'Doanh Thu';
    }
  }

  renderProductChart() {
    if (this.productChart) {
      this.productChart.destroy();
    }

    const ctx = document.getElementById('productChart') as HTMLCanvasElement;
    if (!ctx) {
      console.log('Không tìm thấy canvas productChart');
      return;
    }

    const labels = this.topProducts.map(p => p.productName);
    const data = this.topProducts.map(p => p.totalSold);

    this.productChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Số lượng đã bán',
          data: data,
          backgroundColor: [
            '#667eea',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#3b82f6'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Số lượng'
            }
          }
        }
      }
    });
  }

  renderUserGrowthChart() {
    if (this.userGrowthChart) {
      this.userGrowthChart.destroy();
    }

    const ctx = document.getElementById('userGrowthChart') as HTMLCanvasElement;
    if (!ctx) {
      console.log('Không tìm thấy canvas userGrowthChart');
      return;
    }

    const labels = this.userGrowthData.map(d => d.month);
    const newUsers = this.userGrowthData.map(d => d.newUsers);
    const totalUsers = this.userGrowthData.map(d => d.totalUsers);

    this.userGrowthChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Người dùng mới',
            data: newUsers,
            backgroundColor: '#667eea',
            borderWidth: 0
          },
          {
            label: 'Tổng người dùng',
            data: totalUsers,
            backgroundColor: '#10b981',
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Số người dùng'
            }
          }
        }
      }
    });
  }

  renderStatusChart() {
    if (this.statusChart) {
      this.statusChart.destroy();
    }

    const ctx = document.getElementById('statusChart') as HTMLCanvasElement;
    if (!ctx) {
      console.log('Không tìm thấy canvas statusChart');
      return;
    }

    const labels = this.orderStatusData.map(d => d.status);
    const data = this.orderStatusData.map(d => d.count);

    this.statusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            '#667eea',
            '#10b981',
            '#f59e0b',
            '#ef4444',
            '#3b82f6',
            '#ec4899'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.revenueChart) this.revenueChart.destroy();
    if (this.productChart) this.productChart.destroy();
    if (this.userGrowthChart) this.userGrowthChart.destroy();
    if (this.statusChart) this.statusChart.destroy();
  }
}

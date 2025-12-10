import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedService } from '../../../services/admin/statistics.service';

interface Stats {
  totalOrdersThisMonth: number;
  revenueThisMonth: number;
  totalProducts: number;
  totalUsers: number;
}

interface Activity {
  id: number;
  fullname: string;
  orderDate: string;
  status: string;
  totalMoney: number;
  paymentMethod: string;
}

interface OrderStatusStat {
  status: string;
  count: number;
}

@Component({
  selector: 'app-welcome-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './welcome-admin.component.html',
  styleUrls: ['./welcome-admin.component.scss']
})
export class WelcomeAdminComponent implements OnInit {
  adminName = 'Admin';
  currentDate = new Date();
  isLoading = true;

  stats: Stats = {
    totalOrdersThisMonth: 0,
    revenueThisMonth: 0,
    totalProducts: 0,
    totalUsers: 0
  };

  recentActivities: Activity[] = [];
  orderStatusStats: OrderStatusStat[] = [];

  constructor(private statisticsService: SharedService) {}

  ngOnInit(): void {
    // Lấy thông tin admin từ localStorage
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      this.adminName = storedName;
    }

    // Tải dữ liệu thống kê từ API
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.isLoading = true;
    this.statisticsService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = {
          totalOrdersThisMonth: data.totalOrdersThisMonth,
          revenueThisMonth: data.revenueThisMonth,
          totalProducts: data.totalProducts,
          totalUsers: data.totalUsers
        };
        this.recentActivities = data.recentActivities;
        this.orderStatusStats = data.orderStatusStats;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải dữ liệu thống kê:', error);
        this.isLoading = false;
      }
    });
  }

  getActivityType(status: string): string {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('thành công') || statusLower.includes('completed') || statusLower.includes('delivered')) {
      return 'success';
    } else if (statusLower.includes('đang') || statusLower.includes('processing') || statusLower.includes('shipping')) {
      return 'info';
    } else if (statusLower.includes('hủy') || statusLower.includes('cancelled')) {
      return 'warning';
    } else if (statusLower.includes('pending') || statusLower.includes('chờ')) {
      return 'primary';
    }
    return 'info';
  }

  getActivityIcon(status: string): string {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('thành công') || statusLower.includes('completed') || statusLower.includes('delivered')) {
      return 'fas fa-check-circle';
    } else if (statusLower.includes('đang') || statusLower.includes('processing') || statusLower.includes('shipping')) {
      return 'fas fa-shipping-fast';
    } else if (statusLower.includes('hủy') || statusLower.includes('cancelled')) {
      return 'fas fa-times-circle';
    } else if (statusLower.includes('pending') || statusLower.includes('chờ')) {
      return 'fas fa-clock';
    }
    return 'fas fa-shopping-cart';
  }

  getTimeAgo(dateString: string): string {
    const orderDate = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} phút trước`;
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    } else {
      return `${diffDays} ngày trước`;
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { OrderService } from '../../../services/admin/order.service';
import { Order } from '../../../dto/order.dto';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrderAdminEditComponent } from '../order-admin-edit/order-admin-edit.component';
import { OrderAdminViewComponent } from '../order-admin-view/order-admin-view.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, MatDialogModule, FormsModule],
  templateUrl: './order-admin.component.html',
  styleUrl: './order-admin.component.scss',
})
export class OrderAdminComponent implements OnInit {
  orders: Order[] = [];
  currentPage = 1;
  totalPages = 1;
  pages: number[] = [];
  itemsPerPage = 10;

  // Search and Filter
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedPaymentMethod: string = '';

  // Filter options
  statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  paymentMethodOptions = ['COD', 'PayPal', 'Credit Card'];

  constructor(
    private orderService: OrderService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getOrders(this.currentPage);
  }

  getOrders(page: number): void {
    this.orderService.getOrders(
      page, 
      this.itemsPerPage,
      this.searchTerm || undefined,
      this.selectedStatus || undefined,
      this.selectedPaymentMethod || undefined
    ).subscribe({
      next: (response) => {
        this.orders = response.data;
        this.totalPages = Math.ceil(response.total / this.itemsPerPage);
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.currentPage = page;
      },
      error: (error) => {
        console.error('Error fetching orders:', error);
      },
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.getOrders(this.currentPage);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.getOrders(this.currentPage);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedPaymentMethod = '';
    this.currentPage = 1;
    this.getOrders(this.currentPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.getOrders(page);
    }
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.getOrders(page);
    }
  }

  openEditDialog(order: Order): void {
    const dialogRef = this.dialog.open(OrderAdminEditComponent, {
      width: '900px',
      height: '80vh',
      maxHeight: '80vh',
      data: { ...order },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getOrders(this.currentPage);
      }
    });
  }

  openViewDialog(order: Order): void {
    this.dialog.open(OrderAdminViewComponent, {
      width: '1000px',
      maxHeight: '90vh',
      data: { id: order.id },
    });
  }

  getStatusBadgeClass(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'badge bg-warning text-dark';
      case 'processing':
        return 'badge bg-info';
      case 'shipped':
        return 'badge bg-primary';
      case 'delivered':
        return 'badge bg-success';
      case 'cancelled':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return 'N/A';
    const statusLabels: { [key: string]: string } = {
      'pending': 'Chờ xử lý',
      'processing': 'Đang xử lý',
      'shipped': 'Đang giao',
      'delivered': 'Đã giao',
      'cancelled': 'Đã hủy'
    };
    return statusLabels[status] || status;
  }

  getStatusIcon(status: string | undefined): string {
    if (!status) return 'fas fa-circle';
    const statusIcons: { [key: string]: string } = {
      'pending': 'fas fa-clock',
      'processing': 'fas fa-box',
      'shipped': 'fas fa-shipping-fast',
      'delivered': 'fas fa-check-circle',
      'cancelled': 'fas fa-times-circle'
    };
    return statusIcons[status] || 'fas fa-circle';
  }

  getOrderCountByStatus(status: string): number {
    return this.orders.filter(order => order.status?.toLowerCase() === status.toLowerCase()).length;
  }
}

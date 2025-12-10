import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Order } from '../../../dto/order.dto';
import { OrderService } from '../../../services/admin/order.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-admin-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './order-admin-edit.component.html',
  styleUrls: ['./order-admin-edit.component.scss'],
})
export class OrderAdminEditComponent {
  order: Order;
  originalStatus: string | undefined;
  availableStatuses: string[] = [];
  
  // Status flow map
  statusFlowMap: { [key: string]: string[] } = {
    'pending': ['processing', 'cancelled'],
    'processing': ['shipped', 'cancelled'],
    'shipped': ['delivered'],
    'delivered': [],  // Cannot change from delivered
    'cancelled': []   // Cannot change from cancelled
  };

  constructor(
    public dialogRef: MatDialogRef<OrderAdminEditComponent>,
    private orderService: OrderService,
    @Inject(MAT_DIALOG_DATA) public data: Order
  ) {
    this.order = { ...data };
    this.originalStatus = data.status;
    this.updateAvailableStatuses();
  }

  updateAvailableStatuses(): void {
    const currentStatus = this.originalStatus?.toLowerCase() || 'pending';
    this.availableStatuses = this.statusFlowMap[currentStatus] || [];
  }

  canUpdateStatus(): boolean {
    return this.availableStatuses.length > 0;
  }

  getStatusMessage(): string {
    const currentStatus = this.originalStatus?.toLowerCase() || '';
    
    if (currentStatus === 'delivered') {
      return 'Đơn hàng đã được giao thành công, không thể thay đổi trạng thái.';
    }
    if (currentStatus === 'cancelled') {
      return 'Đơn hàng đã bị hủy, không thể thay đổi trạng thái.';
    }
    return '';
  }

  onSubmit(): void {
    if (!this.canUpdateStatus()) {
      alert('Không thể cập nhật trạng thái của đơn hàng này!');
      return;
    }

    this.orderService.updateOrder(this.order.id, this.order).subscribe(
      () => {
        alert('Cập nhật trạng thái đơn hàng thành công!');
        this.dialogRef.close(true);
      },
      (error) => {
        console.error('Error updating order:', error);
        alert('Có lỗi xảy ra khi cập nhật trạng thái!');
      }
    );
  }

  onCancel(): void {
    this.dialogRef.close();
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

  getStatusClass(status: string | undefined): string {
    return status?.toLowerCase() || 'pending';
  }

  getStatusIcon(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'fas fa-clock';
      case 'processing':
        return 'fas fa-spinner';
      case 'shipped':
        return 'fas fa-truck';
      case 'delivered':
        return 'fas fa-check-circle';
      case 'cancelled':
        return 'fas fa-times-circle';
      default:
        return 'fas fa-question-circle';
    }
  }
}

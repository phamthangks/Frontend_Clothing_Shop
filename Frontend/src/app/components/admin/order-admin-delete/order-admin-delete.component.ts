import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { OrderService } from '../../../services/admin/order.service';
import { Order } from '../../../dto/order.dto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-admin-delete',
  standalone: true,
  templateUrl: './order-admin-delete.component.html',
  styleUrls: ['./order-admin-delete.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
  ],
})
export class OrderAdminDeleteComponent {
  constructor(
    public dialogRef: MatDialogRef<OrderAdminDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private orderService: OrderService
  ) {}

  onDelete(): void {
    this.orderService.deleteOrder(this.data.id).subscribe(
      () => {
        alert('Order deleted successfully!');
        this.dialogRef.close(true); // Đóng dialog và trả kết quả
      },
      (error) => {
        console.error('Error deleting order:', error);
        alert('Error deleting order');
      }
    );
  }

  // Đóng dialog mà không làm gì
  onCancel(): void {
    this.dialogRef.close();
  }
}

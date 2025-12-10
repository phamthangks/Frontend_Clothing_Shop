import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductAdminService } from '../../../services/admin/productadmin.service';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-admin-delete',
  templateUrl: './product-admin-delete.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSnackBarModule,
  ],
  styleUrls: ['./product-admin-delete.component.scss'],
})
export class ProductAdminDeleteComponent {
  errorMessage: string = '';
  isDeleting: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ProductAdminDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number; name: string },
    private productAdminService: ProductAdminService,
    private snackBar: MatSnackBar
  ) {}

  onDelete(): void {
    this.errorMessage = '';
    this.isDeleting = true;

    this.productAdminService.deleteProduct(this.data.id).subscribe({
      next: (response) => {
        const message = response.message || 'Sản phẩm đã được xóa thành công!';
        this.snackBar.open(message, 'Đóng', { duration: 3000 });
        this.dialogRef.close(true); // Đóng dialog và trả kết quả
      },
      error: (error) => {
        this.isDeleting = false;
        console.error('Error deleting product:', error);
        
        // Xử lý các loại lỗi khác nhau
        if (error.status === 400) {
          // Bad Request - có thể là vì product đang được sử dụng
          this.errorMessage = error.error?.message || 'Không thể xóa sản phẩm này';
          if (error.error?.detail) {
            this.errorMessage += '\n' + error.error.detail;
          }
        } else if (error.status === 404) {
          // Not Found
          this.errorMessage = 'Không tìm thấy sản phẩm';
        } else if (error.status === 500) {
          // Server error
          this.errorMessage = 'Lỗi server: ' + (error.error?.message || 'Vui lòng thử lại sau');
        } else {
          this.errorMessage = 'Có lỗi xảy ra: ' + (error.error?.message || error.message || 'Vui lòng thử lại');
        }
        
        // Hiển thị lỗi trên toast
        this.snackBar.open(this.errorMessage, 'Đóng', { duration: 5000 });
      },
      complete: () => {
        this.isDeleting = false;
      }
    });
  }

  // Đóng dialog mà không làm gì
  onCancel(): void {
    this.dialogRef.close();
  }
}

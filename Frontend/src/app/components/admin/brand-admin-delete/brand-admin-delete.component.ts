import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrandService } from '../../../services/admin/brand.service';
import { Brand } from '../../../dto/brand.dto';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-brand-admin-delete',
  standalone: true,
  templateUrl: './brand-admin-delete.component.html',
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSnackBarModule,
  ],
  styleUrls: ['./brand-admin-delete.component.scss'],
})
export class BrandAdminDeleteComponent {
  errorMessage: string = '';
  isDeleting: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<BrandAdminDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number; name: string },
    private brandService: BrandService,
    private snackBar: MatSnackBar
  ) {}

  // Hàm xóa brand
  onDelete(): void {
    this.errorMessage = '';
    this.isDeleting = true;

    this.brandService.deleteBrand(this.data.id).subscribe({
      next: (response) => {
        const message = response.message || 'Brand đã được xóa thành công!';
        this.snackBar.open(message, 'Đóng', { duration: 3000 });
        this.dialogRef.close(true); // Đóng dialog và trả kết quả
      },
      error: (error) => {
        this.isDeleting = false;
        console.error('Error deleting brand:', error);
        
        // Xử lý các loại lỗi khác nhau
        if (error.status === 400) {
          // Bad Request - có thể là vì brand đang được sử dụng
          this.errorMessage = error.error?.message || 'Không thể xóa brand này';
          if (error.error?.detail) {
            this.errorMessage += '\n' + error.error.detail;
          }
        } else if (error.status === 404) {
          // Not Found
          this.errorMessage = 'Không tìm thấy brand';
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

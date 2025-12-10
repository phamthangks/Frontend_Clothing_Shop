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
  selector: 'app-brand-admin-edit',
  standalone: true,
  templateUrl: './brand-admin-edit.component.html',
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSnackBarModule,
  ],
  styleUrls: ['./brand-admin-edit.component.scss'],
})
export class BrandAdminEditComponent {
  brand: Brand;
  errorMessage: string = '';
  isSubmitting: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<BrandAdminEditComponent>,
    private brandService: BrandService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) data: Brand
  ) {
    this.brand = { ...data };
  }

  onSubmit(): void {
    // Reset error message
    this.errorMessage = '';

    // Client-side validation
    if (!this.brand.name || this.brand.name.trim() === '') {
      this.errorMessage = 'Tên brand là bắt buộc';
      this.snackBar.open(this.errorMessage, 'Đóng', { duration: 3000 });
      return;
    }

    if (this.brand.name.trim().length > 255) {
      this.errorMessage = 'Tên brand không được vượt quá 255 ký tự';
      this.snackBar.open(this.errorMessage, 'Đóng', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;
    this.brandService
      .updateBrand(this.brand.id, this.brand)
      .subscribe({
        next: (response) => {
          const message = response.message || 'Brand đã được cập nhật thành công!';
          this.snackBar.open(message, 'Đóng', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error updating brand:', error);
          
          // Xử lý các loại lỗi khác nhau
          if (error.status === 409) {
            // Conflict - trùng tên
            this.errorMessage = error.error?.message || 'Brand đã tồn tại';
          } else if (error.status === 400) {
            // Bad Request - validation error
            this.errorMessage = error.error?.message || 'Dữ liệu không hợp lệ';
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
          this.isSubmitting = false;
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

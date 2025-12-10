import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CategoryService } from '../../../services/admin/category.service';
import { Category } from '../../../dto/category.dto';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category-admin-edit',
  standalone: true,
  templateUrl: './category-admin-edit.component.html',
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSnackBarModule,
  ],
  styleUrls: ['./category-admin-edit.component.scss'],
})
export class CategoryAdminEditComponent {
  category: Category;
  errorMessage: string = '';
  isSubmitting: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<CategoryAdminEditComponent>,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) data: Category
  ) {
    this.category = { ...data };
  }

  onSubmit(): void {
    // Reset error message
    this.errorMessage = '';

    // Client-side validation
    if (!this.category.name || this.category.name.trim() === '') {
      this.errorMessage = 'Tên category là bắt buộc';
      this.snackBar.open(this.errorMessage, 'Đóng', { duration: 3000 });
      return;
    }

    if (this.category.name.trim().length > 255) {
      this.errorMessage = 'Tên category không được vượt quá 255 ký tự';
      this.snackBar.open(this.errorMessage, 'Đóng', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;
    this.categoryService
      .updateCategory(this.category.id, this.category)
      .subscribe({
        next: (response) => {
          const message = response.message || 'Category đã được cập nhật thành công!';
          this.snackBar.open(message, 'Đóng', { duration: 3000 });
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error updating category:', error);
          
          // Xử lý các loại lỗi khác nhau
          if (error.status === 409) {
            // Conflict - trùng tên
            this.errorMessage = error.error?.message || 'Category đã tồn tại';
          } else if (error.status === 400) {
            // Bad Request - validation error
            this.errorMessage = error.error?.message || 'Dữ liệu không hợp lệ';
          } else if (error.status === 404) {
            // Not Found
            this.errorMessage = 'Không tìm thấy category';
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

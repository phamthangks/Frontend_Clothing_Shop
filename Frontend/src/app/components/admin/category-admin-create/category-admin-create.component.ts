import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CategoryService } from '../../../services/admin/category.service';
import { Category } from '../../../dto/category.dto';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category-admin-create',
  standalone: true,
  templateUrl: './category-admin-create.component.html',
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSnackBarModule,
  ],
  styleUrls: ['./category-admin-create.component.scss'],
})
export class CategoryAdminCreateComponent {
  category: Category = {
    id: 0,
    name: '',
  };

  errorMessage: string = '';
  isSubmitting: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<CategoryAdminCreateComponent>,
    private categoryService: CategoryService,
    private snackBar: MatSnackBar
  ) {}

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
    this.categoryService.createCategory(this.category).subscribe({
      next: (response) => {
        const message = response.message || 'Category đã được tạo thành công!';
        this.snackBar.open(message, 'Đóng', { duration: 3000 });
        this.dialogRef.close(true); // return true to refresh list
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error adding category:', error);
        
        // Xử lý các loại lỗi khác nhau
        if (error.status === 409) {
          // Conflict - trùng tên
          this.errorMessage = error.error?.message || 'Category đã tồn tại';
        } else if (error.status === 400) {
          // Bad Request - validation error
          this.errorMessage = error.error?.message || 'Dữ liệu không hợp lệ';
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

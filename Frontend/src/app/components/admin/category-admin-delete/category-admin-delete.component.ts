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
  selector: 'app-category-admin-delete',
  standalone: true,
  templateUrl: './category-admin-delete.component.html',
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSnackBarModule,
  ],
  styleUrls: ['./category-admin-delete.component.scss'],
})
export class CategoryAdminDeleteComponent {
  errorMessage: string = '';
  isDeleting: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<CategoryAdminDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number; name: string },
    private categoryService: CategoryService,
    private snackBar: MatSnackBar
  ) {}

  onDelete(): void {
    this.errorMessage = '';
    this.isDeleting = true;

    this.categoryService.deleteCategory(this.data.id).subscribe({
      next: (response) => {
        const message = response.message || 'Category đã được xóa thành công!';
        this.snackBar.open(message, 'Đóng', { duration: 3000 });
        this.dialogRef.close(true); // Đóng dialog và trả kết quả
      },
      error: (error) => {
        this.isDeleting = false;
        console.error('Error deleting category:', error);
        
        // Xử lý các loại lỗi khác nhau
        if (error.status === 400) {
          // Bad Request - có thể là vì category đang được sử dụng
          this.errorMessage = error.error?.message || 'Không thể xóa category này';
          if (error.error?.detail) {
            this.errorMessage += '\n' + error.error.detail;
          }
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
        this.isDeleting = false;
      }
    });
  }

  // Đóng dialog mà không làm gì
  onCancel(): void {
    this.dialogRef.close();
  }
}

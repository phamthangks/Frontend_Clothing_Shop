import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from '../../../services/admin/user.service';
import { User } from '../../../dto/user.dto';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-user-admin-delete',
  templateUrl: './user-admin-delete.component.html',
  styleUrls: ['./user-admin-delete.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
  ],
})
export class UserAdminDeleteComponent {
  constructor(
    private dialogRef: MatDialogRef<UserAdminDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  onDelete(): void {
    this.userService.deleteUser(this.data.id).subscribe({
      next: () => {
        this.snackBar.open('User deleted successfully!', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        // Nếu server trả về 409 Conflict nghĩa là không thể xóa do ràng buộc
        if (error.status === 409) {
          this.snackBar.open('User đang liên quan đến các dịch vụ khác, không thể xóa', 'Close', { duration: 3000 });
        } else {
          console.error('Error deleting user:', error);
          const message = error?.error?.message || 'User is involved in other services, cannot be deleted';
          this.snackBar.open(message, 'Close', { duration: 3000 });
        }
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

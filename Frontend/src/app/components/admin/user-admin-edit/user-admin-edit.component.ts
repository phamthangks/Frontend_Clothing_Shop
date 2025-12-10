import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../../services/admin/user.service';
import { User } from '../../../dto/user.dto';
import { Role } from '../../../dto/role.dto';
import { RoleService } from '../../../services/admin/role.service';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-user-admin-edit',
  templateUrl: './user-admin-edit.component.html',
  styleUrls: ['./user-admin-edit.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    MatSnackBarModule,
  ],
})
export class UserAdminEditComponent {
  user: User;
  roles: Role[] = [];

  constructor(
    private dialogRef: MatDialogRef<UserAdminEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User,
    private userService: UserService,
    private roleService: RoleService,
    private snackBar: MatSnackBar
  ) {
    // Clone dữ liệu gốc để tránh sửa trực tiếp
    this.user = { ...data };
    this.roleService.getRoles().subscribe({
      next: (roles) => (this.roles = roles),
      error: (err) => console.error('Error loading roles', err),
    });
  }

  onSubmit(): void {
    // Pre-check duplicate phone (exclude current user id)
    const phone = this.user.phoneNumber?.trim();
    if (phone) {
      this.userService.checkPhone(phone, this.user.id).subscribe({
        next: (res) => {
          if (res.exists) {
            this.snackBar.open('Số điện thoại đã tồn tại', 'Close', { duration: 3000 });
            return;
          }
          this.doUpdate();
        },
        error: () => this.doUpdate(),
      });
    } else {
      this.doUpdate();
    }
  }

  private doUpdate(): void {
    // Prepare user data: remove password if empty to avoid validation error
    const userToUpdate = { ...this.user };
    if (!userToUpdate.password || userToUpdate.password.trim() === '') {
      delete (userToUpdate as any).password;
    }

    this.userService.updateUser(this.user.id, userToUpdate).subscribe({
      next: () => {
        this.snackBar.open('User updated successfully!', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Lỗi khi cập nhật người dùng:', error);
        console.error('Validation errors:', error?.error?.errors);
        const message = error?.error?.message || error?.error?.title || 'Cập nhật người dùng thất bại. Vui lòng kiểm tra thông tin và thử lại.';
        this.snackBar.open(message, 'Close', { duration: 3000 });
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

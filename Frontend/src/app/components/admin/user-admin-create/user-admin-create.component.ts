import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../../services/admin/user.service';
import { User } from '../../../dto/user.dto';
import { Role } from '../../../dto/role.dto';
import { RoleService } from '../../../services/admin/role.service';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-user-admin-create',
  templateUrl: './user-admin-create.component.html',
  styleUrls: ['./user-admin-create.component.scss'],
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
export class UserAdminCreateComponent {
  user: User = {
    id: 0,
    fullname: '',
    phoneNumber: '',
    password: '',
    createdAt: undefined,
    updatedAt: undefined,
    isActive: true,
    facebookAccountId: 0,
    googleAccountId: 0,
    roleId: undefined,
  };
  roles: Role[] = [];

  constructor(
    private dialogRef: MatDialogRef<UserAdminCreateComponent>,
    private userService: UserService,
    private roleService: RoleService,
    private snackBar: MatSnackBar
  ) {
    this.roleService.getRoles().subscribe({
      next: (roles) => (this.roles = roles),
      error: (err) => console.error('Error loading roles', err),
    });
  }

  onSubmit(): void {
    this.userService.createUser(this.user).subscribe({
      next: () => {
        this.snackBar.open('User added successfully!', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error adding user:', error);
        const message = error?.error?.message || 'Tạo người dùng thất bại. Vui lòng kiểm tra thông tin và thử lại.';
        this.snackBar.open(message, 'Close', { duration: 3000 });
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

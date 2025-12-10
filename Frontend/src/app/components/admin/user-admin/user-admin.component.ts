import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../services/admin/user.service';
import { RoleService } from '../../../services/admin/role.service';
import { User } from '../../../dto/user.dto';
import { Role } from '../../../dto/role.dto';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserAdminCreateComponent } from '../user-admin-create/user-admin-create.component';
import { UserAdminEditComponent } from '../user-admin-edit/user-admin-edit.component';
import { UserAdminDeleteComponent } from '../user-admin-delete/user-admin-delete.component';
import { FormsModule } from '@angular/forms';
import { UserAdminViewComponent } from '../user-admin-view/user-admin-view.component';

@Component({
  selector: 'app-user-admin',
  imports: [CommonModule, RouterModule, MatDialogModule, FormsModule, MatSnackBarModule],
  templateUrl: './user-admin.component.html',
  styleUrl: './user-admin.component.scss',
})
export class UserAdminComponent implements OnInit {
  users: User[] = [];
  currentPage = 1;
  totalPages = 1;
  pages: number[] = [];
  itemsPerPage = 10;
  // filters
  searchKeyword: string = '';
  selectedRoleId: number | null = null;
  selectedStatus: string = 'active';
  roles: Role[] = [];

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.getUsers(this.currentPage);
  }

  loadRoles(): void {
    this.roleService.getRoles().subscribe({
      next: (roles) => (this.roles = roles),
      error: (err) => console.error('Error loading roles', err),
    });
  }

  getUsers(page: number): void {
    const isActiveFilter = this.selectedStatus === 'all' ? undefined : this.selectedStatus === 'active';
    const roleIdFilter = this.selectedRoleId ?? undefined;
    const search = this.searchKeyword?.trim() || undefined;
    this.userService.getUsers(page, this.itemsPerPage, search, roleIdFilter, isActiveFilter).subscribe({
      next: (response) => {
        this.users = response.data;
        this.totalPages = Math.ceil(response.total / this.itemsPerPage);
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.currentPage = page;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
        const message = error?.error?.message || 'Không tải được danh sách người dùng. Vui lòng thử lại.';
        this.snackBar.open(message, 'Đóng', { duration: 3000 });
      },
    });
  }

  onSearchChange(): void {
    this.getUsers(1);
  }

  onRoleFilterChange(): void {
    this.getUsers(1);
  }

  onStatusFilterChange(): void {
    this.getUsers(1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.getUsers(page);
    }
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.getUsers(page);
    }
  }
  openAddDialog(): void {
    const dialogRef = this.dialog.open(UserAdminCreateComponent, {
      width: '500px', // Chỉnh kích thước dialog tùy ý
    });

    // Lắng nghe sự kiện khi dialog đóng
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Khi dialog đóng và có kết quả, refresh danh sách người dùng
        this.getUsers(this.currentPage);
      }
    });
  }

  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(UserAdminEditComponent, {
      width: '600px',
      data: { ...user },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getUsers(this.currentPage);
      }
    });
  }
  openViewDialog(user: User): void {
    const roleName = this.getRoleDisplay(user);
    this.dialog.open(UserAdminViewComponent, {
      width: '600px',
      data: { ...user, roleName },
    });
  }

  getRoleNameById(roleId?: number): string | number {
    if (roleId === undefined || roleId === null) return '';
    const found = this.roles.find(r => r.id === roleId);
    return found ? found.name : roleId;
  }

  getRoleDisplay(user: User): string | number {
    if (user && user.role && user.role.name) return user.role.name;
    return this.getRoleNameById(user.roleId);
  }
  restoreUser(user: User): void {
    this.userService.restoreUser(user.id).subscribe({
      next: () => {
        this.snackBar.open('User restored successfully!', 'Close', { duration: 3000 });
        this.getUsers(this.currentPage);
      },
      error: (error) => {
        console.error('Error restoring user:', error);
        const message = error?.error?.message || 'Khôi phục người dùng thất bại';
        this.snackBar.open(message, 'Close', { duration: 3000 });
      },
    });
  }
  openDeleteDialog(user: User): void {
    const dialogRef = this.dialog.open(UserAdminDeleteComponent, {
      width: '500px',
      data: { id: user.id },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getUsers(this.currentPage); // refresh brand list sau khi xóa
      }
    });
  }

  getUserCountByStatus(isActive: boolean): number {
    return this.users.filter(user => user.isActive === isActive).length;
  }

  getAdminCount(): number {
    return this.users.filter(user => this.isAdmin(user)).length;
  }

  isAdmin(user: User): boolean {
    return user.role?.name?.toLowerCase() === 'admin' || user.roleId === 1;
  }

  getRoleIcon(user: User): string {
    if (this.isAdmin(user)) {
      return 'fas fa-user-shield';
    }
    return 'fas fa-user';
  }

  clearFilters(): void {
    this.searchKeyword = '';
    this.selectedRoleId = null;
    this.selectedStatus = 'all';
    this.getUsers(1);
  }
}

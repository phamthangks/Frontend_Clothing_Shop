import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { User } from '../../../dto/user.dto';
import { RoleService } from '../../../services/admin/role.service';
import { Role } from '../../../dto/role.dto';

@Component({
  selector: 'app-user-admin-view',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './user-admin-view.component.html',
  styleUrls: ['./user-admin-view.component.scss']
})
export class UserAdminViewComponent {
  displayRoleName: string | number = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: User,
    private roleService: RoleService
  ) {
    // Prefer role.name, then roleName passed from opener, else fallback to roleId
    const passedRoleName = (data as any)?.roleName as string | number | undefined;
    this.displayRoleName = data?.role?.name ?? passedRoleName ?? data.roleId ?? '';

    // If still numeric, try to fetch roles to resolve name
    if (typeof this.displayRoleName === 'number' && data?.roleId != null) {
      this.roleService.getRoles().subscribe({
        next: (roles: Role[]) => {
          const found = roles.find(r => r.id === data.roleId!);
          if (found) {
            this.displayRoleName = found.name;
          }
        }
      });
    }
  }
}



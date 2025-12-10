import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { BrandService } from '../../../services/admin/brand.service';
import { Brand } from '../../../dto/brand.dto';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { BrandAdminCreateComponent } from '../brand-admin-create/brand-admin-create.component';
import { BrandAdminEditComponent } from '../brand-admin-edit/brand-admin-edit.component';
import { BrandAdminDeleteComponent } from '../brand-admin-delete/brand-admin-delete.component';

@Component({
  selector: 'app-brand-admin',
  imports: [CommonModule, RouterModule, MatDialogModule, FormsModule],
  templateUrl: './brand-admin.component.html',
  styleUrls: ['./brand-admin.component.scss'],
})
export class BrandAdminComponent implements OnInit {
  brands: Brand[] = [];
  currentPage = 1;
  totalPages = 1;
  pages: number[] = [];

  constructor(
    private brandService: BrandService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getBrands(this.currentPage);
  }

  getBrands(page: number): void {
    const itemsPerPage = 10;
    this.brandService.getBrands(page, itemsPerPage).subscribe((response) => {
      this.brands = response.items;
      this.totalPages = Math.ceil(response.total / itemsPerPage);
      this.currentPage = page;
      this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    });
  }

  goToPage(page: number): void {
    this.getBrands(page);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.getBrands(page);
    }
  }
  openAddDialog(): void {
    const dialogRef = this.dialog.open(BrandAdminCreateComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getBrands(this.currentPage); // refresh brand list
      }
    });
  }
  openEditDialog(brand: Brand): void {
    const dialogRef = this.dialog.open(BrandAdminEditComponent, {
      width: '400px',
      data: brand, // Truyền dữ liệu của brand vào dialog
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getBrands(this.currentPage); // refresh brand list
      }
    });
  }

  // Chức năng mở dialog xóa
  openDeleteDialog(id: number, name: string): void {
    const dialogRef = this.dialog.open(BrandAdminDeleteComponent, {
      width: '500px',
      data: { id, name }, // Truyền id và name của brand vào dialog
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getBrands(this.currentPage); // refresh brand list sau khi xóa
      }
    });
  }
}

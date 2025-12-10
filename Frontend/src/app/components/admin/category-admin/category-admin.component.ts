import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CategoryService } from '../../../services/admin/category.service';
import { Category } from '../../../dto/category.dto';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CategoryAdminCreateComponent } from '../category-admin-create/category-admin-create.component';
import { CategoryAdminEditComponent } from '../category-admin-edit/category-admin-edit.component';
import { CategoryAdminDeleteComponent } from '../category-admin-delete/category-admin-delete.component';

@Component({
  selector: 'app-category-admin',
  imports: [CommonModule, RouterModule, MatDialogModule, FormsModule],
  templateUrl: './category-admin.component.html',
  styleUrls: ['./category-admin.component.scss'],
})
export class CategoryAdminComponent implements OnInit {
  categories: Category[] = [];
  currentPage = 1;
  totalPages = 1;
  pages: number[] = [];

  constructor(
    private categoryService: CategoryService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getCategories(this.currentPage);
  }

  getCategories(page: number): void {
    const itemsPerPage = 10;
    this.categoryService
      .getCategories(page, itemsPerPage)
      .subscribe((response) => {
        this.categories = response.items;
        this.totalPages = Math.ceil(response.total / itemsPerPage);
        this.currentPage = page;
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      });
  }

  goToPage(page: number): void {
    this.getCategories(page);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.getCategories(page);
    }
  }
  openAddDialog(): void {
    const dialogRef = this.dialog.open(CategoryAdminCreateComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getCategories(this.currentPage);
      }
    });
  }
  openEditDialog(category: Category): void {
    const dialogRef = this.dialog.open(CategoryAdminEditComponent, {
      width: '400px',
      data: category,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getCategories(this.currentPage);
      }
    });
  }

  // Chức năng mở dialog xóa
  openDeleteDialog(id: number, name: string): void {
    const dialogRef = this.dialog.open(CategoryAdminDeleteComponent, {
      width: '400px',
      data: { id, name },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getCategories(this.currentPage);
      }
    });
  }
}

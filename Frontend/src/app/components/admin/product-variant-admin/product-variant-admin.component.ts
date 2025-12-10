import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductVariant } from '../../../dto/productVariant.dto';
import { Product } from '../../../dto/product.dto';
import { ProductVariantService } from '../../../services/admin/productvariant.service';
import { ProductAdminService } from '../../../services/admin/productadmin.service';
import { ProductVariantCreateComponent } from '../product-variant-create/product-variant-create.component';
import { ProductVariantEditComponent } from '../product-variant-edit/product-variant-edit.component';
import { ProductVariantDeleteComponent } from '../product-variant-delete/product-variant-delete.component';

@Component({
  selector: 'app-product-variant-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './product-variant-admin.component.html',
  styleUrls: ['./product-variant-admin.component.scss'],
})
export class ProductVariantAdminComponent implements OnInit {
  variants: ProductVariant[] = [];
  filteredVariants: ProductVariant[] = [];
  products: Product[] = [];
  selectedProductId: number | null = null;
  searchTerm = '';
  selectedColor = '';
  selectedSize = '';
  sortBy = 'id';
  viewMode: 'grid' | 'table' = 'table';

  // Lấy danh sách màu sắc và kích thước duy nhất
  availableColors: string[] = [];
  availableSizes: string[] = [];

  constructor(
    private variantService: ProductVariantService,
    private productService: ProductAdminService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadVariants();
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách sản phẩm:', error);
        alert('Tải danh sách sản phẩm thất bại!');
      },
    });
  }

  loadVariants(): void {
    this.variantService.getAllVariants().subscribe({
      next: (variants) => {
        this.variants = variants;
        this.filteredVariants = variants;
        this.updateAvailableOptions();
        this.applyFilters();
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách biến thể:', error);
        alert('Tải danh sách biến thể thất bại!');
      },
    });
  }

  updateAvailableOptions(): void {
    const colors = new Set<string>();
    const sizes = new Set<string>();

    this.variants.forEach((variant) => {
      if (variant.color) colors.add(variant.color);
      if (variant.size) sizes.add(variant.size);
    });

    this.availableColors = Array.from(colors).sort();
    this.availableSizes = Array.from(sizes).sort();
  }

  onProductChange(): void {
    if (this.selectedProductId) {
      this.variantService
        .getVariantsByProductId(this.selectedProductId)
        .subscribe({
          next: (variants) => {
            this.filteredVariants = variants;
          },
          error: (error) => {
            console.error('Lỗi khi tải biến thể sản phẩm:', error);
            alert('Tải biến thể sản phẩm thất bại!');
          },
        });
    } else {
      this.loadVariants();
    }
  }

  applyFilters(): void {
    let filtered = [...this.variants];

    // Lọc theo sản phẩm
    if (this.selectedProductId) {
      filtered = filtered.filter(
        (v) => v.productId === this.selectedProductId
      );
    }

    // Lọc theo từ khóa tìm kiếm
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.color.toLowerCase().includes(searchLower) ||
          v.size.toLowerCase().includes(searchLower) ||
          v.product?.name.toLowerCase().includes(searchLower)
      );
    }

    // Lọc theo màu sắc
    if (this.selectedColor) {
      filtered = filtered.filter((v) => v.color === this.selectedColor);
    }

    // Lọc theo kích thước
    if (this.selectedSize) {
      filtered = filtered.filter((v) => v.size === this.selectedSize);
    }

    // Sắp xếp
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'id':
          return a.id - b.id;
        case 'product':
          return (a.product?.name || '').localeCompare(b.product?.name || '');
        case 'color':
          return a.color.localeCompare(b.color);
        case 'size':
          return a.size.localeCompare(b.size);
        case 'price':
          return a.price - b.price;
        case 'stock':
          return a.stockQuantity - b.stockQuantity;
        default:
          return 0;
      }
    });

    this.filteredVariants = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedProductId = null;
    this.selectedColor = '';
    this.selectedSize = '';
    this.sortBy = 'id';
    this.filteredVariants = [...this.variants];
    this.applyFilters();
  }

  toggleView(): void {
    this.viewMode = this.viewMode === 'grid' ? 'table' : 'grid';
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProductVariantCreateComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: { productId: this.selectedProductId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadVariants();
      }
    });
  }

  openEditDialog(variant: ProductVariant): void {
    const dialogRef = this.dialog.open(ProductVariantEditComponent, {
      width: '800px',
      maxHeight: '90vh',
      data: variant,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadVariants();
      }
    });
  }

  openDeleteDialog(variant: ProductVariant): void {
    const dialogRef = this.dialog.open(ProductVariantDeleteComponent, {
      width: '600px',
      data: variant,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadVariants();
      }
    });
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'text-danger';
    if (stock < 10) return 'text-warning';
    return 'text-success';
  }

  getStockIcon(stock: number): string {
    if (stock === 0) return 'fas fa-times-circle';
    if (stock < 10) return 'fas fa-exclamation-triangle';
    return 'fas fa-check-circle';
  }

  getInStockCount(): number {
    return this.variants.filter((v) => v.stockQuantity > 0).length;
  }

  getLowStockCount(): number {
    return this.variants.filter(
      (v) => v.stockQuantity > 0 && v.stockQuantity < 10
    ).length;
  }

  getOutOfStockCount(): number {
    return this.variants.filter((v) => v.stockQuantity === 0).length;
  }
}

import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../dto/product.dto';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProductAdminEditComponent } from '../product-admin-edit/product-admin-edit.component';
import { ProductAdminCreateComponent } from '../product-admin-create/product-admin-create.component';
import { ProductAdminDeleteComponent } from '../product-admin-delete/product-admin-delete.component';
import { FormsModule } from '@angular/forms';
import { Category } from '../../../dto/category.dto';
import { Brand } from '../../../dto/brand.dto';
import { CategoryService } from '../../../services/admin/category.service';
import { BrandService } from '../../../services/admin/brand.service';

@Component({
  selector: 'app-product-admin',
  imports: [CommonModule, RouterModule, MatDialogModule,FormsModule],
  templateUrl: './product-admin.component.html',
  styleUrls: ['./product-admin.component.scss']
})
export class ProductAdminComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  allProducts: Product[] = [];
  categories: Category[] = [];
  brands: Brand[] = [];
  currentPage = 1;
  totalPages = 1;
  pages: number[] = [];
  totalProducts = 0;

  // Search and filter properties
  searchTerm = '';
  selectedCategory = '';
  selectedBrand = '';
  sortBy = 'name';
  viewMode: 'grid' | 'table' = 'grid';
  
  // Base URL for images
  private baseImageUrl = 'https://localhost:7163';

  constructor(
    private productsService: ProductService,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getProducts(this.currentPage);
    this.loadCategories();
    this.loadBrands();
  }

  getProducts(page: number): void {
    const itemsPerPage = 10; // số sản phẩm mỗi trang
    this.productsService.getProducts(page, itemsPerPage).subscribe(response => {
      this.products = response.items;
      this.allProducts = response.items;
      this.filteredProducts = response.items;
      this.totalProducts = response.total;
      this.totalPages = Math.ceil(response.total / itemsPerPage);
      this.currentPage = page;
      // Tối ưu: chỉ tạo mảng pages cho visible pages (tối đa 10 trang)
      this.pages = this.getVisiblePages();
      this.applyFilters();
    });
  }

  // Tối ưu phân trang: chỉ hiển thị một số trang gần trang hiện tại
  getVisiblePages(): number[] {
    const maxVisible = 10; // Tối đa 10 trang hiển thị
    const total = this.totalPages;
    
    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisible / 2);
    let start = this.currentPage - half;
    let end = this.currentPage + half;

    if (start < 1) {
      start = 1;
      end = maxVisible;
    } else if (end > total) {
      end = total;
      start = total - maxVisible + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  goToPage(page: number): void {
    this.getProducts(page);
  }

  openEditDialog(product: Product): void {
    const dialogRef = this.dialog.open(ProductAdminEditComponent, {
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      maxHeight: '800px',
      data: { id: product.id },
      autoFocus: true,
      restoreFocus: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getProducts(this.currentPage);
      }
    });
  }
  openDeleteDialog(product: Product): void {
    const dialogRef = this.dialog.open(ProductAdminDeleteComponent, {
      width: '700px',
      data: { id: product.id, name: product.name }  // Truyền id và name
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getProducts(this.currentPage); // refresh danh sách sản phẩm sau khi xóa
      }
    });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(ProductAdminCreateComponent, {
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      maxHeight: '800px',
      data: {} 
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getProducts(this.currentPage); 
      }
    });
  }

  // Load categories and brands
  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  loadBrands(): void {
    this.brandService.getAllBrands().subscribe(brands => {
      this.brands = brands;
    });
  }

  // Search and filter methods
  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.products];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(product => 
        product.categoryId === parseInt(this.selectedCategory)
      );
    }

    // Apply brand filter
    if (this.selectedBrand) {
      filtered = filtered.filter(product => 
        product.brandId === parseInt(this.selectedBrand)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'id':
          return a.id - b.id;
        default:
          return 0;
      }
    });

    this.filteredProducts = filtered;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedBrand = '';
    this.sortBy = 'name';
    this.filteredProducts = [...this.products];
  }

  toggleView(): void {
    this.viewMode = this.viewMode === 'grid' ? 'table' : 'grid';
  }

  getCategoryName(categoryId: number | undefined): string {
    if (!categoryId) return 'N/A';
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'N/A';
  }

  getBrandName(brandId: number | undefined): string {
    if (!brandId) return 'N/A';
    const brand = this.brands.find(b => b.id === brandId);
    return brand ? brand.name : 'N/A';
  }

  // Get full image URL
  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return 'assets/img/placeholder.jpg';
    // Nếu đã là URL đầy đủ (http/https), trả về như cũ
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // Nếu bắt đầu bằng /, là relative URL, thêm base URL
    if (imageUrl.startsWith('/')) {
      return this.baseImageUrl + imageUrl;
    }
    // Nếu chỉ là tên file, thêm đường dẫn đầy đủ
    return `${this.baseImageUrl}/uploads/image/${imageUrl}`;
  }

}

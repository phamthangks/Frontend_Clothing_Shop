import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../dto/product.dto';
import { Category } from '../../dto/category.dto';
import { Brand } from '../../dto/brand.dto';
import { ImageSearchService, SearchResult } from '../../services/image-search/image-search.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];

  loadingImage = false;
  imageUploadProgress = 0;

  searchTerm = '';
  selectedMinPrice = 0;
  selectedMaxPrice = Infinity;
  selectedPriceLabel = 'Khoảng giá sản phẩm';

  selectedCategoryId: number | null = null;
  selectedBrandId: number | null = null;

  currentPage = 1;
  pageSize = 6;

  suggestedProducts: Product[] = [];
  showSuggestions = false;

  categories: Category[] = [];
  brands: Brand[] = [];

  previewUrl: string | null = null;

  maxVisiblePages = 18;

  totalProductsFromServer: number = 0;
  // cờ để tắt phân trang khi đang hiển thị kết quả tìm bằng ảnh
  isImageSearchActive = false;

  private baseImageUrl = 'https://localhost:7163';

  constructor(
    private productService: ProductService,
    private imgService: ImageSearchService,
  ) {}

  ngOnInit(): void {
    this.loadAllProducts();
    this.loadCategories();
    this.loadBrands();
  }

  // Clear preview và quay về chế độ list bình thường (server paging)
  clearPreview(): void {
    this.previewUrl = null;
    this.isImageSearchActive = false;
    this.imageUploadProgress = 0;
    this.loadingImage = false;
    this.loadAllProducts();
  }

  private loadCategories(): void {
    this.productService.getCategories().subscribe((data: Category[]) => {
      this.categories = data;
    });
  }

  private loadBrands(): void {
    this.productService.getBrands().subscribe((data: Brand[]) => {
      this.brands = data;
    });
  }

  private loadAllProducts(): void {
    this.loadProducts(this.currentPage);
  }

  private loadProducts(page: number): void {
    this.productService.getProducts(page, this.pageSize).subscribe((response) => {
      this.products = response.items;
      this.totalProductsFromServer = response.total;
      this.currentPage = page;

      // Khi load từ server, tắt chế độ image-search
      this.isImageSearchActive = false;

      const hasFilter = !!(
        this.searchTerm ||
        this.selectedCategoryId ||
        this.selectedBrandId ||
        this.selectedMinPrice > 0 ||
        this.selectedMaxPrice < Infinity
      );

      if (!hasFilter) {
        this.filteredProducts = this.products.slice();
      } else {
        this.applyFilters(false);
      }
    }, err => {
      console.error('Error loading products', err);
    });
  }

  applyFilters(resetPage = true): void {
    this.filteredProducts = this.products.filter((p) => {
      const matchName =
        !this.searchTerm ||
        p.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchPrice =
        p.price >= this.selectedMinPrice &&
        p.price <= this.selectedMaxPrice;
      const matchCategory = this.selectedCategoryId
        ? p.categoryId === this.selectedCategoryId
        : true;
      const matchBrand = this.selectedBrandId ? p.brandId === this.selectedBrandId : true;

      return matchName && matchPrice && matchCategory && matchBrand;
    });

    if (resetPage) this.currentPage = 1;
  }

  searchByName(event?: Event): void {
    if (event) event.preventDefault();

    this.searchTerm = this.searchTerm.trim();
    this.applyFilters();
    this.showSuggestions = false;
  }

  onSearchInputChange(): void {
    if (!this.searchTerm.trim()) {
      this.suggestedProducts = [];
      this.showSuggestions = false;
    } else {
      this.productService.getProductsByName(this.searchTerm).subscribe((data) => {
        this.suggestedProducts = data.slice(0, 20);
        this.showSuggestions = this.suggestedProducts.length > 0;
      }, err => {
        console.error('Error fetching suggestions', err);
      });
    }
  }

  // Khi người dùng upload ảnh để tìm kiếm
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    // Preview ngay
    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result as string);
    reader.readAsDataURL(file);

    // Bật chế độ image-search -> ẩn phân trang
    this.isImageSearchActive = true;
    this.loadingImage = true;
    this.imageUploadProgress = 0;

    // Gọi API tìm kiếm ảnh (1 request duy nhất cho cả progress và results)
    this.imgService.searchByImage(file).subscribe({
      next: (res) => {
        this.imageUploadProgress = res.progress;
        if (res.results) {
          const mapped: Product[] = res.results.map((r) => ({
            id: r.id!,
            name: r.name!,
            price: r.price!,
            image: r.image,
            description: r.description!,
            categoryId: 0,
            brandId: 0,
          }));

          // Gán kết quả image-search. Không gọi loadProducts server-side.
          this.products = mapped;
          this.filteredProducts = mapped.slice();
          this.currentPage = 1;
          this.loadingImage = false;
          this.imageUploadProgress = 0;
          // isImageSearchActive giữ true để template có thể ẩn pagination
        }
      },
      error: (err) => {
        console.error('Error fetching image-search results', err);
        this.loadingImage = false;
        this.imageUploadProgress = 0;
        this.isImageSearchActive = false;
      }
    });
  }

  selectSuggestion(name: string): void {
    this.searchTerm = name;
    this.showSuggestions = false;
    this.applyFilters();
  }

  setPriceRange(min: number, max: number, label: string): void {
    this.selectedMinPrice = min;
    this.selectedMaxPrice = max;
    this.selectedPriceLabel = label;
    this.applyFilters();
  }

  filterByCategory(catId: number): void {
    this.selectedCategoryId = this.selectedCategoryId === catId ? null : catId;
    this.applyFilters();
  }

  filterByBrand(brandId: number): void {
    this.selectedBrandId = this.selectedBrandId === brandId ? null : brandId;
    this.applyFilters();
  }

  get totalPages(): number {
    const hasFilter = !!(
      this.searchTerm ||
      this.selectedCategoryId ||
      this.selectedBrandId ||
      this.selectedMinPrice > 0 ||
      this.selectedMaxPrice < Infinity
    );

    if (hasFilter) {
      return Math.max(1, Math.ceil(this.filteredProducts.length / this.pageSize));
    }

    return Math.max(1, Math.ceil(this.totalProductsFromServer / this.pageSize));
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    const max = Math.max(5, this.maxVisiblePages);

    if (total <= max) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const half = Math.floor(max / 2);
    let start = this.currentPage - half;
    let end = this.currentPage + half;

    if (start < 1) {
      start = 1;
      end = max;
    } else if (end > total) {
      end = total;
      start = total - max + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  pageChanged(page: number): void {
    if (page < 1 || page > this.totalPages) return;

    const hasFilter = !!(
      this.searchTerm ||
      this.selectedCategoryId ||
      this.selectedBrandId ||
      this.selectedMinPrice > 0 ||
      this.selectedMaxPrice < Infinity
    );

    if (hasFilter) {
      this.currentPage = page;
    } else {
      this.loadProducts(page);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get paginatedProducts(): Product[] {
    const hasFilter = !!(
      this.searchTerm ||
      this.selectedCategoryId ||
      this.selectedBrandId ||
      this.selectedMinPrice > 0 ||
      this.selectedMaxPrice < Infinity
    );

    if (hasFilter) {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      return this.filteredProducts.slice(startIndex, startIndex + this.pageSize);
    }

    return this.products || [];
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return 'assets/img/placeholder.jpg';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    if (imageUrl.startsWith('/')) {
      return this.baseImageUrl + imageUrl;
    }
    return `${this.baseImageUrl}/uploads/image/${imageUrl}`;
  }
}

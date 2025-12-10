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
  isImageSearchActive = false;

  private baseImageUrl = 'https://localhost:7163';

  constructor(
    private productService: ProductService,
    private imgService: ImageSearchService,
  ) {}

  ngOnInit(): void {
    // Tải danh sách lần đầu
    this.loadProducts(1);
    this.loadCategories();
    this.loadBrands();
  }

  // Clear preview -> Quay về chế độ load từ Server
  clearPreview(): void {
    this.previewUrl = null;
    this.isImageSearchActive = false;
    this.imageUploadProgress = 0;
    this.loadingImage = false;
    this.loadProducts(1); // Reset về trang 1 server
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

  // Hàm quan trọng nhất: Gọi API với đầy đủ tham số lọc
  private loadProducts(page: number): void {
    // Xử lý giá trị Infinity trước khi gửi
    const maxPriceToSend = this.selectedMaxPrice === Infinity ? undefined : this.selectedMaxPrice;

    this.productService.getProducts(
      page,
      this.pageSize,
      this.searchTerm,       
      this.selectedCategoryId, 
      this.selectedBrandId,  
      this.selectedMinPrice,   
      maxPriceToSend           
    ).subscribe((response) => {
      this.products = response.items;
      this.totalProductsFromServer = response.total;
      this.currentPage = page;
      this.isImageSearchActive = false;
      
      this.filteredProducts = this.products;
    }, err => {
      console.error('Error loading products', err);
    });
  }

  // --- CÁC HÀM SỰ KIỆN (Sửa lại để gọi loadProducts) ---

  searchByName(event?: Event): void {
    if (event) event.preventDefault();
    this.searchTerm = this.searchTerm.trim();
    this.showSuggestions = false;
    // Gọi lại API trang 1 với từ khóa mới
    this.loadProducts(1);
  }

  filterByCategory(catId: number): void {
    this.selectedCategoryId = this.selectedCategoryId === catId ? null : catId;
    // Gọi lại API trang 1 với danh mục mới
    this.loadProducts(1);
  }

  filterByBrand(brandId: number): void {
    this.selectedBrandId = this.selectedBrandId === brandId ? null : brandId;
    // Gọi lại API trang 1
    this.loadProducts(1);
  }

  setPriceRange(min: number, max: number, label: string): void {
    this.selectedMinPrice = min;
    this.selectedMaxPrice = max;
    this.selectedPriceLabel = label;
    // Gọi lại API trang 1
    this.loadProducts(1);
  }

  pageChanged(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    
    // Nếu đang tìm bằng ảnh thì xử lý riêng (vì ảnh không phân trang server)
    if (this.isImageSearchActive) {
        this.currentPage = page;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    // Còn bình thường thì gọi Server
    this.loadProducts(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- CÁC HÀM BỔ TRỢ ---

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

  selectSuggestion(name: string): void {
    this.searchTerm = name;
    this.showSuggestions = false;
    this.loadProducts(1); // Chọn gợi ý -> Tìm ngay
  }

  // Upload ảnh (Giữ nguyên logic cũ)
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result as string);
    reader.readAsDataURL(file);

    this.isImageSearchActive = true;
    this.loadingImage = true;
    this.imageUploadProgress = 0;

    this.imgService.searchByImageWithProgress(file).subscribe({
      next: (percent) => {
        this.imageUploadProgress = percent;
        if (percent === 100) {
          this.imgService.searchByImage(file).subscribe({
            next: (results: SearchResult[]) => {
              const mapped: Product[] = results.map((r) => ({
                id: r.id!,
                name: r.name!,
                price: r.price!,
                image: r.image,
                description: r.description!,
                categoryId: 0,
                brandId: 0,
              }));
              this.products = mapped;
              this.filteredProducts = mapped; // Image search thì client pagination tạm
              this.currentPage = 1;
              this.loadingImage = false;
            },
            error: (err) => {
              console.error(err);
              this.loadingImage = false;
            },
          });
        }
      },
      error: (err) => {
        console.error(err);
        this.loadingImage = false;
      }
    });
  }

  // --- GETTERS ---

  get totalPages(): number {
    // Nếu đang tìm bằng ảnh, tính theo số lượng mảng client
    if (this.isImageSearchActive) {
        return Math.max(1, Math.ceil(this.filteredProducts.length / this.pageSize));
    }
    // Bình thường tính theo tổng số server trả về
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

  // Getter này để hỗ trợ HTML cũ, nhưng logic đã thay đổi
  get paginatedProducts(): Product[] {
    // Nếu tìm bằng ảnh -> Cắt mảng ở Client
    if (this.isImageSearchActive) {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        return this.filteredProducts.slice(startIndex, startIndex + this.pageSize);
    }
    // Nếu lấy từ Server -> Trả về nguyên mảng (vì Server đã cắt sẵn 6 cái rồi)
    return this.products;
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
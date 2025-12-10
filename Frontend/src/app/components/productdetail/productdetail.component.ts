import { Component, OnInit } from '@angular/core';
import { Product } from '../../dto/product.dto';
import { ProductImage } from '../../dto/productImage.dto';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { ProductVariantService } from '../../services/productvariant.service';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService, Review } from '../../services/account.service';

@Component({
  selector: 'app-productdetail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './productdetail.component.html',
  styleUrls: ['./productdetail.component.scss'],
})
export class ProductdetailComponent implements OnInit {
  product!: Product;
  productImages: ProductImage[] = [];
  quantity: number = 1;
  reviews: Review[] = [];
  sizes: string[] = [];
  colors: string[] = [];
  selectedSize: string | null = null;
  selectedColor: string | null = null;
  productVariants: any[] = [];
  stockQuantity: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private accountService: AccountService,
    private cartService: CartService,
    private router: Router,
    private productVariantService: ProductVariantService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProductDetail(+id).subscribe((data) => {
        this.product = data.product;
        this.productImages = data.anhSps;

        this.productVariantService.getVariantsByProduct(+id).subscribe((variants) => {
          if (Array.isArray(variants) && variants.length) {
            const sizeSet = new Set<string>();
            const colorSet = new Set<string>();

            variants.forEach((v) => {
              if (v.size) sizeSet.add(v.size);
              if (v.color) colorSet.add(v.color);
            });

            this.sizes = [...sizeSet];
            this.colors = [...colorSet];

            this.productVariants = variants;
            this.selectedSize = this.sizes[0] ?? null;
            this.selectedColor = this.colors[0] ?? null;

            this.updateStockQuantity();
          }
        });
      });
      
      // Lấy danh sách review của sản phẩm
      this.loadReviews(+id);
    }
  }

  loadReviews(productId: number): void {
    this.accountService.getReviewsByProduct(productId).subscribe({
      next: (data) => {
        this.reviews = data;
      },
      error: (err) => {
        console.error('Lỗi khi lấy đánh giá:', err);
      },
    });
  }

  onVideoPlay(event: Event): void {
    const playingVideo = event.target as HTMLVideoElement;
    const reviewVideos = document.querySelectorAll(
      '.review-video'
    ) as NodeListOf<HTMLVideoElement>;
    reviewVideos.forEach((video) => {
      if (video !== playingVideo) {
        video.pause();
      }
    });
  }

  onMinus(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  onPlus(): void {
    if (this.stockQuantity === null || this.quantity < this.stockQuantity) {
      this.quantity++;
    } else {
      // alert(`Không thể thêm. Chỉ còn ${this.stockQuantity} sản phẩm trong kho.`);
    }
  }

  // NEW: Handle manual quantity input
  onQuantityInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);
    
    // Validate the input
    if (isNaN(value) || value < 1) {
      value = 1;
    }
    
    // Limit to stock quantity if available
    if (this.stockQuantity !== null && value > this.stockQuantity) {
      value = this.stockQuantity;
      // alert(`Số lượng tối đa là ${this.stockQuantity} sản phẩm.`);
    }
    
    this.quantity = value;
  }

  onSelectSize(size: string | null) {
    this.selectedSize = size;
    this.updateStockQuantity();
    this.adjustQuantityToStock(); // Adjust quantity when stock changes
  }

  onSelectColor(color: string | null) {
    this.selectedColor = color;
    this.updateStockQuantity();
    this.adjustQuantityToStock(); // Adjust quantity when stock changes
  }

  // NEW: Adjust quantity when stock changes
  adjustQuantityToStock(): void {
    if (this.stockQuantity !== null && this.quantity > this.stockQuantity) {
      this.quantity = this.stockQuantity;
    }
  }

  updateStockQuantity() {
    if (!this.selectedSize || !this.selectedColor) {
      this.stockQuantity = null;
      return;
    }
    const variant = this.productVariants.find(
      (v) =>
        v.size?.toLowerCase() === this.selectedSize?.toLowerCase() &&
        v.color?.toLowerCase() === this.selectedColor?.toLowerCase()
    );

    this.stockQuantity = variant ? variant.stockQuantity ?? variant.StockQuantity : 0;
  }

  addToCart(): void {
    // Check if both size and color are selected
    if (!this.selectedSize || !this.selectedColor) {
      alert('Vui lòng chọn cả size và màu sắc cho sản phẩm.');
      return;
    }

    if (this.stockQuantity !== null && this.quantity > this.stockQuantity) {
      alert(`Không thể thêm vào giỏ hàng. Chỉ còn ${this.stockQuantity} sản phẩm trong kho.`);
      return;
    }

    if (this.stockQuantity === 0) {
      alert('Sản phẩm đã hết hàng.');
      return;
    }

    // Find the product variant
    const foundVariant = this.productVariants.find(v =>
      (v.size ?? v.Size)?.toString().toLowerCase() === this.selectedSize?.toString().toLowerCase() &&
      (v.color ?? v.Color)?.toString().toLowerCase() === this.selectedColor?.toString().toLowerCase()
    );

    if (!foundVariant) {
      alert('Không tìm thấy phiên bản sản phẩm với size và màu sắc đã chọn.');
      return;
    }

    const productVariantId = foundVariant.id ?? foundVariant.Id;

    // Gọi API thêm vào giỏ hàng
    this.cartService
      .addCart(this.product.id, this.quantity, this.selectedColor, this.product.price, productVariantId)
      .subscribe({
        next: (res) => {
          alert('Thêm vào giỏ hàng thành công!');
        },
        error: (err) => {
          console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', err);
          if (err.error?.message) {
            alert(err.error.message);
          } else {
            alert('Thêm vào giỏ hàng thất bại. Vui lòng kiểm tra địa chỉ giao hàng mặc định.');
          }
        },
      });
  }

  buyNow(): void {
    // Check if both size and color are selected
    if (!this.selectedSize || !this.selectedColor) {
      alert('Vui lòng chọn cả size và màu sắc cho sản phẩm.');
      return;
    }

    if (this.stockQuantity !== null && this.quantity > this.stockQuantity) {
      alert(`Không thể mua ngay. Chỉ còn ${this.stockQuantity} sản phẩm trong kho.`);
      return;
    }

    if (this.stockQuantity === 0) {
      alert('Sản phẩm đã hết hàng.');
      return;
    }

    // Find the product variant
    const foundVariant = this.productVariants.find(v =>
      (v.size ?? v.Size)?.toString().toLowerCase() === this.selectedSize?.toString().toLowerCase() &&
      (v.color ?? v.Color)?.toString().toLowerCase() === this.selectedColor?.toString().toLowerCase()
    );

    if (!foundVariant) {
      alert('Không tìm thấy phiên bản sản phẩm với size và màu sắc đã chọn.');
      return;
    }

    const productVariantId = foundVariant.id ?? foundVariant.Id;

    // Gọi API mua ngay
    this.cartService
      .buyNow(this.product.id, this.quantity, this.selectedColor, this.product.price, productVariantId)
      .subscribe({
        next: (res) => {
          console.log('Response from buyNow:', res.orderId);
          this.router.navigate(['/checkoutbuynow', res.orderId], {
            replaceUrl: true,
          });
        },
        error: (err) => {
          console.error('Lỗi khi xử lý mua ngay:', err);
          if (err.error?.message) {
            alert(err.error.message);
          } else {
            alert('Xử lý mua ngay thất bại');
          }
        },
      });
  }

  // Base URL for images
  private baseImageUrl = 'https://localhost:7163';

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


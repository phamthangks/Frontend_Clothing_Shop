import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartItem } from '../../dto/Cart/cartItems.dto';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  selectedItems: number[] = [];
  subTotal: number = 0;
  grandTotal: number = 1000; // Phí vận chuyển cố định là $1

  constructor(
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadCart();
    // Load các sản phẩm đã được chọn từ sessionStorage (nếu có)
    const saved = sessionStorage.getItem('selectedItems');
    if (saved) {
      this.selectedItems = JSON.parse(saved);
    }
    this.updateCartSummary();
  }

  loadCart(): void {
    this.cartService.getCartProducts().subscribe({
      next: (data) => {
        this.cartItems = data;
        this.updateCartSummary();
      },
      error: (err) => {
        console.error('Lỗi khi lấy dữ liệu giỏ hàng:', err);
      },
    });
  }

  // Kiểm tra xem sản phẩm có được chọn hay không
  isSelected(itemId: number): boolean {
    return this.selectedItems.includes(itemId);
  }

  // Xử lý khi checkbox từng sản phẩm thay đổi trạng thái
  toggleSelection(itemId: number, checked: boolean): void {
    if (checked) {
      if (!this.selectedItems.includes(itemId)) {
        this.selectedItems.push(itemId);
      }
    } else {
      this.selectedItems = this.selectedItems.filter((id) => id !== itemId);
    }
    sessionStorage.setItem('selectedItems', JSON.stringify(this.selectedItems));
    this.updateCartSummary();
  }

  // Kiểm tra xem tất cả sản phẩm đã được chọn hay chưa
  isAllSelected(): boolean {
    return (
      this.cartItems.length > 0 &&
      this.cartItems.every((item) => this.selectedItems.includes(item.id))
    );
  }

  // Xử lý chọn hoặc bỏ chọn tất cả sản phẩm
  toggleSelectAll(selectAll: boolean): void {
    if (selectAll) {
      // Chọn tất cả: lấy id của tất cả sản phẩm trong giỏ hàng
      this.selectedItems = this.cartItems.map((item) => item.id);
    } else {
      // Bỏ chọn tất cả
      this.selectedItems = [];
    }
    sessionStorage.setItem('selectedItems', JSON.stringify(this.selectedItems));
    this.updateCartSummary();
  }

  // Tính lại sub-total và grand total dựa trên các sản phẩm được chọn
  updateCartSummary(): void {
    let subTotal = 0;
    for (const item of this.cartItems) {
      if (this.selectedItems.includes(item.id)) {
        subTotal += item.price * item.numberOfProducts;
      }
    }
    this.subTotal = subTotal;
    this.grandTotal = subTotal + 1000; // Cộng thêm phí vận chuyển cố định
  }

  // Cập nhật số lượng của sản phẩm trong giỏ hàng
  updateCart(itemId: number, action: 'increase' | 'decrease'): void {
    this.cartService.updateCart(itemId, action).subscribe({
      next: (response) => {
        const item = this.cartItems.find((i) => i.id === itemId);
        if (item) {
          // Giả sử API trả về số lượng sản phẩm cập nhật.
          item.numberOfProducts = response.numberOfProducts;
        }
        this.updateCartSummary();
      },
      error: (error) => {
        console.error('Đã xảy ra lỗi:', error);
      },
    });
  }

  // Xóa sản phẩm khỏi giỏ hàng
  deleteItem(itemId: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      this.cartService.deleteItem(itemId).subscribe({
        next: () => {
          this.cartItems = this.cartItems.filter((item) => item.id !== itemId);
          this.selectedItems = this.selectedItems.filter((id) => id !== itemId);
          sessionStorage.setItem(
            'selectedItems',
            JSON.stringify(this.selectedItems)
          );
          this.updateCartSummary();
        },
        error: (error) => {
          console.error('Đã xảy ra lỗi:', error);
        },
      });
    }
  }

  // Tiến hành thanh toán với các sản phẩm được chọn
  proceedToCheckout(): void {
    if (this.selectedItems.length === 0) {
      alert('Vui lòng chọn ít nhất một sản phẩm trước khi tiếp tục!');
      return;
    }

    // Giả sử rằng orderId được lưu trong một trong các sản phẩm trong giỏ hàng (nếu có)
    const orderId =
      this.cartItems.length > 0 ? this.cartItems[0].orderId : null;
    if (orderId) {
      this.router.navigate(['/checkout', orderId], { replaceUrl: true });
    } else {
      alert('Không có orderId hợp lệ để chuyển sang trang thanh toán.');
    }
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

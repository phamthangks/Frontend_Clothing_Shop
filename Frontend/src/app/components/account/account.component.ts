import { Component } from '@angular/core';
import {
  Account,
  AccountService,
  ReviewRequest,
} from '../../services/account.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { AddressComponent } from '../address/address.component';
import { MatDialog } from '@angular/material/dialog';
import { AddressDialogComponent } from '../address-dialog/address-dialog.component';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { ReviewDialogComponent } from '../review-dialog/review-dialog.component';
import { PaymentService, RefundRequest } from '../../services/payment.service';

@Component({
  selector: 'app-account',
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    AddressComponent,
    // MatTableModule,
    // MatButtonModule,
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent {
  accounts: Account[] = [];
  groupedOrders: any[] = [];
  selectedTab: 'orders' | 'address' | 'account' = 'orders';

  // Fields for updating account details
  fullname: string = '';
  phoneNumber: string = '';
  userId: any;

  // Fields for changing password
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  // Danh sách trạng thái đơn hàng (bạn có thể điều chỉnh theo yêu cầu)
  statuses: string[] = [
    // 'all',
    'processing',
    'addressChanged',
    'shipped',
    'delivered',
    'completed',
    'cancelled',
    // 'returned',
  ];

  statusLabels: { [key: string]: string } = {
    processing: 'Đang xử lý',
    addressChanged: 'Đã đổi địa chỉ',
    shipped: 'Đang vận chuyển',
    delivered: 'Đã giao hàng',
    completed: 'Hoàn tất',
    cancelled: 'Đã hủy',
    // returned: 'Đã trả hàng' // nếu cần
  };

  // // Trạng thái được chọn, mặc định là 'all' để hiển thị tất cả
  selectedStatus: string = 'processing';
  // Map lưu trạng thái review của các sản phẩm: key là productId, value là boolean
  reviewedMap: { [productId: number]: boolean } = {};
  constructor(
    private accountService: AccountService,
    private tokenService: TokenService,
    private dialog: MatDialog,
    private paymentService: PaymentService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fetchAccount();
  }
  changeOrderAddress(order: Account): void {
    console.log('Order object:', order);
    console.log('Order ID clicked:', order.orderId);
    const dialogRef = this.dialog.open(AddressDialogComponent, {
      width: '500px',
      data: { phoneNumber: order.phoneNumber },
    });

    dialogRef.afterClosed().subscribe((selectedAddress) => {
      if (selectedAddress) {
        console.log('Selected address:', selectedAddress);
        const payload = {
          OrderId: order.orderId,
          ShippingAddressId: selectedAddress.id,
        };

        this.accountService.changeOrderAddress(payload).subscribe({
          next: (response) => {
            if (response.success) {
              alert('Đổi địa chỉ giao hàng thành công.');
              this.fetchAccount();
            } else {
              alert(
                response.message || 'Đổi địa chỉ giao hàng thất bại.'
              );
            }
          },
          error: (error) => {
            console.error('Error updating shipping address:', error);
            alert('Đã xảy ra lỗi khi đổi địa chỉ giao hàng.');
          },
        });
      }
    });
  }
  cancelOrder(order: Account): void {
    if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
      // Nếu đơn hàng thanh toán bằng PayPal và có captureId (đã lưu từ lúc capture thanh toán)
      if (order.paymentMethod === 'Paypal' && order.captureId) {
        // Tạo đối tượng refund request
        const refundRequest: RefundRequest = {
          captureId: order.captureId,
          amount: Math.floor((order.totalMoney ?? 0) / 25000), // Chuyển từ VND sang USD
          currency: 'USD', // Hoặc mã tiền tệ khác nếu cần
        };
        // Gọi API hoàn tiền qua PaymentService
        this.paymentService.refundPayment(refundRequest).subscribe({
          next: (refundResponse) => {
            alert('Hoàn tiền thành công.');
            // Sau khi hoàn tiền thành công, gọi API hủy đơn hàng trong hệ thống
            this.accountService
              .cancelOrder({ orderId: order.orderId })
              .subscribe({
                next: (response) => {
                  if (response.success) {
                    alert('Đơn hàng đã được hủy thành công.');
                    this.fetchAccount();
                  } else {
                    alert(response.message || 'Không thể hủy đơn hàng.');
                  }
                },
                error: (error) => {
                  console.error('Lỗi khi hủy đơn hàng:', error);
                  alert('Đã xảy ra lỗi khi hủy đơn hàng.');
                },
              });
          },
          error: (error) => {
            console.error('Lỗi khi hoàn tiền:', error);
            alert('Đã xảy ra lỗi khi hoàn tiền.');
          },
        });
      } else {
        // Nếu không phải đơn Paypal hoặc không có captureId, chỉ gọi API hủy đơn hàng thông thường
        this.accountService.cancelOrder({ orderId: order.orderId }).subscribe({
          next: (response) => {
            if (response.success) {
              alert('Đơn hàng đã được hủy thành công.');
              this.fetchAccount();
            } else {
              alert(response.message || 'Không thể hủy đơn hàng.');
            }
          },
          error: (error) => {
            console.error('Lỗi khi hủy đơn hàng:', error);
            alert('Đã xảy ra lỗi khi hủy đơn hàng.');
          },
        });
      }
    }
  }

  // Getter trả về danh sách đơn hàng đã được lọc theo trạng thái
  get filteredOrders(): any[] {
    // if (this.selectedStatus === 'all') {
    //   return this.groupedOrders;
    // }
    return this.groupedOrders.filter(
      (order) => order.status === this.selectedStatus
    );
  }
  countOrdersByStatus(status: string): number {
    if (!this.groupedOrders) {
      return 0;
    }
    if (status === 'all') {
      return this.groupedOrders.length;
    }
    return this.groupedOrders.filter((order) => order.status === status).length;
  }

  // fetchAccount(): void {
  //   this.accountService.getMyAccount().subscribe({
  //     next: (response) => {
  //       if (response.success) {
  //         this.accounts = response.data;
  //         // If the data contains account details rather than order details, prefill the inputs.
  //         if (this.accounts.length > 0) {
  //           this.fullname = this.accounts[0].fullname;
  //           this.phoneNumber = this.accounts[0].phoneNumber;
  //         }
  //       } else {
  //         alert(response.message || 'Failed to load account data');
  //       }
  //     },
  //     error: () => alert('Error fetching account data'),
  //   });
  // }
  fetchAccount(): void {
  this.accountService.getMyAccount().subscribe({
    next: (response) => {
      if (response.success) {
        this.accounts = response.data;
        
        // DEBUG: Log the actual data structure
        console.log('=== ACCOUNT DATA DEBUG ===');
        console.log('Raw account data:', this.accounts);
        if (this.accounts.length > 0) {
          console.log('First order product structure:', this.accounts[0]);
          console.log('Available properties:', Object.keys(this.accounts[0]));
        }
        console.log('=== END DEBUG ===');
        
        // Nhóm các order có cùng orderId thành groupedOrders
        this.groupOrders();
        this.checkReviewedForProducts();
        // Nếu dữ liệu chứa thông tin account, prefill input
        if (this.accounts.length > 0) {
          this.fullname = this.accounts[0].fullname;
          this.phoneNumber = this.accounts[0].phoneNumber;
          this.userId = this.accounts[0].id;
        }
      } else {
        alert(response.message || 'Lỗi khi tải dữ liệu tài khoản');
      }
    },
    error: () => alert('Lỗi khi lấy dữ liệu tài khoản'),
  });
}

  reviewProduct(product: any): void {
    const dialogRef = this.dialog.open(ReviewDialogComponent, {
      width: '1000px',
      data: { product: product }, // truyền dữ liệu sản phẩm vào dialog
    });

    dialogRef.afterClosed().subscribe((reviewData) => {
      if (reviewData) {
        // Sau khi người dùng submit, reviewData chứa thông tin đánh giá
        // Gọi API từ service để lưu review
        console.log('Review submitted:', reviewData);
        // Ví dụ: this.accountService.submitReview(reviewData).subscribe(...);
      }
    });
  }
  // Hàm gọi API kiểm tra trạng thái review cho mỗi sản phẩm trong các đơn hàng
  checkReviewedForProducts(): void {
    this.groupedOrders.forEach((order) => {
      order.products.forEach((product: any) => {
        this.accountService.hasReviewed(product.productId).subscribe({
          next: (result) => {
            this.reviewedMap[product.productId] = result.reviewed;
          },
          error: (error) => {
            console.error(
              `Error checking review for product ${product.productId}:`,
              error
            );
            this.reviewedMap[product.productId] = false;
          },
        });
      });
    });
  }
  editReview(product: any): void {
    // Gọi API lấy danh sách review của sản phẩm
    this.accountService.getReviewsByProduct(product.productId).subscribe({
      next: (reviews) => {
        // Tìm review của người dùng hiện tại theo userId
        const myReview = reviews.find((r: any) => r.userId === this.userId);
        if (myReview) {
          const dialogRef = this.dialog.open(ReviewDialogComponent, {
            width: '1000px',
            data: { product: product, review: myReview },
          });

          dialogRef.afterClosed().subscribe((updatedReviewData: any) => {
            if (updatedReviewData) {
              // Gọi API cập nhật review (updateReview endpoint sẽ được gọi trong dialog nếu đang ở chế độ edit)
              // Sau khi dialog đóng, bạn có thể thực hiện refresh dữ liệu nếu cần
            }
          });
        } else {
          alert('Không tìm thấy review của bạn cho sản phẩm này.');
        }
      },
      error: (error) => {
        console.error('Error fetching reviews for product:', error);
        alert('Đã xảy ra lỗi khi lấy đánh giá cho sản phẩm này.');
      },
    });
  }

  groupOrders(): void {
    const grouped: { [key: number]: any } = this.accounts.reduce(
      (acc: { [key: number]: any }, order) => {
        const productTotal = (order.price || 0) * (order.numberOfProducts || 0);
        if (!acc[order.orderId]) {
          // Khởi tạo đối tượng cho order, thêm mảng products, thuộc tính expanded và tính totalMoney ban đầu
          acc[order.orderId] = {
            ...order,
            products: [order],
            expanded: false,
            totalMoney: productTotal,
          };
        } else {
          // Nếu order đã tồn tại, thêm sản phẩm và cập nhật tổng số tiền
          acc[order.orderId].products.push(order);
          acc[order.orderId].totalMoney += productTotal;
        }
        return acc;
      },
      {}
    );

    // Chuyển object thành mảng và sắp xếp theo orderId từ lớn đến nhỏ
    this.groupedOrders = Object.values(grouped).sort(
      (a, b) => b.orderId - a.orderId
    );
  }

  setTab(tab: 'orders' | 'address' | 'account'): void {
    this.selectedTab = tab;
  }

  logout(): void {
    if (confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
      this.accountService.logout().subscribe({
        next: (response: any) => {
          // Xử lý phản hồi thành công từ server
          console.log('Logout successful', response);
          this.tokenService.removeToken();
          // Xóa selectedItems khỏi session
          sessionStorage.removeItem('selectedItems');
          this.router.navigate(['/home']);
        },
        error: (error: any) => {
          console.error('Logout error', error);
          // Xử lý lỗi nếu cần, sau đó thực hiện logout cục bộ
          this.tokenService.removeToken();
          // Xóa selectedItems khỏi session
          sessionStorage.removeItem('selectedItems');
          this.router.navigate(['/home']);
        },
      });
    }
  }

  updateAccount(): void {
    if (!this.validateInputs(this.fullname, this.phoneNumber)) {
      return;
    }
    this.accountService
      .updateAccount({ fullname: this.fullname, phoneNumber: this.phoneNumber })
      .subscribe({
        next: (response) => {
          if (response.success) {
            alert('Cập nhật thông tin tài khoản thành công');
            this.fetchAccount();
          } else {
            if (response.message === 'Account details updated successfully') {
              alert('Cập nhật thông tin tài khoản thành công');
            } else {
              alert(response.message || 'Cập nhật thông tin tài khoản thất bại');
            }
            console.log(response.message);
          }
        },
        error: () => alert('Cập nhật thông tin tài khoản thất bại'),
      });
  }

  changePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      alert('Mật khẩu mới và mật khẩu nhập lại không khớp');
      return;
    }
    if (!this.newPassword || !this.confirmPassword) {
      alert('Mật khẩu mới và mật khẩu nhập lại không được để trống');
      return;
    }
    this.accountService
      .changePassword({
        oldPassword: this.currentPassword,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            alert('Đổi mật khẩu thành công');
            window.location.href = '/Home/Home';
          } else {
            alert(response.message || 'Đổi mật khẩu thất bại');
          }
        },
        error: () => alert('Đổi mật khẩu thất bại'),
      });
  }

  validateInputs(fullname: string, phoneNumber: string): boolean {
    const phoneNumberRegex = /^\d{10,11}$/;
    if (!phoneNumber || !phoneNumberRegex.test(phoneNumber)) {
      alert(
        'Số điện thoại phải có từ 10 đến 11 chữ số và chỉ chứa ký tự số.'
      );
      return false;
    }
    return true;
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

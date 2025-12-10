import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  ActivatedRoute,
  ParamMap,
  Router,
  RouterModule,
} from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  Checkout,
  CheckoutRequest,
  CheckoutService,
} from '../../services/checkout.service';
import {
  PaymentService,
  PaymentRequest,
  PaymentResponse,
} from '../../services/payment.service';
import { MatDialog } from '@angular/material/dialog';
import { AddressDialogComponent } from '../address-dialog/address-dialog.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  totalPrice: number = 0;
  shippingCost: number = 1;
  grandTotal: number = 0;
  checkoutItems: Checkout[] = [];
  orderId: number = 0; // Thuộc tính lưu orderId
  isLoading = false;
  // Danh sách phương thức thanh toán
  paymentMethods = [
    { id: 'Paypal', label: 'Paypal' },
    { id: 'Direct Bank Transfer', label: 'Direct Bank Transfer' },
    { id: 'Cash on Delivery', label: 'Cash on Delivery' },
  ];

  constructor(
    private fb: FormBuilder,
    private checkoutService: CheckoutService,
    private router: Router,
    private paymentService: PaymentService,
    private dialog: MatDialog,
    private route: ActivatedRoute // Để lấy tham số từ URL
  ) {
    this.checkoutForm = this.fb.group({
      fullname: ['', Validators.required],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{10,11}$')],
      ],
      address: ['', Validators.required],
      paymentMethod: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    // Lấy orderId từ route parameter (nếu có)
  this.route.paramMap.subscribe((params: ParamMap) => {
    const orderId = Number(params.get('orderId'));
    if (orderId) {
      this.orderId = orderId;
      // Gọi API checkout để lấy danh sách sản phẩm trong đơn hàng
      const storedSelectedItems = sessionStorage.getItem('selectedItems');
      const selectedItems: number[] = storedSelectedItems
        ? JSON.parse(storedSelectedItems)
        : [];
      const request: CheckoutRequest = {
        orderId: orderId,
        selectedItems,
      };
      this.checkoutService.getCheckoutItems(request).subscribe({
        next: (response) => {
          this.orderId = response.orderId;
          this.checkoutItems = response.items;
          
          // ADD DEBUG LOGGING HERE
          console.log('=== CHECKOUT ITEMS DEBUG ===');
          console.log('Full response:', response);
          console.log('Checkout items:', this.checkoutItems);
          this.checkoutItems.forEach((item, index) => {
            console.log(`Item ${index + 1}:`, {
              name: item.name,
              productVariantId: item.productVariantId,
              size: item.size,
              color: item.color,
              hasVariantId: !!item.productVariantId,
              productId: item.productId,
              numberOfProducts: item.numberOfProducts
            });
          });
          console.log('=== END DEBUG ===');

          this.totalPrice = this.checkoutItems.reduce(
            (sum, item) => sum + item.price * (item.numberOfProducts || 0),
            0
          );
          this.grandTotal = this.totalPrice + this.shippingCost;
          if (this.checkoutItems.length > 0) {
            const firstItem = this.checkoutItems[0];
            this.checkoutForm.patchValue({
              fullname: firstItem.fullname,
              phoneNumber: firstItem.phoneNumber,
              address: firstItem.address,
            });
          }
        },
        error: (error) => {
          console.error('Lỗi khi lấy dữ liệu checkout', error);
        },
      });
    } else {
      console.error('orderId không được cung cấp trong URL.');
    }
  });

    // Xử lý callback sau thanh toán PayPal (ví dụ: ?paymentStatus=success&token=PAYPAL_ORDER_ID)
    this.route.queryParamMap.subscribe((params) => {
      const paymentStatus = params.get('paymentStatus');
      if (paymentStatus === 'success') {
        this.isLoading = true;
        const token = params.get('token'); // token nhận từ PayPal (OrderID)
        const orderRequestString = sessionStorage.getItem('orderRequest');

        if (orderRequestString) {
          const orderRequest: Checkout = JSON.parse(orderRequestString);
          // Nếu có token, gọi capturePayment để lấy CaptureId trước khi đặt đơn hàng

          if (token && orderRequest.paymentMethod === 'Paypal') {
            console.log(orderRequest.id);
            this.paymentService
              .capturePayment(token, orderRequest.id + 1)
              .subscribe({
                next: (captureRes) => {
                  // Sau khi capture thành công, đặt đơn hàng
                  this.checkoutService.placeOrder(orderRequest).subscribe({
                    next: () => {
                      console.log(orderRequest.id);
                      sessionStorage.removeItem('orderRequest');
                      sessionStorage.removeItem('selectedItems');
                      this.router.navigate(['/account'], { replaceUrl: true });
                    },
                    error: (err) => {
                      console.log(orderRequest.id);
                      alert('Có lỗi xảy ra khi đặt hàng.');
                      console.error(err);
                      this.isLoading = false;
                    },
                  });
                },
                error: (err) => {
                  alert('Lỗi khi capture thanh toán.');
                  console.error(err);
                  this.isLoading = false;
                },
              });
          } else {
            console.log('orderRequest.id');
            console.log(orderRequest);
            this.checkoutService.placeOrder(orderRequest).subscribe({
              next: () => {
                sessionStorage.removeItem('orderRequest');
                sessionStorage.removeItem('selectedItems');
                this.router.navigate(['/account'], { replaceUrl: true });
              },
              error: (err) => {
                alert('Có lỗi xảy ra khi đặt hàng.');
                console.error(err);
                this.isLoading = false;
              },
            });
          }
        }
      }
    });
  }

  openAddressDialog(): void {
    const currentPhoneNumber = this.checkoutForm.get('phoneNumber')?.value;
    const dialogRef = this.dialog.open(AddressDialogComponent, {
      width: '500px',
      data: { phoneNumber: currentPhoneNumber },
      autoFocus: true,
    });
    dialogRef.afterClosed().subscribe((selectedAddress) => {
      if (selectedAddress) {
        this.checkoutForm.patchValue({
          fullname: selectedAddress.fullname,
          phoneNumber: selectedAddress.phoneNumber,
          address: selectedAddress.address,
        });
      }
    });
  }

  // placeOrder(): void {
  //   if (this.checkoutForm.invalid) {
  //     alert('Vui lòng điền đầy đủ thông tin và chọn phương thức thanh toán.');
  //     return;
  //   }

  //   // First, validate that all items have variants
  //   this.validateCartItemsBeforeCheckout();

  //   const formValue = this.checkoutForm.value;
  //   const storedSelectedItems = sessionStorage.getItem('selectedItems');
  //   const selectedItems: number[] = storedSelectedItems
  //     ? JSON.parse(storedSelectedItems)
  //     : [];

  //   // Extract variant IDs from checkout items
  //   const productVariantIds = this.checkoutItems
  //     .map(item => item.productVariantId)
  //     .filter(id => id != null && id !== 0) as number[];

  //   const orderRequest: Checkout = {
  //     name: '',
  //     productId: 0,
  //     id: this.orderId,
  //     fullname: formValue.fullname,
  //     price: this.totalPrice,
  //     numberOfProducts: 0,
  //     phoneNumber: formValue.phoneNumber,
  //     address: formValue.address,
  //     orderDate: new Date(),
  //     totalMoney: this.grandTotal,
  //     paymentMethod: formValue.paymentMethod,
  //     selectedItems: selectedItems,
  //     productVariantIds: productVariantIds // Include variant IDs
  //   };

  //   // Lưu orderRequest vào sessionStorage để sử dụng trong callback
  //   sessionStorage.setItem('orderRequest', JSON.stringify(orderRequest));

  //   // Validate stock before proceeding with payment
  //   this.validateStockBeforeOrder(orderRequest);
  // }

  // ADD THIS METHOD TO VALIDATE CART ITEMS BEFORE CHECKOUT

  placeOrder(): void {
  if (this.checkoutForm.invalid) {
    alert('Vui lòng điền đầy đủ thông tin và chọn phương thức thanh toán.');
    return;
  }

  // First, validate that all items have variants
  const invalidItems = this.checkoutItems.filter(item => 
    !item.productVariantId || item.productVariantId === 0
  );
  
  if (invalidItems.length > 0) {
    const itemNames = invalidItems.map(item => item.name).join(', ');
    alert(`Các sản phẩm sau không có thông tin size/màu sắc: ${itemNames}. Vui lòng xóa và thêm lại vào giỏ hàng.`);
    this.router.navigate(['/cart']);
    return;
  }

  const formValue = this.checkoutForm.value;
  const storedSelectedItems = sessionStorage.getItem('selectedItems');
  const selectedItems: number[] = storedSelectedItems
    ? JSON.parse(storedSelectedItems)
    : [];

  // Extract variant IDs from checkout items
  const productVariantIds = this.checkoutItems
    .map(item => item.productVariantId)
    .filter(id => id != null && id !== 0) as number[];

  const orderRequest: Checkout = {
    name: '',
    productId: 0,
    id: this.orderId,
    fullname: formValue.fullname,
    price: this.totalPrice,
    numberOfProducts: 0,
    phoneNumber: formValue.phoneNumber,
    address: formValue.address,
    orderDate: new Date(),
    totalMoney: this.grandTotal,
    paymentMethod: formValue.paymentMethod,
    selectedItems: selectedItems,
    productVariantIds: productVariantIds // Include variant IDs
  };

  // Lưu orderRequest vào sessionStorage để sử dụng trong callback
  sessionStorage.setItem('orderRequest', JSON.stringify(orderRequest));

  // Validate stock before proceeding with payment
  this.validateStockBeforeOrder(orderRequest);
}

  validateCartItemsBeforeCheckout(): void {
    const invalidItems = this.checkoutItems.filter(item =>
      !item.productVariantId || item.productVariantId === 0
    );

    if (invalidItems.length > 0) {
      const itemNames = invalidItems.map(item => item.name).join(', ');
      alert(`Các sản phẩm sau không có thông tin size/màu sắc: ${itemNames}. Vui lòng xóa và thêm lại vào giỏ hàng.`);
      this.router.navigate(['/cart']);
      return;
    }
  }

  validateStockBeforeOrder(orderRequest: Checkout): void {
    this.checkoutService.validateStock(this.orderId).subscribe({
      next: (validationResponse) => {
        if (validationResponse.isValid) {
          // Stock is valid, proceed with payment
          this.proceedWithPayment(orderRequest);
        } else {
          // Show stock validation errors
          const errorMessage = validationResponse.errors?.join('\n') || 'Một vài sản phẩm không đủ hàng.';
          alert(`Không thể đặt hàng:\n${errorMessage}`);

          // Optionally redirect back to cart
          this.router.navigate(['/cart']);
        }
      },
      error: (err) => {
        console.error('Error validating stock:', err);
        alert('Xảy ra lỗi khi kiểm tra tồn kho. Vui lòng thử lại sau.');
      }
    });
  }

  proceedWithPayment(orderRequest: Checkout): void {
    if (orderRequest.paymentMethod === 'Direct Bank Transfer') {
      this.makePayment(orderRequest);
    } else if (orderRequest.paymentMethod === 'Paypal') {
      this.makePaymentPayPal(orderRequest);
    } else {
      // For other payment methods, place order directly
      this.checkoutService.placeOrder(orderRequest).subscribe({
        next: () => {
          sessionStorage.removeItem('selectedItems');
          sessionStorage.removeItem('orderRequest');
          this.router.navigate(['/account'], { replaceUrl: true });
        },
        error: (err) => {
          console.error('Error placing order:', err);
          if (err.error?.details) {
            const errorDetails = Array.isArray(err.error.details)
              ? err.error.details.join('\n')
              : err.error.details;
            alert(`Order failed:\n${errorDetails}`);
          } else {
            alert('Có lỗi xảy ra khi đặt hàng.');
          }
        },
      });
    }
  }

  makePayment(orderRequest: Checkout): void {
    const paymentData: PaymentRequest = {
      orderCode: orderRequest.id,
      amount: Math.floor(orderRequest.totalMoney|| 1000),
      // amount: Math.floor(3000),
      description: `TT DH #${orderRequest.id}`,
      buyerName: orderRequest.fullname,
      buyerEmail: 'buyer-email@gmail.com',
      buyerPhone: orderRequest.phoneNumber,
      buyerAddress: orderRequest.address,
      items: this.checkoutItems.map((item) => ({
        name: item.name,
        quantity: item.numberOfProducts || 1,
        price: Math.floor(item.price),
      })),
      cancelUrl: `https://localhost:4200/checkout/${this.orderId}`,
      returnUrl: `https://localhost:4200/checkout/${this.orderId}?paymentStatus=success`,
      expiredAt: Math.floor(Date.now() / 1000) + 3600,
    };
    this.paymentService.createPaymentLink(paymentData).subscribe({
      next: (response: PaymentResponse) => {
        if (response.code === '00') {
          window.location.href = response.data.checkoutUrl;
        } else {
          console.error('Lỗi thanh toán:', response.desc);
        }
      },
      error: (error) => {
        console.error('Có lỗi khi tạo thanh toán:', error);
      },
    });
  }

  makePaymentPayPal(orderRequest: Checkout): void {
    const paymentData: PaymentRequest = {
      orderCode: orderRequest.id,
      amount: Math.floor((orderRequest.totalMoney ?? 0) / 25000),
      description: `TT DH #${orderRequest.id}`,
      buyerName: orderRequest.fullname,
      buyerEmail: 'buyer-email@gmail.com',
      buyerPhone: orderRequest.phoneNumber,
      buyerAddress: orderRequest.address,
      items: this.checkoutItems.map((item) => ({
        name: item.name,
        quantity: item.numberOfProducts || 1,
        price: Math.floor((item.price ?? 0) / 25000),
      })),
      cancelUrl: `https://localhost:4200/checkout/${this.orderId}`,
      returnUrl: `https://localhost:4200/checkout/${this.orderId}?paymentStatus=success`,
      expiredAt: Math.floor(Date.now() / 1000) + 3600,
    };
    this.paymentService.createPaymentPayPalLink(paymentData).subscribe({
      next: (response: PaymentResponse) => {
        if (response.code === '00') {
          window.location.href = response.data.checkoutUrl;
        } else {
          console.error('Lỗi thanh toán:', response.desc);
        }
      },
      error: (error) => {
        console.error('Có lỗi khi tạo thanh toán:', error);
      },
    });
  }
}

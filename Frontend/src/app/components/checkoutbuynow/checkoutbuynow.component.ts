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
import { Checkout, CheckoutService } from '../../services/checkout.service';
import {
  PaymentService,
  PaymentRequest,
  PaymentResponse,
} from '../../services/payment.service';
import { MatDialog } from '@angular/material/dialog';
import { AddressDialogComponent } from '../address-dialog/address-dialog.component';

@Component({
  selector: 'app-checkoutbuynow',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './checkoutbuynow.component.html',
  styleUrls: ['./checkoutbuynow.component.scss'],
})
export class CheckoutbuynowComponent implements OnInit {
  checkoutForm: FormGroup;
  totalPrice: number = 0;
  shippingCost: number = 1;
  grandTotal: number = 0;
  checkoutItems: Checkout[] = [];
  orderId: number = 0;
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
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private paymentService: PaymentService
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
    // Lấy orderId từ route parameter
    this.route.paramMap.subscribe((params: ParamMap) => {
      const orderId = Number(params.get('orderId'));
      if (orderId) {
        this.orderId = orderId;
        this.loadCheckoutItems(orderId);
      } else {
        console.error('orderId không được cung cấp trong URL.');
      }
    });

    // Xử lý callback sau thanh toán
    this.route.queryParamMap.subscribe((params) => {
      const paymentStatus = params.get('paymentStatus');
      if (paymentStatus === 'success') {
        this.handlePaymentSuccess();
      }
    });
  }

  private loadCheckoutItems(orderId: number): void {
    this.checkoutService.getCheckoutBuyNowItems(orderId).subscribe({
      next: (items) => {
        this.checkoutItems = items;
        console.log('Checkout buy now items:', items);
        
        this.totalPrice = items.reduce(
          (sum, item) => sum + item.price * (item.numberOfProducts || 0),
          0
        );
        this.grandTotal = this.totalPrice + this.shippingCost;
        
        if (items.length > 0) {
          const firstItem = items[0];
          this.checkoutForm.patchValue({
            fullname: firstItem.fullname,
            phoneNumber: firstItem.phoneNumber,
            address: firstItem.address,
          });
        }
      },
      error: (error) => {
        console.error('Lỗi khi lấy dữ liệu checkout buy now', error);
      },
    });
  }

  private handlePaymentSuccess(): void {
    this.isLoading = true;
    const token = this.route.snapshot.queryParamMap.get('token');
    const orderRequestString = sessionStorage.getItem('orderRequest');
    
    if (orderRequestString) {
      const orderRequest: Checkout = JSON.parse(orderRequestString);
      
      if (token && orderRequest.paymentMethod === 'Paypal') {
        this.processPayPalPayment(token, orderRequest);
      } else {
        this.placeOrderDirectly(orderRequest);
      }
    }
  }

  private processPayPalPayment(token: string, orderRequest: Checkout): void {
    this.paymentService.capturePayment(token, orderRequest.id).subscribe({
      next: (captureRes) => {
        this.placeOrderDirectly(orderRequest);
      },
      error: (err) => {
        alert('Lỗi khi capture thanh toán.');
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  private placeOrderDirectly(orderRequest: Checkout): void {
    this.checkoutService.placeOrderBuyNow(orderRequest).subscribe({
      next: () => {
        this.cleanupAndNavigate();
      },
      error: (err) => {
        alert('Có lỗi xảy ra khi đặt hàng.');
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  private cleanupAndNavigate(): void {
    sessionStorage.removeItem('orderRequest');
    sessionStorage.removeItem('selectedItems');
    this.router.navigate(['/account'], { replaceUrl: true });
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

  placeOrder(): void {
    if (this.checkoutForm.invalid) {
      alert('Vui lòng điền đầy đủ thông tin và chọn phương thức thanh toán.');
      return;
    }

    const formValue = this.checkoutForm.value;
    const orderRequest: Checkout = {
      id: this.orderId,
      name: '',
      productId: 0,
      price: this.totalPrice,
      numberOfProducts: 0,
      orderDate: new Date(),
      fullname: formValue.fullname,
      phoneNumber: formValue.phoneNumber,
      address: formValue.address,
      paymentMethod: formValue.paymentMethod,
      totalMoney: this.grandTotal,
    };

    // Lưu orderRequest vào sessionStorage để sử dụng trong callback
    sessionStorage.setItem('orderRequest', JSON.stringify(orderRequest));

    // Validate stock before proceeding with payment
    this.validateStockBeforeOrder(orderRequest);
  }

  validateStockBeforeOrder(orderRequest: Checkout): void {
    // For buy now, we can skip stock validation or implement if needed
    // Since it's a single product and we already checked stock in product detail
    this.proceedWithPayment(orderRequest);
  }

  proceedWithPayment(orderRequest: Checkout): void {
    if (orderRequest.paymentMethod === 'Direct Bank Transfer') {
      this.makePayment(orderRequest);
    } else if (orderRequest.paymentMethod === 'Paypal') {
      this.makePaymentPayPal(orderRequest);
    } else {
      // For other payment methods, place order directly
      this.checkoutService.placeOrderBuyNow(orderRequest).subscribe({
        next: () => {
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
      amount: Math.floor(orderRequest.totalMoney||1000),
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
      cancelUrl: `https://localhost:4200/checkoutbuynow/${this.orderId}`,
      returnUrl: `https://localhost:4200/checkoutbuynow/${this.orderId}?paymentStatus=success`,
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
      cancelUrl: `https://localhost:4200/checkoutbuynow/${this.orderId}`,
      returnUrl: `https://localhost:4200/checkoutbuynow/${this.orderId}?paymentStatus=success`,
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
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Định nghĩa interface cho Checkout (có thể tùy chỉnh theo cấu trúc backend trả về)
export interface Checkout {
  name: string;
  productId: number;
  id: number;
  fullname: string;
  price: number;
  numberOfProducts: number;
  phoneNumber: string;
  address: string;
  orderDate: Date;
  totalMoney?: number;
  paymentMethod?: string;
  selectedItems?: number[];

  // ADD THESE PROPERTIES FOR VARIANT SUPPORT
  productVariantId?: number | null;
  size?: string | null;
  color?: string | null;
  // productImageUrl?: string;
  productVariantIds?: number[]; // For multiple items
}
export interface CheckoutRequest {
  orderId: number;
  selectedItems: number[];
}
export interface CheckoutResponse {
  orderId: number;
  message: string;
  items: Checkout[];
}

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  // Đảm bảo rằng baseUrl trỏ đến endpoint của API backend của bạn.
  private baseUrl = 'https://localhost:7163/api/CheckoutAPI';

  constructor(private http: HttpClient) {}

  /**
   * Lưu danh sách các sản phẩm được chọn (OrderDetail.Id) vào session.
   * POST: /store-selected-items
   */
  storeSelectedItems(selectedItems: number[]): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/store-selected-items`,
      selectedItems
    );
  }

  /**
   * Lấy thông tin các sản phẩm cần thanh toán dựa theo orderId và danh sách sản phẩm đã chọn trong Session.
   * GET: /checkout/{orderId}
   */
  // getCheckoutItems(orderId: number): Observable<Checkout[]> {
  //   return this.http.get<Checkout[]>(`${this.baseUrl}/checkout/${orderId}`);
  // }
  getCheckoutItems(request: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(
      `${this.baseUrl}/checkout`,
      request
    );
  }

  /**
   * Lấy thông tin đơn hàng "Mua ngay" để thanh toán dựa trên orderId.
   * GET: /checkout-buynow/{orderId}
   */
  getCheckoutBuyNowItems(orderId: number): Observable<Checkout[]> {
    return this.http.get<Checkout[]>(
      `${this.baseUrl}/checkout-buynow/${orderId}`
    );
  }

  /**
   * Đặt đơn hàng (thanh toán giỏ hàng) dựa trên thông tin nhận được.
   * POST: /place-order
   */
  placeOrder(orderRequest: Checkout): Observable<any> {
    return this.http.post(`${this.baseUrl}/place-order`, orderRequest);
  }

  /**
   * Đặt đơn hàng "Mua ngay" dựa trên thông tin nhận được.
   * POST: /place-order-buynow
   */
  placeOrderBuyNow(orderRequest: Checkout): Observable<any> {
    return this.http.post(`${this.baseUrl}/place-order-buynow`, orderRequest);
  }

  validateStock(orderId: number): Observable<any> {
  return this.http.post<any>(`${this.baseUrl}/validate-stock`, { orderId });
}
}

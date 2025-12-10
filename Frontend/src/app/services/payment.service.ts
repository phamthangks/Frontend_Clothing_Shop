import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaymentRequest {
  orderCode: number;
  amount: number;
  description: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  items?: Array<{ name: string; quantity: number; price: number }>;
  cancelUrl: string;
  returnUrl: string;
  expiredAt: number;
}

export interface PaymentResponse {
  code: string;
  desc: string;
  data: {
    paymentLinkId: string;
    orderCode: number;
    amount: number;
    status: string;
    checkoutUrl: string;
    // Các trường khác nếu cần
  };
  signature: string;
}
export interface RefundRequest {
  captureId: string;
  amount: number;
  currency: string;
}
@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl = 'https://localhost:7163/api/payment'; // Địa chỉ API của bạn

  constructor(private http: HttpClient) {}

  createPaymentLink(data: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/create`, data);
  }
  createPaymentPayPalLink(
    paymentData: PaymentRequest
  ): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(
      `${this.apiUrl}/create-payment`,
      paymentData
    );
  }
  capturePayment(token: string, orderId: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/capture-payment?token=${token}&orderId=${orderId}`
    );
  }
  refundPayment(request: RefundRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/refund`, request);
  }
  cancelPayment(
    orderId: number,
    cancellationReason: string
  ): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/cancel/${orderId}`, {
      cancellationReason,
    });
  }
}

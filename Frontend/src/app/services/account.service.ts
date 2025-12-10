import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from './token.service';

export interface LoginRequest {
  PhoneNumber: string;
  Password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
}

export interface RegisterRequest {
  fullName: string;
  phoneNumber: string;
  password: string;
  // Include additional fields if needed (e.g. fullname)
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface UpdateAccountRequest {
  fullname: string;
  phoneNumber: string;
}
export interface Account {
  id: number;
  fullname: string;
  phoneNumber: string;
  fullnameS: string;
  phoneNumberS: string;
  addressS: string;
  orderId: number;
  productImageUrl: string;
  // For orders
  name?: string;
  productId?: number;
  price?: number;
  status?: string;
  numberOfProducts?: number;
  orderDate?: string;
  paymentMethod: string;
  captureId?: string;
  totalMoney: number;

  // ADD VARIANT PROPERTIES
  productVariantId?: number;
  size?: string;
  color?: string;
}
export interface OtpVerificationRequest {
  phoneNumber: string;
  otp: string;
}
export interface ChangeOrderAddressRequest {
  OrderId: number;
  ShippingAddressId: number;
}
export interface ReviewRequest {
  productId: number;
  rating: number;
  reviewText: string;
  mediaFiles: File[];
}
export class Review {
  reviewId!: number;
  userName!: string;
  reviewDate?: string; // hoặc Date nếu muốn
  rating!: number;
  reviewText?: string;
  media: ReviewMedia[] = [];

  constructor(init?: Partial<Review>) {
    Object.assign(this, init);
    // Nếu media chưa được gán, đảm bảo nó là mảng rỗng
    this.media = init?.media || [];
  }
}

export class ReviewMedia {
  mediaType!: string;
  mediaUrl!: string;

  constructor(init?: Partial<ReviewMedia>) {
    Object.assign(this, init);
  }
}

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private apiUrl = 'https://localhost:7163/api/AccountAPI';
  private accountApiUrl = 'https://localhost:7163/api/MyAccountAPI';

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  login(payload: LoginRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Login`, payload, {
      withCredentials: true,
    });
  }
  getMyAccount(): Observable<any> {
    return this.http.get(`${this.accountApiUrl}/MyAccount`);
  }
  saveToken(token: string): void {
    this.tokenService.setToken(token);
  }

  getToken(): string | null {
    return this.tokenService.getToken();
  }
  changeOrderAddress(request: ChangeOrderAddressRequest): Observable<any> {
    return this.http.patch<any>(
      `${this.accountApiUrl}/ChangeOrderAddress`,
      request
    );
  }

  cancelOrder(payload: { orderId: number }): Observable<any> {
  return this.http.patch<any>(`${this.accountApiUrl}/CancelOrder`, payload, {
    withCredentials: true
  });
}

  // Phương thức thêm review với file media
  addReview(request: ReviewRequest): Observable<any> {
    // Tạo đối tượng FormData để gửi dữ liệu dạng multipart/form-data
    const formData = new FormData();
    formData.append('ProductId', request.productId.toString());
    formData.append('Rating', request.rating.toString());
    formData.append('ReviewText', request.reviewText);

    // Thêm các file media nếu có
    if (request.mediaFiles && request.mediaFiles.length > 0) {
      request.mediaFiles.forEach((file) => {
        formData.append('MediaFiles', file, file.name);
      });
    }

    // Gọi API endpoint AddReview với FormData
    return this.http.post<any>(`${this.accountApiUrl}/AddReview`, formData, {
      withCredentials: true,
    });
  }
  getReviewsByProduct(productId: number): Observable<any> {
    return this.http.get<any>(
      `${this.accountApiUrl}/GetReviewsByProduct/${productId}`,
      { withCredentials: true }
    );
  }
  hasReviewed(productId: number): Observable<{ reviewed: boolean }> {
    return this.http.get<{ reviewed: boolean }>(
      `${this.accountApiUrl}/HasReviewed/${productId}`
    );
  }
  // Cập nhật review (ví dụ endpoint UpdateReview)
  updateReview(reviewData: ReviewRequest): Observable<any> {
    // Tạo đối tượng FormData
    const formData = new FormData();
    formData.append('ProductId', reviewData.productId.toString());
    formData.append('Rating', reviewData.rating.toString());
    formData.append('ReviewText', reviewData.reviewText);
    // Nếu cần, bạn có thể thêm reviewId nếu API yêu cầu:
    // formData.append('ReviewId', reviewData.reviewId.toString());

    // Thêm các file media nếu có
    if (reviewData.mediaFiles && reviewData.mediaFiles.length > 0) {
      reviewData.mediaFiles.forEach((file) => {
        formData.append('MediaFiles', file, file.name);
      });
    }

    // Gọi API UpdateReview với FormData và gửi kèm credentials nếu cần
    return this.http.put(`${this.accountApiUrl}/UpdateReview`, formData, {
      withCredentials: true,
    });
  }

  // logout(): void {
  //   this.tokenService.removeToken();
  // }
  logout(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/Logout`,
      {},
      { withCredentials: true }
    );
  }

  register(request: RegisterRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Register`, request, {
      withCredentials: true,
    });
  }
  verifyOtp(request: OtpVerificationRequest) {
    return this.http.post<any>(`${this.apiUrl}/VerifyOTP`, request);
  }
  // logout(): Observable<any> {
  //   return this.http.post<any>(
  //     `${this.apiUrl}/Logout`,
  //     {},
  //     { withCredentials: true }
  //   );
  // }

  changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ChangePassword`, request, {
      withCredentials: true,
    });
  }

  updateAccount(request: UpdateAccountRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/UpdateAccount`, request, {
      withCredentials: true,
    });
  }

  getMyAccountAD(): Observable<Account> {
    return this.http.get<Account>(`${this.apiUrl}/MyAccount`, {
      withCredentials: true,
    });
  }
}

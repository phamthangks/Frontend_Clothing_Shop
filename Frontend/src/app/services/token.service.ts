import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly TOKEN_KEY = 'accessToken';

  constructor(private cookieService: CookieService) {}

  getToken(): string | null {
    return this.cookieService.get(this.TOKEN_KEY); // Lấy token từ cookie
  }

  setToken(token: string): void {
    this.cookieService.set(this.TOKEN_KEY, token); // Lưu token vào cookie mà không cần hết hạn
  }

  removeToken(): void {
    this.cookieService.delete(this.TOKEN_KEY); // Xóa token khỏi cookie
  }
}

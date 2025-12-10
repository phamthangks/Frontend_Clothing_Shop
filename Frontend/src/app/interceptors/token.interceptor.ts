import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../services/token.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private tokenService: TokenService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Nếu có token, thêm Authorization header vào request
    if (req.url.includes('hereapi.com')) {
      // Loại bỏ header Authorization nếu nó đã có
      const clonedReq = req.clone({
        headers: req.headers.delete('Authorization'),
      });
      return next.handle(clonedReq);
    }
    // Lấy token từ cookie
    const token = this.tokenService.getToken();
    // console.log('Token được gửi:', token);

    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }, // Sử dụng Bearer token
      });
    }
    return next.handle(req);
  }
}

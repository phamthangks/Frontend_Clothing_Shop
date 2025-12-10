// loader.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoaderService } from '../services/loader.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  constructor(private loaderService: LoaderService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Kiểm tra nếu request có header 'skipLoading'
    const skipLoading = req.headers.has('skipLoading');
    let modifiedReq = req;
    if (skipLoading) {
      // Loại bỏ header 'skipLoading' trước khi gửi đi
      modifiedReq = req.clone({
        headers: req.headers.delete('skipLoading'),
      });
    } else {
      // Nếu không có header skipLoading, bật loading
      this.loaderService.show();
    }

    return next.handle(modifiedReq).pipe(
      finalize(() => {
        // Nếu không có skipLoading, tắt loading sau khi hoàn thành request
        if (!skipLoading) {
          this.loaderService.hide();
        }
      })
    );
  }
}

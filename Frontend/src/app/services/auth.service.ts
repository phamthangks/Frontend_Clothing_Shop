import { Injectable } from '@angular/core';
import {
  SocialAuthService,
  FacebookLoginProvider,
  SocialUser,
} from 'angularx-social-login';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface FacebookLoginResponse {
  accessToken: string;
  refreshToken: string;
  phoneNumber: string;
  expiresIn: number;
  // Thêm các trường khác nếu backend trả về
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private socialAuthService: SocialAuthService,
    private http: HttpClient
  ) {}

  // Hàm đăng nhập Facebook sử dụng OAuth
  // auth.service.ts
  loginWithFacebook(): Observable<FacebookLoginResponse> {
    return from(this.socialAuthService.signIn(FacebookLoginProvider.PROVIDER_ID)).pipe(
      switchMap((user: SocialUser) => {
        return this.http.post<FacebookLoginResponse>(
          'https://localhost:7163/api/auth/facebook',
          { accessToken: user.authToken },          
          { withCredentials: true }                 
        );
      })
    );
  }

}

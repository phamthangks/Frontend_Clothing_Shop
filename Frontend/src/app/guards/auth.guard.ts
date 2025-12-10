import { Injectable, Injector } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private router!: Router;

  constructor(
    private injector: Injector,
    private jwtHelper: JwtHelperService,
    private tokenService: TokenService // Inject TokenService
  ) {}

  private getUserRole(): string | null {
    const token = this.tokenService.getToken(); // Lấy token từ TokenService
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      console.log('Decoded token:', decodedToken); // Log toàn bộ token sau khi decode
      return decodedToken?.role || null;
    }
    return null;
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.router) {
      this.router = this.injector.get(Router); // Lấy Router bằng injector để tránh vòng lặp
    }

    const token = this.tokenService.getToken(); // Lấy token từ TokenService
    if (!token || this.jwtHelper.isTokenExpired(token)) {
      this.router.navigate(['admin/login']);
      return false;
    }

    const userRole = this.getUserRole();
    const requiredRoles = route.data['roles'] as string[];

    if (requiredRoles && !requiredRoles.includes(userRole!)) {
      this.router.navigate(['unauthorized']);
      return false;
    }

    return true;
  }
}

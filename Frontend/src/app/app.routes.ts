import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { CheckoutbuynowComponent } from './components/checkoutbuynow/checkoutbuynow.component';
import { AccountComponent } from './components/account/account.component';
import { ProductComponent } from './components/product/product.component';
import { ProductdetailComponent } from './components/productdetail/productdetail.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { LayoutsComponent } from './components/layouts/layouts.component';
import { LayoutAdminComponent } from './components/layout-admin/layout-admin.component';
import { AuthGuard } from './guards/auth.guard';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { OtpVerificationComponent } from './components/otp-verification/otp-verification.component';
import { ProductAdminComponent } from './components/admin/product-admin/product-admin.component';
import { BrandAdminComponent } from './components/admin/brand-admin/brand-admin.component';
import { CategoryAdminComponent } from './components/admin/category-admin/category-admin.component';
import { OrderAdminComponent } from './components/admin/order-admin/order-admin.component';
import { UserAdminComponent } from './components/admin/user-admin/user-admin.component';
import { WelcomeAdminComponent } from './components/admin/welcome-admin/welcome-admin.component';
import { LayoutComponent } from './components/admin/layout/layout.component';

import { StatisticsComponent } from './components/admin/statistics/statistics.component';
import { ProductVariantAdminComponent } from './components/admin/product-variant-admin/product-variant-admin.component';
import { PurchaseOrderAdminComponent } from './components/admin/purchase-order-admin/purchase-order-admin.component';
import { PurchaseOrderCreateComponent } from './components/admin/purchase-order-create/purchase-order-create.component';
import { PurchaseOrderViewComponent } from './components/admin/purchase-order-view/purchase-order-view.component';
export const routes: Routes = [
  {
    path: '',
    component: LayoutsComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'home', component: HomeComponent },
      {
        path: 'cart',
        component: CartComponent,
        canActivate: [AuthGuard],
        data: { roles: ['User', 'Admin'] },
      },
      {
        path: 'checkout/:orderId',
        component: CheckoutComponent,
        canActivate: [AuthGuard],
        data: { roles: ['User', 'Admin'] },
      },
      {
        path: 'checkoutbuynow/:orderId',
        component: CheckoutbuynowComponent,
        canActivate: [AuthGuard],
        data: { roles: ['User', 'Admin'] },
      },
      {
        path: 'account',
        component: AccountComponent,
        canActivate: [AuthGuard],
        data: { roles: ['User', 'Admin'] },
      },
      { path: 'product', component: ProductComponent },
      { path: 'product-detail/:id', component: ProductdetailComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ],
  },
  {
    path: 'admin',
    component: LayoutAdminComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'verify-otp', component: OtpVerificationComponent },
    ],
  },

  {
    path: 'adminDashboard',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Admin'] },
    children: [
      // Khi vào /adminDashboard sẽ tự redirect đến /adminDashboard/welcome
      { path: '', redirectTo: 'welcome', pathMatch: 'full' },
      { path: 'welcome', component: WelcomeAdminComponent },
      {
        path: 'product',
        component: ProductAdminComponent,
      },
      {
        path: 'product-variant',
        component: ProductVariantAdminComponent,
      },
      {
        path: 'brand',
        component: BrandAdminComponent,
      },
      {
        path: 'category',
        component: CategoryAdminComponent,
      },
      {
        path: 'order',
        component: OrderAdminComponent,
      },
      {
        path: 'users',
        component: UserAdminComponent,
      },
      {
        path: 'statistics',
        component: StatisticsComponent,
      },
      {
        path: 'purchase-order',
        component: PurchaseOrderAdminComponent,
      },
      {
        path: 'purchase-order/create',
        component: PurchaseOrderCreateComponent,
      },
      {
        path: 'purchase-order/view/:id',
        component: PurchaseOrderViewComponent,
      },
      {
        path: 'purchase-order/edit/:id',
        component: PurchaseOrderCreateComponent,
      },
    ],
  },

  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '**', redirectTo: '' },
];



// shared.service.ts (modify to call real endpoints)
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';

// environment.ts (add API base URL)
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7163/api/statistics'
};

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getTotalRevenue(): Observable<{ totalRevenue: number; totalOrders: number; }> {
    return this.http.get<{ totalRevenue: number; totalOrders: number; }>(`${this.baseUrl}/total-revenue`);
  }

  loadordersinmonth() {
    return this.http.get<{ year: number; month: number; count: number; }[]>(`${this.baseUrl}/orders-by-month`);
  }

  loadordersbystatus() {
    return this.http.get<{ status: string; count: number; }[]>(`${this.baseUrl}/orders-by-status`);
  }

  loadordersbyshippingmethod() {
    return this.http.get<{ method: string; count: number; }[]>(`${this.baseUrl}/orders-by-shipping-method`);
  }

  loadordersbypaymentmethod() {
    return this.http.get<{ method: string; count: number; }[]>(`${this.baseUrl}/orders-by-payment-method`);
  }

  loadordersbyday() {
    return this.http.get<{ date: string, count: number }[]>(`${this.baseUrl}/orders-by-day`);
  }

  loadordersbycategory() {
    return this.http.get<{ categoryName: string; orderCount: number; }[]>(`${this.baseUrl}/orders-by-category`);
  }
  loadordersbybrand() {
    return this.http.get<{ brandName: string; orderCount: number; }[]>(`${this.baseUrl}/orders-by-brand`);
  }

  // API cho dashboard admin
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard`);
  }

  // API mới cho biểu đồ doanh thu với filter
  getRevenueChart(type: string = 'month', year?: number, month?: number): Observable<any[]> {
    let params = `type=${type}`;
    if (year) params += `&year=${year}`;
    if (month) params += `&month=${month}`;
    return this.http.get<any[]>(`${this.baseUrl}/revenue-chart?${params}`);
  }

  // API lấy danh sách năm có sẵn
  getAvailableYears(): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/available-years`);
  }

  getTopSellingProducts(limit: number = 5): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/top-selling-products?limit=${limit}`);
  }

  getUserGrowth(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/user-growth`);
  }

  loadAverageItemsPerOrder(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/average-items-per-order`);
  }
}


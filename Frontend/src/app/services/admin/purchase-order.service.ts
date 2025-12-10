import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  PurchaseOrder, 
  CreatePurchaseOrderRequest, 
  UpdatePurchaseOrderRequest 
} from '../../dto/purchaseOrder.dto';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {
  private apiUrl = 'https://localhost:7163/api/PurchaseOrderAPI';

  constructor(private http: HttpClient) { }

  // Lấy danh sách tất cả đơn nhập hàng
  getPurchaseOrders(): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(this.apiUrl);
  }

  // Lấy chi tiết một đơn nhập hàng
  getPurchaseOrder(id: number): Observable<PurchaseOrder> {
    return this.http.get<PurchaseOrder>(`${this.apiUrl}/${id}`);
  }

  // Tạo đơn nhập hàng mới
  createPurchaseOrder(request: CreatePurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(this.apiUrl, request);
  }

  // Cập nhật đơn nhập hàng
  updatePurchaseOrder(id: number, request: UpdatePurchaseOrderRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, request);
  }

  // Xóa đơn nhập hàng
  deletePurchaseOrder(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Lấy thống kê đơn nhập hàng
  getPurchaseOrderStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/statistics`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Brand } from '../../dto/brand.dto'; // Đường dẫn đến model Brand

@Injectable({
  providedIn: 'root',
})
export class BrandService {
  private baseUrl = 'https://localhost:7163/api/brand';
  constructor(private http: HttpClient) {}

  getBrands(
    page: number,
    size: number
  ): Observable<{ items: Brand[]; total: number }> {
    return this.http
      .get<{ data: Brand[]; total: number }>(
        `${this.baseUrl}?page=${page}&size=${size}`
      )
      .pipe(
        map((res) => ({
          items: res.data,
          total: res.total,
        }))
      );
  }

  getAllBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.baseUrl}/all`);
  }

  getBrandById(id: number): Observable<Brand> {
    return this.http.get<Brand>(`${this.baseUrl}/${id}`);
  }

  createBrand(brand: Brand): Observable<any> {
    return this.http.post(`${this.baseUrl}/Create`, brand);
  }

  updateBrand(id: number, brand: Brand): Observable<any> {
    return this.http.put(`${this.baseUrl}/Edit/${id}`, brand); // Sửa URL thành /edit/${id}
  }

  deleteBrand(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Delete/${id}`);
  }
}

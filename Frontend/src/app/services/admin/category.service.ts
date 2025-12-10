import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Category } from '../../dto/category.dto'; // Đường dẫn đến model Brand

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private baseUrl = 'https://localhost:7163/api/category';
  constructor(private http: HttpClient) {}

  getCategories(
    page: number,
    size: number
  ): Observable<{ items: Category[]; total: number }> {
    return this.http
      .get<{ data: Category[]; total: number }>(
        `${this.baseUrl}?page=${page}&size=${size}`
      )
      .pipe(
        map((res) => ({
          items: res.data,
          total: res.total,
        }))
      );
  }

  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/all`);
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${id}`);
  }

  createCategory(category: Category): Observable<any> {
    return this.http.post(`${this.baseUrl}/Create`, category);
  }

  updateCategory(id: number, category: Category): Observable<any> {
    return this.http.put(`${this.baseUrl}/Edit/${id}`, category); // Sửa URL thành /edit/${id}
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Delete/${id}`);
  }
}

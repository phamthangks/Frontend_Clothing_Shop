import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ProductVariant,
  ProductVariantCreateRequest,
  ProductVariantUpdateRequest,
  ProductVariantBatchCreateRequest,
} from '../../dto/productVariant.dto';

@Injectable({
  providedIn: 'root',
})
export class ProductVariantService {
  private baseUrl = 'https://localhost:7163/api/productvariant';

  constructor(private http: HttpClient) { }

  getAllVariants(): Observable<ProductVariant[]> {
    return this.http.get<ProductVariant[]>(`${this.baseUrl}/all`);
  }

  getVariantById(id: number): Observable<ProductVariant> {
    return this.http.get<ProductVariant>(`${this.baseUrl}/${id}`);
  }

  getVariantsByProductId(productId: number): Observable<ProductVariant[]> {
    return this.http.get<ProductVariant[]>(
      `${this.baseUrl}/product/${productId}`
    );
  }

  createVariant(
    request: ProductVariantCreateRequest
  ): Observable<{ message: string; variant: ProductVariant }> {
    return this.http.post<{ message: string; variant: ProductVariant }>(
      `${this.baseUrl}/create`,
      request
    );
  }

  updateVariant(
    id: number,
    request: ProductVariantUpdateRequest
  ): Observable<{ message: string; variant: ProductVariant }> {
    return this.http.put<{ message: string; variant: ProductVariant }>(
      `${this.baseUrl}/edit/${id}`,
      request
    );
  }

  deleteVariant(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/delete/${id}`
    );
  }

  createBatchVariants(
    request: ProductVariantBatchCreateRequest
  ): Observable<{
    message: string;
    createdCount: number;
    totalRequested: number;
    errors: string[];
    variants: ProductVariant[];
  }> {
    return this.http.post<{
      message: string;
      createdCount: number;
      totalRequested: number;
      errors: string[];
      variants: ProductVariant[];
    }>(`${this.baseUrl}/create-batch`, request);
  }
}



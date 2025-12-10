import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductVariant } from '../dto/productVariant.dto';

@Injectable({
  providedIn: 'root',
})
export class ProductVariantService {
  private apiUrl = 'https://localhost:7163/api/productvariant'; 

  constructor(private http: HttpClient) {}

  getVariantsByProduct(productId: number): Observable<ProductVariant[]> {
    return this.http.get<ProductVariant[]>(`${this.apiUrl}/product/${productId}`);
  }
}

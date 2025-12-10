import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../dto/product.dto';
import { ProductImage } from '../dto/productImage.dto';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Category } from '../dto/category.dto';
import { Brand } from '../dto/brand.dto';
export interface ProductDetailViewModel {
  product: Product;
  anhSps: ProductImage[];
}
export interface PagedResponse<T> {
  items: T[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  // Đường dẫn base API (điều chỉnh theo địa chỉ thực tế)
  private baseUrl = 'https://localhost:7163/api/products';
  private apiUrl = 'https://localhost:7163/api/LoaiSP';
  constructor(private http: HttpClient) {}

  // Lấy tất cả sản phẩm
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/all`);
  }
  // Lấy chi tiết sản phẩm theo id
  getProductDetail(id: number): Observable<ProductDetailViewModel> {
    return this.http.get<ProductDetailViewModel>(`${this.baseUrl}/${id}`);
  }
 getProducts(
    page: number,
    itemsPerPage: number,
    name?: string,
    categoryId?: number | null,
    brandId?: number | null,
    minPrice?: number,
    maxPrice?: number
  ): Observable<PagedResponse<Product>> {
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', itemsPerPage.toString());
    if (name && name.trim() !== '') {
      params = params.set('name', name.trim());
    }
    if (categoryId != null) {
      params = params.set('categoryId', categoryId.toString());
    }
    if (brandId != null) {
      params = params.set('brandId', brandId.toString());
    }
    if (minPrice != null) {
      params = params.set('minPrice', minPrice.toString());
    }
    if (maxPrice != null && maxPrice !== Infinity) {
      params = params.set('maxPrice', maxPrice.toString());
    }

    return this.http.get<PagedResponse<Product>>(`${this.baseUrl}/paged`, {
      params,
    });
  }

  // Lấy sản phẩm theo danh mục
  getProductsByCategory(categoryId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/category/${categoryId}`, {
      headers: { skipLoading: 'true' },
    });
  }

  // Lấy sản phẩm theo thương hiệu
  getProductsByBrand(brandId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/brand/${brandId}`, {
      headers: { skipLoading: 'true' },
    });
  }

  // Lấy sản phẩm theo khoảng giá
  getProductsByPrice(
    minPrice: number,
    maxPrice: number
  ): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${this.apiUrl}/price?minPrice=${minPrice}&maxPrice=${maxPrice}`,
      { headers: { skipLoading: 'true' } }
    );
  }

  // Tìm sản phẩm theo tên
  getProductsByName(name: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/search?name=${name}`, {
      headers: { skipLoading: 'true' },
    });
  }
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getBrands(): Observable<Brand[]> {
    return this.http.get<Brand[]>(`${this.apiUrl}/brands`);
  }

  getProductVariants(): Observable<any[]> {
    return this.http.get<any[]>(`https://localhost:7163/api/products/variants`);
  }
}

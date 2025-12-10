import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from '../../dto/product.dto';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface ProductDetailViewModel {
  product: Product;
}
export interface PagedResponse<T> {
  items: T[];
  total: number;
}

export interface ProductFormData {
  name: string;
  price: number;
  description?: string;
  categoryId?: number;
  brandId?: number;
  thumbnailImage?: File;
  images?: File[];
  deletedImageIds?: number[];
}

@Injectable({
  providedIn: 'root',
})
export class ProductAdminService {
  // Đường dẫn base API (điều chỉnh theo địa chỉ thực tế)
  private baseUrl = 'https://localhost:7163/api/product';
  private imageUrl = 'https://localhost:7163/api/image';
  
  constructor(private http: HttpClient) {}

  // Lấy tất cả sản phẩm
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/all`);
  }

  getProducts(
    page: number,
    itemsPerPage: number
  ): Observable<PagedResponse<Product>> {
    const params = {
      page: page.toString(),
      pageSize: itemsPerPage.toString(),
    };
    return this.http.get<PagedResponse<Product>>(`${this.baseUrl}/paged`, {
      params,
    });
  }

  // Lấy chi tiết sản phẩm
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  // Test FormData
  testFormData(productData: ProductFormData): Observable<any> {
    const formData = this.buildFormData(productData);
    return this.http.post(`${this.baseUrl}/Test`, formData);
  }

  // Tạo sản phẩm với upload ảnh
  createProduct(productData: ProductFormData): Observable<any> {
    const formData = this.buildFormData(productData);
    return this.http.post(`${this.baseUrl}/Create`, formData, {
      headers: {
        // Không set Content-Type, để browser tự động set với boundary
      }
    });
  }

  // Cập nhật sản phẩm với upload ảnh
  updateProduct(id: number, productData: ProductFormData): Observable<any> {
    const formData = this.buildFormData(productData);
    return this.http.put(`${this.baseUrl}/Edit/${id}`, formData, {
      headers: {
        // Không set Content-Type, để browser tự động set với boundary
      }
    });
  }

  // Xóa sản phẩm
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Delete/${id}`);
  }

  // Upload ảnh đơn
  uploadSingleImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.imageUrl}/upload-single`, formData);
  }

  // Upload nhiều ảnh
  uploadMultipleImages(files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    return this.http.post(`${this.imageUrl}/upload-multiple`, formData);
  }

  // Xóa ảnh
  deleteImage(imageUrl: string): Observable<any> {
    return this.http.delete(`${this.imageUrl}/delete`, {
      params: { imageUrl }
    });
  }

  // Lấy danh sách ảnh
  getAllImages(): Observable<any> {
    return this.http.get(`${this.imageUrl}/list`);
  }

  // Helper method để build FormData
  private buildFormData(productData: ProductFormData): FormData {
    const formData = new FormData();
    
    formData.append('name', productData.name);
    formData.append('price', productData.price.toString());
    
    if (productData.description) {
      formData.append('description', productData.description);
    }
    
    if (productData.categoryId !== undefined) {
      formData.append('categoryId', productData.categoryId.toString());
    }
    
    if (productData.brandId !== undefined) {
      formData.append('brandId', productData.brandId.toString());
    }
    
    // Ảnh đại diện
    if (productData.thumbnailImage) {
      formData.append('thumbnailImage', productData.thumbnailImage);
    }
    
    // Nhiều ảnh
    if (productData.images && productData.images.length > 0) {
      productData.images.forEach(image => {
        formData.append('images', image);
      });
    }

    // Danh sách ID ảnh cần xóa
    if (productData.deletedImageIds && productData.deletedImageIds.length > 0) {
      productData.deletedImageIds.forEach(id => {
        formData.append('deletedImageIds', id.toString());
      });
    }
    
    return formData;
  }
}

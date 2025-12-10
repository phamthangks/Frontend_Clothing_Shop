import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Product } from '../../../dto/product.dto';
import { ProductImage } from '../../../dto/productImage.dto';
import { Category } from '../../../dto/category.dto';
import { Brand } from '../../../dto/brand.dto';
import { ProductAdminService, ProductFormData } from '../../../services/admin/productadmin.service';
import { CategoryService } from '../../../services/admin/category.service';
import { BrandService } from '../../../services/admin/brand.service';

@Component({
  selector: 'app-product-admin-edit',
  templateUrl: './product-admin-edit.component.html',
  styleUrls: ['./product-admin-edit.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class ProductAdminEditComponent implements OnInit {
  productData: ProductFormData = {
    name: '',
    description: '',
    price: 0,
    brandId: undefined,
    categoryId: undefined,
  };

  productId: number;
  
  // Current thumbnail from database
  currentThumbnail: string | null = null;
  
  // New thumbnail to upload
  thumbnailPreview: string | null = null;
  thumbnailFile: File | null = null;
  
  // Current additional images from database
  currentAdditionalImages: ProductImage[] = [];
  
  // New additional images to upload
  newAdditionalImages: Array<{ file: File; preview: string }> = [];
  
  // IDs of images to delete
  deletedImageIds: number[] = [];

  isSubmitting = false;
  isLoading = true;

  categories: Category[] = [];
  brands: Brand[] = [];

  constructor(
    private dialogRef: MatDialogRef<ProductAdminEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private productAdminService: ProductAdminService,
    private categoryService: CategoryService,
    private brandService: BrandService
  ) {
    this.productId = data.id;
  }

  ngOnInit(): void {
    this.loadProduct();
    this.loadCategories();
    this.loadBrands();
  }

  loadProduct(): void {
    this.productAdminService.getProductById(this.productId).subscribe({
      next: (product: Product) => {
        this.productData = {
          name: product.name,
          price: product.price,
          description: product.description,
          categoryId: product.categoryId,
          brandId: product.brandId,
        };
        
        this.currentThumbnail = product.image || null;
        this.currentAdditionalImages = product.productImages || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải sản phẩm:', error);
        alert('Không thể tải thông tin sản phẩm');
        this.dialogRef.close();
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Lỗi khi tải danh mục:', error);
      }
    });
  }

  loadBrands(): void {
    this.brandService.getAllBrands().subscribe({
      next: (brands) => {
        this.brands = brands;
      },
      error: (error) => {
        console.error('Lỗi khi tải thương hiệu:', error);
      }
    });
  }

  // Xử lý chọn ảnh đại diện mới
  onThumbnailSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      if (!this.validateImageFile(file)) {
        return;
      }

      this.thumbnailFile = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.thumbnailPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Xóa ảnh đại diện mới (quay lại dùng ảnh cũ)
  removeThumbnailPreview(): void {
    this.thumbnailFile = null;
    this.thumbnailPreview = null;
  }

  // Xóa ảnh đại diện hiện tại
  removeCurrentThumbnail(): void {
    this.currentThumbnail = null;
  }

  // Xử lý chọn nhiều ảnh mới
  onAdditionalImagesSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      
      files.forEach(file => {
        if (!this.validateImageFile(file)) {
          return;
        }

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.newAdditionalImages.push({
            file: file,
            preview: e.target.result
          });
        };
        reader.readAsDataURL(file);
      });

      input.value = '';
    }
  }

  // Xóa ảnh mới chưa upload
  removeNewAdditionalImage(index: number): void {
    this.newAdditionalImages.splice(index, 1);
  }

  // Đánh dấu ảnh cũ để xóa
  markImageForDeletion(imageId: number): void {
    this.deletedImageIds.push(imageId);
    this.currentAdditionalImages = this.currentAdditionalImages.filter(
      img => img.id !== imageId
    );
  }

  // Validate image file
  private validateImageFile(file: File): boolean {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      alert('Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP)');
      return false;
    }

    if (file.size > maxSize) {
      alert('Kích thước file không được vượt quá 5MB');
      return false;
    }

    return true;
  }

  getImageUrl(url: string | undefined): string {
    if (!url) return '';
    // Nếu đã là URL đầy đủ (http/https), trả về như cũ
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Nếu bắt đầu bằng /, là relative URL, thêm base URL
    if (url.startsWith('/')) {
      return `https://localhost:7163${url}`;
    }
    // Nếu chỉ là tên file, thêm đường dẫn đầy đủ
    return `https://localhost:7163/uploads/image/${url}`;
  }

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    if (!this.productData.name || !this.productData.price) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    this.isSubmitting = true;

    const formData: ProductFormData = {
      name: this.productData.name,
      price: this.productData.price,
      description: this.productData.description,
      categoryId: this.productData.categoryId,
      brandId: this.productData.brandId,
      thumbnailImage: this.thumbnailFile || undefined,
      images: this.newAdditionalImages.map(img => img.file),
      deletedImageIds: this.deletedImageIds,
    };

    this.productAdminService.updateProduct(this.productId, formData).subscribe({
      next: (response) => {
        alert('Cập nhật sản phẩm thành công!');
        this.dialogRef.close(true);
      },
      error: (error: any) => {
        console.error('Lỗi khi cập nhật sản phẩm:', error);
        alert('Đã có lỗi xảy ra. Vui lòng thử lại.');
        this.isSubmitting = false;
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

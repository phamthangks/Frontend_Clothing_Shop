import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { Product } from '../../../dto/product.dto';
import { Category } from '../../../dto/category.dto';
import { Brand } from '../../../dto/brand.dto';
import { ProductAdminService, ProductFormData } from '../../../services/admin/productadmin.service';
import { CategoryService } from '../../../services/admin/category.service';
import { BrandService } from '../../../services/admin/brand.service';

@Component({
  selector: 'app-product-admin-create',
  templateUrl: './product-admin-create.component.html',
  styleUrls: ['./product-admin-create.component.scss'],
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
export class ProductAdminCreateComponent implements OnInit {
  productData: ProductFormData = {
    name: '',
    description: '',
    price: 0,
    brandId: undefined,
    categoryId: undefined,
  };

  // Preview images
  thumbnailPreview: string | null = null;
  thumbnailFile: File | null = null;
  
  additionalImages: Array<{ file: File; preview: string }> = [];

  isSubmitting = false;

  categories: Category[] = [];
  brands: Brand[] = [];

  constructor(
    private dialogRef: MatDialogRef<ProductAdminCreateComponent>,
    private productAdminService: ProductAdminService,
    private categoryService: CategoryService,
    private brandService: BrandService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadBrands();
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

  // Xử lý chọn ảnh đại diện
  onThumbnailSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file
      if (!this.validateImageFile(file)) {
        return;
      }

      this.thumbnailFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.thumbnailPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Xóa ảnh đại diện
  removeThumbnail(): void {
    this.thumbnailFile = null;
    this.thumbnailPreview = null;
  }

  // Xử lý chọn nhiều ảnh
  onAdditionalImagesSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      
      files.forEach(file => {
        // Validate file
        if (!this.validateImageFile(file)) {
          return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.additionalImages.push({
            file: file,
            preview: e.target.result
          });
        };
        reader.readAsDataURL(file);
      });

      // Reset input
      input.value = '';
    }
  }

  // Xóa ảnh phụ
  removeAdditionalImage(index: number): void {
    this.additionalImages.splice(index, 1);
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

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }

    // Validate required fields
    if (!this.productData.name || !this.productData.price) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    this.isSubmitting = true;

    // Prepare form data
    const formData: ProductFormData = {
      name: this.productData.name,
      price: this.productData.price,
      description: this.productData.description,
      categoryId: this.productData.categoryId,
      brandId: this.productData.brandId,
      thumbnailImage: this.thumbnailFile || undefined,
      images: this.additionalImages.map(img => img.file),
    };

    // Test FormData trước
    console.log('Testing FormData...');
    this.productAdminService.testFormData(formData).subscribe({
      next: (testResponse) => {
        console.log('FormData test successful:', testResponse);
        
        // Nếu test thành công, tạo sản phẩm thật
        this.productAdminService.createProduct(formData).subscribe({
          next: (response) => {
            alert('Tạo sản phẩm thành công!');
            this.dialogRef.close(true);
          },
          error: (error: any) => {
            console.error('Lỗi khi tạo sản phẩm:', error);
            alert('Đã có lỗi xảy ra. Vui lòng thử lại.');
            this.isSubmitting = false;
          },
        });
      },
      error: (testError: any) => {
        console.error('FormData test failed:', testError);
        alert('Lỗi test FormData: ' + (testError.error?.message || testError.message));
        this.isSubmitting = false;
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

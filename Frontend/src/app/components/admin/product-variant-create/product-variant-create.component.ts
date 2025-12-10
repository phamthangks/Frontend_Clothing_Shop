import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ProductVariantService } from '../../../services/admin/productvariant.service';
import { ProductAdminService } from '../../../services/admin/productadmin.service';
import { Product } from '../../../dto/product.dto';
import { ProductVariantCreateRequest } from '../../../dto/productVariant.dto';

@Component({
  selector: 'app-product-variant-create',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './product-variant-create.component.html',
  styleUrls: ['./product-variant-create.component.scss'],
})
export class ProductVariantCreateComponent implements OnInit {
  products: Product[] = [];
  variant: ProductVariantCreateRequest = {
    productId: 0,
    color: '',
    size: '',
    price: 0,
    stockQuantity: 0,
  };

  // Các tùy chọn định sẵn
  predefinedColors = [
    { name: 'Đen', value: 'Black', color: '#000000' },
    { name: 'Đỏ', value: 'Red', color: '#FF0000' },
    { name: 'Xanh dương', value: 'Blue', color: '#0000FF' },
    { name: 'Vàng', value: 'Yellow', color: '#FFFF00' },
  ];

  predefinedSizes = ['S', 'M', 'L', 'XL'];

  isCustomColor = false;
  isCustomSize = false;
  customColor = '';
  customSize = '';
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<ProductVariantCreateComponent>,
    private variantService: ProductVariantService,
    private productService: ProductAdminService,
    @Inject(MAT_DIALOG_DATA) public data: { productId?: number }
  ) {
    if (data && data.productId) {
      this.variant.productId = data.productId;
    }
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;

        // Nếu chỉ có một sản phẩm hoặc đã chỉ định ID sản phẩm, tự động chọn
        if (this.variant.productId && this.variant.productId > 0) {
          const selectedProduct = products.find(p => p.id === this.variant.productId);
          if (selectedProduct) {
            this.onProductChange();
          }
        }
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách sản phẩm:', error);
        alert('Tải danh sách sản phẩm thất bại!');
      },
    });
  }

  onProductChange(): void {
    const selectedProduct = this.products.find(
      (p) => p.id === this.variant.productId
    );
    if (selectedProduct && selectedProduct.price) {
      this.variant.price = selectedProduct.price;
    }
  }

  onColorTypeChange(): void {
    if (!this.isCustomColor) {
      this.customColor = '';
    }
  }

  onSizeTypeChange(): void {
    if (!this.isCustomSize) {
      this.customSize = '';
    }
  }

  onSubmit(): void {
    // Xác thực
    if (!this.variant.productId || this.variant.productId === 0) {
      alert('Vui lòng chọn sản phẩm!');
      return;
    }

    // Lấy màu sắc
    if (this.isCustomColor) {
      if (!this.customColor.trim()) {
        alert('Vui lòng nhập màu sắc tùy chỉnh!');
        return;
      }
      this.variant.color = this.customColor.trim();
    } else {
      if (!this.variant.color) {
        alert('Vui lòng chọn màu sắc!');
        return;
      }
    }

    // Lấy kích thước
    if (this.isCustomSize) {
      if (!this.customSize.trim()) {
        alert('Vui lòng nhập kích thước tùy chỉnh!');
        return;
      }
      this.variant.size = this.customSize.trim();
    } else {
      if (!this.variant.size) {
        alert('Vui lòng chọn kích thước!');
        return;
      }
    }

    if (this.variant.price <= 0) {
      alert('Giá phải lớn hơn 0!');
      return;
    }

    if (this.variant.stockQuantity < 0) {
      alert('Số lượng tồn kho không thể âm!');
      return;
    }

    this.loading = true;

    this.variantService.createVariant(this.variant).subscribe({
      next: (response) => {
        alert(response.message || 'Tạo biến thể thành công!');
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Lỗi khi tạo biến thể:', error);
        const errorMessage =
          error.error?.message || error.message || 'Tạo biến thể thất bại!';
        alert(errorMessage);
        this.loading = false;
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getSelectedProduct(): Product | undefined {
    return this.products.find((p) => p.id === this.variant.productId);
  }
}

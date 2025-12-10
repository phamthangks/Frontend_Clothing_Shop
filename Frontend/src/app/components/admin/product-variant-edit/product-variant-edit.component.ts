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
import {
  ProductVariant,
  ProductVariantUpdateRequest,
} from '../../../dto/productVariant.dto';

@Component({
  selector: 'app-product-variant-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './product-variant-edit.component.html',
  styleUrls: ['./product-variant-edit.component.scss'],
})
export class ProductVariantEditComponent implements OnInit {
  variant: ProductVariantUpdateRequest = {
    color: '',
    size: '',
    price: 0,
    stockQuantity: 0,
  };

  originalVariant: ProductVariant;

  // Các tùy chọn định sẵn
  predefinedColors = [
    { name: 'Đen', value: 'Black', color: '#000000' },
    { name: 'Trắng', value: 'White', color: '#FFFFFF' },
    { name: 'Đỏ', value: 'Red', color: '#FF0000' },
    { name: 'Xanh dương', value: 'Blue', color: '#0000FF' },
    { name: 'Xanh lá', value: 'Green', color: '#00FF00' },
    { name: 'Vàng', value: 'Yellow', color: '#FFFF00' },
    { name: 'Hồng', value: 'Pink', color: '#FFC0CB' },
    { name: 'Xám', value: 'Gray', color: '#808080' },
    { name: 'Nâu', value: 'Brown', color: '#A52A2A' },
    { name: 'Tím', value: 'Purple', color: '#800080' },
  ];

  predefinedSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

  isCustomColor = false;
  isCustomSize = false;
  customColor = '';
  customSize = '';
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<ProductVariantEditComponent>,
    private variantService: ProductVariantService,
    @Inject(MAT_DIALOG_DATA) public data: ProductVariant
  ) {
    this.originalVariant = { ...data };
    this.variant = {
      color: data.color,
      size: data.size,
      price: data.price,
      stockQuantity: data.stockQuantity,
    };

    // Kiểm tra xem có phải màu sắc/kích thước tùy chỉnh không
    this.isCustomColor = !this.predefinedColors.some(
      (c) => c.value === data.color
    );
    this.isCustomSize = !this.predefinedSizes.includes(data.size);

    if (this.isCustomColor) {
      this.customColor = data.color;
    }
    if (this.isCustomSize) {
      this.customSize = data.size;
    }
  }

  ngOnInit(): void {}

  onColorTypeChange(): void {
    if (!this.isCustomColor) {
      this.customColor = '';
      // Nếu chuyển sang định sẵn, xóa lựa chọn
      if (
        this.isCustomColor !==
        !this.predefinedColors.some((c) => c.value === this.variant.color)
      ) {
        this.variant.color = '';
      }
    }
  }

  onSizeTypeChange(): void {
    if (!this.isCustomSize) {
      this.customSize = '';
      // Nếu chuyển sang định sẵn, xóa lựa chọn
      if (this.isCustomSize !== !this.predefinedSizes.includes(this.variant.size)) {
        this.variant.size = '';
      }
    }
  }

  onSubmit(): void {
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

    this.variantService
      .updateVariant(this.originalVariant.id, this.variant)
      .subscribe({
        next: (response) => {
          alert(response.message || 'Cập nhật biến thể thành công!');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Lỗi khi cập nhật biến thể:', error);
          const errorMessage =
            error.error?.message || error.message || 'Cập nhật biến thể thất bại!';
          alert(errorMessage);
          this.loading = false;
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  hasChanges(): boolean {
    return (
      this.variant.color !== this.originalVariant.color ||
      this.variant.size !== this.originalVariant.size ||
      this.variant.price !== this.originalVariant.price ||
      this.variant.stockQuantity !== this.originalVariant.stockQuantity
    );
  }
}

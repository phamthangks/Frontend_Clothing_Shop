import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ProductVariantService } from '../../../services/admin/productvariant.service';
import { ProductVariant } from '../../../dto/productVariant.dto';

@Component({
  selector: 'app-product-variant-delete',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './product-variant-delete.component.html',
  styleUrls: ['./product-variant-delete.component.scss'],
})
export class ProductVariantDeleteComponent {
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<ProductVariantDeleteComponent>,
    private variantService: ProductVariantService,
    @Inject(MAT_DIALOG_DATA) public variant: ProductVariant
  ) {}

  onConfirm(): void {
    this.loading = true;

    this.variantService.deleteVariant(this.variant.id).subscribe({
      next: (response) => {
        alert(response.message || 'Xóa biến thể thành công!');
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Lỗi khi xóa biến thể:', error);
        const errorMessage =
          error.error?.message || error.message || 'Xóa biến thể thất bại!';
        alert(errorMessage);
        this.loading = false;
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'text-danger';
    if (stock < 10) return 'text-warning';
    return 'text-success';
  }

  getStockIcon(stock: number): string {
    if (stock === 0) return 'fas fa-times-circle';
    if (stock < 10) return 'fas fa-exclamation-triangle';
    return 'fas fa-check-circle';
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faSave, 
  faPlus, 
  faTrash, 
  faArrowLeft,
  faBoxes,
  faSearch,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { PurchaseOrderService } from '../../../services/admin/purchase-order.service';
import { ProductService } from '../../../services/product.service';
import { 
  CreatePurchaseOrderRequest, 
  CreatePurchaseOrderDetailRequest,
  UpdatePurchaseOrderRequest,
  UpdatePurchaseOrderDetailRequest,
  PurchaseOrder
} from '../../../dto/purchaseOrder.dto';
import { ProductVariant } from '../../../dto/productVariant.dto';

@Component({
  selector: 'app-purchase-order-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FontAwesomeModule],
  templateUrl: './purchase-order-create.component.html',
  styleUrls: ['./purchase-order-create.component.scss']
})
export class PurchaseOrderCreateComponent implements OnInit {
  purchaseOrder: CreatePurchaseOrderRequest = {
    supplierName: '',
    note: '',
    purchaseOrderDetails: []
  };

  productVariants: ProductVariant[] = [];
  filteredVariants: ProductVariant[] = [];
  searchTerm: string = '';
  loading: boolean = false;
  saving: boolean = false;
  isEditMode: boolean = false;
  editId: number | null = null;

  // Font Awesome Icons
  faSave = faSave;
  faPlus = faPlus;
  faTrash = faTrash;
  faArrowLeft = faArrowLeft;
  faBoxes = faBoxes;
  faSearch = faSearch;
  faSpinner = faSpinner;

  constructor(
    private purchaseOrderService: PurchaseOrderService,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadProductVariants();
    this.checkEditMode();
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.editId = +id;
      this.loadPurchaseOrderForEdit();
    }
  }

  loadPurchaseOrderForEdit(): void {
    if (!this.editId) return;

    this.loading = true;
    this.purchaseOrderService.getPurchaseOrder(this.editId).subscribe({
      next: (data) => {
        this.purchaseOrder = {
          supplierName: data.supplierName,
          note: data.note || '',
          purchaseOrderDetails: data.purchaseOrderDetails.map(detail => ({
            productVariantId: detail.productVariantId,
            quantity: detail.quantity,
            importPrice: detail.importPrice
          }))
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải đơn nhập hàng để chỉnh sửa:', error);
        this.loading = false;
      }
    });
  }

  loadProductVariants(): void {
    this.loading = true;
    this.productService.getProductVariants().subscribe({
      next: (data) => {
        this.productVariants = data;
        this.filteredVariants = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách biến thể sản phẩm:', error);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredVariants = this.productVariants;
      return;
    }

    this.filteredVariants = this.productVariants.filter(variant =>
      variant.product?.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      variant.color?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      variant.size?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  addProductVariant(variant: ProductVariant): void {
    const existingDetail = this.purchaseOrder.purchaseOrderDetails.find(
      detail => detail.productVariantId === variant.id
    );

    if (existingDetail) {
      existingDetail.quantity += 1;
      existingDetail.importPrice = existingDetail.importPrice; // Giữ nguyên giá
    } else {
      const newDetail: CreatePurchaseOrderDetailRequest = {
        productVariantId: variant.id,
        quantity: 1,
        importPrice: variant.price * 0.7 // Giá nhập = 70% giá bán
      };
      this.purchaseOrder.purchaseOrderDetails.push(newDetail);
    }
  }

  removeProductDetail(index: number): void {
    this.purchaseOrder.purchaseOrderDetails.splice(index, 1);
  }

  updateQuantity(index: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    const quantity = +target.value;
    if (quantity > 0) {
      this.purchaseOrder.purchaseOrderDetails[index].quantity = quantity;
    }
  }

  updateImportPrice(index: number, event: Event): void {
    const target = event.target as HTMLInputElement;
    const price = +target.value;
    if (price > 0) {
      this.purchaseOrder.purchaseOrderDetails[index].importPrice = price;
    }
  }

  getTotalPrice(detail: CreatePurchaseOrderDetailRequest): number {
    return detail.quantity * detail.importPrice;
  }

  getGrandTotal(): number {
    return this.purchaseOrder.purchaseOrderDetails.reduce(
      (total, detail) => total + this.getTotalPrice(detail), 0
    );
  }

  getProductVariantInfo(variantId: number): ProductVariant | undefined {
    return this.productVariants.find(v => v.id === variantId);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  onSubmit(): void {
    if (!this.purchaseOrder.supplierName.trim()) {
      alert('Vui lòng nhập tên nhà cung cấp');
      return;
    }

    if (this.purchaseOrder.purchaseOrderDetails.length === 0) {
      alert('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }

    this.saving = true;

    if (this.isEditMode && this.editId) {
      const updateRequest: UpdatePurchaseOrderRequest = {
        id: this.editId,
        supplierName: this.purchaseOrder.supplierName,
        note: this.purchaseOrder.note,
        purchaseOrderDetails: this.purchaseOrder.purchaseOrderDetails.map(detail => ({
          productVariantId: detail.productVariantId,
          quantity: detail.quantity,
          importPrice: detail.importPrice
        }))
      };

      this.purchaseOrderService.updatePurchaseOrder(this.editId, updateRequest).subscribe({
        next: (response) => {
          alert('Cập nhật đơn nhập hàng thành công!');
          this.router.navigate(['/adminDashboard/purchase-order']);
        },
        error: (error) => {
          console.error('Lỗi khi cập nhật đơn nhập hàng:', error);
          alert('Lỗi khi cập nhật đơn nhập hàng');
          this.saving = false;
        }
      });
    } else {
      this.purchaseOrderService.createPurchaseOrder(this.purchaseOrder).subscribe({
        next: (response) => {
          alert('Tạo đơn nhập hàng thành công!');
          this.router.navigate(['/adminDashboard/purchase-order']);
        },
        error: (error) => {
          console.error('Lỗi khi tạo đơn nhập hàng:', error);
          alert('Lỗi khi tạo đơn nhập hàng');
          this.saving = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/adminDashboard/purchase-order']);
  }
}

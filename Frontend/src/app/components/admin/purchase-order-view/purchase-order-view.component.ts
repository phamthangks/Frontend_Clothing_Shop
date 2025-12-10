import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faArrowLeft, 
  faEdit, 
  faTrash, 
  faBoxes,
  faUser,
  faCalendarAlt,
  faDollarSign,
  faSpinner,
  faPrint
} from '@fortawesome/free-solid-svg-icons';
import { PurchaseOrderService } from '../../../services/admin/purchase-order.service';
import { PurchaseOrder } from '../../../dto/purchaseOrder.dto';

@Component({
  selector: 'app-purchase-order-view',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './purchase-order-view.component.html',
  styleUrls: ['./purchase-order-view.component.scss']
})
export class PurchaseOrderViewComponent implements OnInit {
  purchaseOrder: PurchaseOrder | null = null;
  loading: boolean = false;
  error: string = '';

  // Font Awesome Icons
  faArrowLeft = faArrowLeft;
  faEdit = faEdit;
  faTrash = faTrash;
  faBoxes = faBoxes;
  faUser = faUser;
  faCalendarAlt = faCalendarAlt;
  faDollarSign = faDollarSign;
  faSpinner = faSpinner;
  faPrint = faPrint;

  constructor(
    private purchaseOrderService: PurchaseOrderService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPurchaseOrder();
  }

  loadPurchaseOrder(): void {
    this.loading = true;
    this.error = '';

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID đơn nhập hàng không hợp lệ';
      this.loading = false;
      return;
    }

    this.purchaseOrderService.getPurchaseOrder(+id).subscribe({
      next: (data) => {
        this.purchaseOrder = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải chi tiết đơn nhập hàng:', error);
        this.error = 'Không thể tải chi tiết đơn nhập hàng';
        this.loading = false;
      }
    });
  }

  deletePurchaseOrder(): void {
    if (!this.purchaseOrder) return;

    if (confirm('Bạn có chắc chắn muốn xóa đơn nhập hàng này?')) {
      this.purchaseOrderService.deletePurchaseOrder(this.purchaseOrder.id).subscribe({
        next: () => {
          alert('Xóa đơn nhập hàng thành công!');
          this.router.navigate(['/adminDashboard/purchase-order']);
        },
        error: (error) => {
          console.error('Lỗi khi xóa đơn nhập hàng:', error);
          alert('Lỗi khi xóa đơn nhập hàng');
        }
      });
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTotalValue(): number {
    if (!this.purchaseOrder) return 0;
    return this.purchaseOrder.purchaseOrderDetails.reduce((total, detail) => total + detail.totalPrice, 0);
  }

  getTotalQuantity(): number {
    if (!this.purchaseOrder) return 0;
    return this.purchaseOrder.purchaseOrderDetails.reduce((total, detail) => total + detail.quantity, 0);
  }

  goBack(): void {
    this.router.navigate(['/adminDashboard/purchase-order']);
  }

  printPurchaseOrder(): void {
    window.print();
  }
}

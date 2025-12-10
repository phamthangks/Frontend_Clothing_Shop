import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faPlus, 
  faEye, 
  faEdit, 
  faTrash, 
  faSearch,
  faBoxes,
  faCalendarAlt,
  faUser,
  faDollarSign
} from '@fortawesome/free-solid-svg-icons';
import { PurchaseOrderService } from '../../../services/admin/purchase-order.service';
import { PurchaseOrder } from '../../../dto/purchaseOrder.dto';

@Component({
  selector: 'app-purchase-order-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FontAwesomeModule],
  templateUrl: './purchase-order-admin.component.html',
  styleUrls: ['./purchase-order-admin.component.scss']
})
export class PurchaseOrderAdminComponent implements OnInit {
  purchaseOrders: PurchaseOrder[] = [];
  filteredPurchaseOrders: PurchaseOrder[] = [];
  searchTerm: string = '';
  loading: boolean = false;
  statistics: any = {};

  // Font Awesome Icons
  faPlus = faPlus;
  faEye = faEye;
  faEdit = faEdit;
  faTrash = faTrash;
  faSearch = faSearch;
  faBoxes = faBoxes;
  faCalendarAlt = faCalendarAlt;
  faUser = faUser;
  faDollarSign = faDollarSign;

  constructor(private purchaseOrderService: PurchaseOrderService) { }

  ngOnInit(): void {
    this.loadPurchaseOrders();
    this.loadStatistics();
  }

  loadPurchaseOrders(): void {
    this.loading = true;
    console.log('Đang tải danh sách đơn nhập hàng...');
    this.purchaseOrderService.getPurchaseOrders().subscribe({
      next: (data) => {
        console.log('Dữ liệu nhận được:', data);
        this.purchaseOrders = data;
        this.filteredPurchaseOrders = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách đơn nhập hàng:', error);
        this.loading = false;
      }
    });
  }

  loadStatistics(): void {
    this.purchaseOrderService.getPurchaseOrderStatistics().subscribe({
      next: (data) => {
        this.statistics = data;
      },
      error: (error) => {
        console.error('Lỗi khi tải thống kê:', error);
      }
    });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPurchaseOrders = this.purchaseOrders;
      return;
    }

    this.filteredPurchaseOrders = this.purchaseOrders.filter(po =>
      po.supplierName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      po.note?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      po.user?.fullname.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  deletePurchaseOrder(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa đơn nhập hàng này?')) {
      this.purchaseOrderService.deletePurchaseOrder(id).subscribe({
        next: () => {
          this.loadPurchaseOrders();
          this.loadStatistics();
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
    return new Date(date).toLocaleDateString('vi-VN');
  }

  getTotalValue(purchaseOrder: PurchaseOrder): number {
    return purchaseOrder.purchaseOrderDetails.reduce((total, detail) => total + detail.totalPrice, 0);
  }
}

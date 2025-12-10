import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  AddressService,
  ShippingAddress,
} from '../../services/address.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-address-dialog',
  imports: [CommonModule],
  templateUrl: './address-dialog.component.html',
  styleUrl: './address-dialog.component.scss',
})
export class AddressDialogComponent implements OnInit {
  addresses: ShippingAddress[] = [];
  selectedAddress: ShippingAddress | null = null;

  constructor(
    private addressService: AddressService,
    private dialogRef: MatDialogRef<AddressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { phoneNumber: string } // nhận dữ liệu truyền vào
  ) {}

  ngOnInit(): void {
    this.addressService.getShippingAddresses().subscribe({
      next: (result: any) => {
        this.addresses = result.data.sort(
          (a: any, b: any) => Number(b.isDefault) - Number(a.isDefault)
        );
        // Nếu có dữ liệu phoneNumber được truyền vào
        if (this.data && this.data.phoneNumber) {
          // Tìm địa chỉ có số điện thoại trùng khớp
          const matchedAddress = this.addresses.find(
            (addr) => addr.phoneNumber === this.data.phoneNumber
          );
          // Nếu tìm thấy, chọn nó làm mặc định, ngược lại chọn địa chỉ đầu tiên
          this.selectedAddress = matchedAddress
            ? matchedAddress
            : this.addresses[0];
        } else {
          this.selectedAddress = this.addresses[0];
        }
      },
      error: (err) => console.error(err),
    });
  }

  // Gán địa chỉ user chọn vào biến tạm
  selectAddress(addr: ShippingAddress) {
    this.selectedAddress = addr;
  }

  // Khi nhấn nút Xác nhận, ta đóng dialog, trả về địa chỉ đã chọn
  confirm() {
    if (this.selectedAddress) {
      this.dialogRef.close(this.selectedAddress);
    } else {
      // Tuỳ ý hiển thị alert hoặc không làm gì
      alert('Bạn chưa chọn địa chỉ nào!');
    }
  }

  // Nếu muốn đóng mà không chọn
  close() {
    this.dialogRef.close(null);
  }
}

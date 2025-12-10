import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  AddressService,
  ShippingAddress,
} from '../../services/address.service';

declare var H: any;

@Component({
  selector: 'app-address',
  imports: [FormsModule, CommonModule, RouterModule],
  standalone: true,
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
})
export class AddressComponent implements OnInit, AfterViewInit, OnDestroy {
  addresses: ShippingAddress[] = [];
  showEditModal: boolean = false;
  showAddModal: boolean = false;

  currentAddress: ShippingAddress = {
    id: 0,
    fullname: '',
    phoneNumber: '',
    address: '',
    isDefault: false,
    lat: 21.0278, // Mặc định Hà Nội
    lon: 105.8342,
  };

  suggestions: any[] = [];
  hovered: any;

  // Map & Marker cho modal Add
  mapAdd: any;
  markerAdd: any;
  // Map & Marker cho modal Edit
  mapEdit: any;
  markerEdit: any;

  addressControl = new FormControl('');

  constructor(
    private addressService: AddressService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  async ngAfterViewInit(): Promise<void> {
    // Map sẽ được khởi tạo khi mở modal, nên không cần làm gì ở đây
  }

  ngOnDestroy(): void {
    if (this.mapAdd) {
      this.mapAdd.dispose();
    }
    if (this.mapEdit) {
      this.mapEdit.dispose();
    }
  }

  ngOnInit(): void {
    // Lắng nghe thay đổi của addressControl (nếu bạn dùng Control thay vì [(ngModel)])
    this.addressControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((value) => {
        this.currentAddress.address = value || '';
        this.onAddressInput();
      });

    this.loadAddresses();
  }

  /**
   * Hàm gọi API autocomplete để gợi ý địa chỉ
   */
  onAddressInput(): void {
    if (this.currentAddress.address.trim().length < 3) {
      this.suggestions = [];
      return;
    }
    this.addressService
      .getAutocompleteResults(this.currentAddress.address)
      .subscribe({
        next: (data) => {
          console.log('Autocomplete data:', data);
          this.ngZone.run(() => {
            this.suggestions = (data.items || []).map((item: any) => ({
              title: item.title,
              addressLabel: item.address ? item.address.label : '',
            }));
          });
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error fetching suggestions:', error);
        },
      });
  }

  /**
   * Khi click chọn gợi ý trong danh sách
   */
  selectSuggestion(suggestion: any): void {
    this.currentAddress.address = suggestion.title;
    this.suggestions = [];

    // Gọi geocode để lấy toạ độ
    this.addressService.getGeocodeResults(suggestion.title).subscribe({
      next: (data) => {
        if (data.items && data.items.length > 0) {
          const { lat, lng } = data.items[0].position;
          this.currentAddress.lat = lat;
          this.currentAddress.lon = lng;

          // Cập nhật marker (nếu modal đang mở)
          this.updateMarkerPosition(lat, lng);
        } else {
          console.error('Không tìm thấy tọa độ cho địa chỉ này');
        }
      },
      error: (error) => console.error('Error fetching geocode results:', error),
    });
  }

  /**
   * Hàm xác thực địa chỉ trước khi lưu
   * => Trả về Promise<boolean>
   */
  verifyAddress(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const address = this.currentAddress.address?.trim();

      if (!address || address.length < 10) {
        // Độ dài tối thiểu của địa chỉ
        alert('Vui lòng nhập địa chỉ đầy đủ để xác thực!');
        return resolve(false);
      }

      this.addressService.getGeocodeResults(address).subscribe({
        next: (data) => {
          if (data.items && data.items.length > 0) {
            const item = data.items[0];

            // Kiểm tra xem địa chỉ có đầy đủ không (ví dụ: có tên đường, thành phố, quốc gia)
            if (
              !item.address ||
              !item.address.street ||
              !item.address.city ||
              !item.address.countryName
            ) {
              alert('Địa chỉ không đầy đủ. Vui lòng nhập lại.');
              return resolve(false);
            }

            this.ngZone.run(() => {
              this.currentAddress.lat = item.position.lat;
              this.currentAddress.lon = item.position.lng;
            });

            alert(`Địa chỉ hợp lệ: ${item.address.label}`);
            this.updateMarkerPosition(
              this.currentAddress.lat!,
              this.currentAddress.lon!
            );
            resolve(true);
          } else {
            alert('Địa chỉ không hợp lệ. Vui lòng kiểm tra lại.');
            resolve(false);
          }
        },
        error: (error) => {
          console.error('Error verifying address:', error);
          alert('Có lỗi xảy ra khi xác thực địa chỉ.');
          reject(false);
        },
      });
    });
  }

  /**
   * Hàm cập nhật vị trí marker trên map Add hoặc map Edit
   */
  private updateMarkerPosition(lat: number, lng: number): void {
    // Nếu đang mở modal Add
    if (this.mapAdd && this.markerAdd) {
      this.markerAdd.setGeometry({ lat, lng });
      this.mapAdd.setCenter({ lat, lng });
    }
    // Nếu đang mở modal Edit
    if (this.mapEdit && this.markerEdit) {
      this.markerEdit.setGeometry({ lat, lng });
      this.mapEdit.setCenter({ lat, lng });
    }
  }

  /**
   * Lưu địa chỉ mới (Add Address)
   */
  async saveNewAddress(): Promise<void> {
    if (
      !this.currentAddress.fullname ||
      !this.currentAddress.phoneNumber ||
      !this.currentAddress.address
    ) {
      alert('Vui lòng điền đầy đủ các trường!');
      return;
    }

    const phonePattern = /^[0-9]{10}$/;
    if (!phonePattern.test(this.currentAddress.phoneNumber)) {
      alert('Vui lòng nhập số điện thoại hợp lệ (10 số).');
      return;
    }

    // Xác thực địa chỉ
    const isValid = await this.verifyAddress().catch(() => false);
    if (!isValid) {
      return;
    }

    // Gửi payload
    const payload = {
      Fullname: this.currentAddress.fullname,
      PhoneNumber: this.currentAddress.phoneNumber,
      Address: this.currentAddress.address,
      Latitude: this.currentAddress.lat,
      Longitude: this.currentAddress.lon,
    };

    this.addressService.addNewAddress(payload).subscribe({
      next: (result) => {
        if (result.success) {
          alert(result.message);
          this.closeAddModal();
          this.loadAddresses();
        } else {
          alert('Thêm địa chỉ thất bại');
        }
      },
      error: (error) => console.error('Error adding address:', error),
    });
  }

  /**
   * Lưu chỉnh sửa địa chỉ (Edit Address)
   */
  async saveEditAddress(): Promise<void> {
    if (
      !this.currentAddress.fullname ||
      !this.currentAddress.phoneNumber ||
      !this.currentAddress.address
    ) {
      alert('Vui lòng điền đầy đủ các trường!');
      return;
    }

    const phonePattern = /^[0-9]{10}$/;
    if (!phonePattern.test(this.currentAddress.phoneNumber)) {
      alert('Vui lòng nhập số điện thoại hợp lệ (10 số).');
      return;
    }

    // Xác thực địa chỉ
    const isValid = await this.verifyAddress().catch(() => false);
    if (!isValid) {
      return;
    }

    const payload = {
      Id: this.currentAddress.id,
      Fullname: this.currentAddress.fullname,
      PhoneNumber: this.currentAddress.phoneNumber,
      Address: this.currentAddress.address,
    };

    this.addressService.editAddress(payload).subscribe({
      next: (result) => {
        if (result.success) {
          alert(result.message);
          this.closeEditModal();
          this.loadAddresses();
        } else {
          alert(result.message || 'Cập nhật địa chỉ thất bại');
        }
      },
      error: (error) => {
        console.error('Error updating address:', error);
        alert('Có lỗi xảy ra khi cập nhật địa chỉ');
      },
    });
  }

  /**
   * Lấy danh sách địa chỉ từ server
   */
  loadAddresses(): void {
    this.addressService.getShippingAddresses().subscribe({
      next: (result: any) => {
        if (result.success) {
          // Sắp xếp để địa chỉ mặc định lên đầu
          this.addresses = result.data.sort(
            (a: any, b: any) => Number(b.isDefault) - Number(a.isDefault)
          );
        } else {
          console.error('Failed to load addresses:', result.message);
        }
      },
      error: (error) => console.error('Error loading addresses:', error),
    });
  }

  /**
   * Mở modal Add
   */
  openAddModal(): void {
    this.showAddModal = true;
    // Reset currentAddress
    this.currentAddress = {
      id: 0,
      fullname: '',
      phoneNumber: '',
      address: '',
      isDefault: false,
      lat: 21.0278,
      lon: 105.8342,
    };
    // Khởi tạo map Add
    setTimeout(() => this.initMap('mapAdd'), 0);
  }

  /**
   * Đóng modal Add
   */
  closeAddModal(): void {
    this.showAddModal = false;
    if (this.mapAdd) {
      this.mapAdd.dispose();
      this.mapAdd = undefined;
    }
    const mapContainer = document.getElementById('mapAdd');
    if (mapContainer) {
      mapContainer.innerHTML = '';
    }
  }

  /**
   * Mở modal Edit
   */
  openEditModal(address: ShippingAddress): void {
    this.currentAddress = { ...address };
    this.showEditModal = true;
    // Khởi tạo map Edit
    setTimeout(() => this.initMap('mapEdit'), 0);
  }

  /**
   * Đóng modal Edit
   */
  closeEditModal(): void {
    this.showEditModal = false;
    if (this.mapEdit) {
      this.mapEdit.dispose();
      this.mapEdit = undefined;
    }
    const mapContainer = document.getElementById('mapEdit');
    if (mapContainer) {
      mapContainer.innerHTML = '';
    }
  }

  /**
   * Khởi tạo HERE Map (Add hoặc Edit) dựa vào containerId
   */
  initMap(containerId: string): void {
    const mapContainer = document.getElementById(containerId);
    if (!mapContainer) {
      console.error('Không tìm thấy container map');
      return;
    }

    // Khởi tạo Platform
    const platform = new H.service.Platform({
      apikey: '89cJ9_Epa5IyhIrKo_UlMB_2A04Lt5IjlX0Il64Hrp4',
    });
    const defaultLayers = platform.createDefaultLayers();

    // Tạo instance bản đồ
    const mapInstance = new H.Map(
      mapContainer,
      defaultLayers.vector.normal.map,
      {
        center: {
          lat: this.currentAddress.lat || 21.0278,
          lng: this.currentAddress.lon || 105.8342,
        },
        zoom: 13,
        pixelRatio: window.devicePixelRatio || 1,
      }
    );

    // Thêm các tương tác map
    const mapEvents = new H.mapevents.MapEvents(mapInstance);
    new H.mapevents.Behavior(mapEvents);

    // Tạo UI
    H.ui.UI.createDefault(mapInstance, defaultLayers);

    // Thêm marker
    const markerInstance = new H.map.Marker(
      {
        lat: this.currentAddress.lat || 21.0278,
        lng: this.currentAddress.lon || 105.8342,
      },
      { volatility: true }
    );
    mapInstance.addObject(markerInstance);

    // Lưu lại map & marker cho Add/Edit
    if (containerId === 'mapAdd') {
      this.mapAdd = mapInstance;
      this.markerAdd = markerInstance;
    } else if (containerId === 'mapEdit') {
      this.mapEdit = mapInstance;
      this.markerEdit = markerInstance;
    }

    let dragOrigin: any = null;

    // pointerdown => cho phép kéo
    mapInstance.addEventListener('pointerdown', (evt: any) => {
      const target = evt.target;
      if (target instanceof H.map.Marker) {
        dragOrigin = evt.currentPointer;
        target.draggable = true;
      }
    });

    // pointermove => di chuyển marker
    mapInstance.addEventListener('pointermove', (evt: any) => {
      if (!dragOrigin) return;
      const pointer = evt.currentPointer;
      const deltaX = pointer.viewportX - dragOrigin.viewportX;
      const deltaY = pointer.viewportY - dragOrigin.viewportY;
      const markerPos = mapInstance.geoToScreen(markerInstance.getGeometry());
      const newScreenPos = {
        x: markerPos.x + deltaX,
        y: markerPos.y + deltaY,
      };
      const newGeoPos = mapInstance.screenToGeo(newScreenPos.x, newScreenPos.y);
      markerInstance.setGeometry(newGeoPos);
      dragOrigin = pointer;
    });

    // pointerup => cập nhật toạ độ sau khi kéo xong
    mapInstance.addEventListener('pointerup', () => {
      if (markerInstance) {
        const geo = markerInstance.getGeometry();
        this.ngZone.run(() => {
          this.currentAddress.lat = geo.lat;
          this.currentAddress.lon = geo.lng;
        });
      }
      dragOrigin = null;
    });

    // tap => click lên map => di chuyển marker
    mapInstance.addEventListener('tap', (evt: any) => {
      const pointer = evt.currentPointer;
      const geo = mapInstance.screenToGeo(pointer.viewportX, pointer.viewportY);
      markerInstance.setGeometry(geo);
      this.ngZone.run(() => {
        this.currentAddress.lat = geo.lat;
        this.currentAddress.lon = geo.lng;
      });
    });

    // Cập nhật kích thước
    setTimeout(() => {
      mapInstance.getViewPort().resize();
    }, 0);
  }

  /**
   * Xoá địa chỉ
   */
  deleteAddress(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa địa chỉ này không?')) {
      this.addressService.deleteAddress(id).subscribe({
        next: (result) => {
          if (result.success) {
            alert(result.message);
            this.loadAddresses();
          } else {
            alert('Xóa địa chỉ thất bại');
          }
        },
        error: (error) => console.error('Error deleting address:', error),
      });
    }
  }

  /**
   * Đặt địa chỉ mặc định
   */
  setDefaultAddress(id: number): void {
    this.addressService.setDefaultAddress(id).subscribe({
      next: (result) => {
        if (result.success) {
          this.loadAddresses();
        } else {
          alert('Đặt địa chỉ mặc định thất bại');
        }
      },
      error: (error) => console.error('Error setting default address:', error),
    });
  }
}

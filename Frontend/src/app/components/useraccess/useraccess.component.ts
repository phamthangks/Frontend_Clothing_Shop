import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-useraccess',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './useraccess.component.html',
  styleUrls: ['./useraccess.component.scss'],
})
export class UseraccessComponent implements OnInit, OnDestroy {
  dropdownOpen: boolean = false;
  hasAccessToken: boolean = false;
  private intervalCheck: any;

  constructor() {}

  ngOnInit(): void {
    this.checkAccessToken();

    // Kiểm tra cookie mỗi 500ms để cập nhật giao diện ngay lập tức khi có thay đổi
    this.intervalCheck = setInterval(() => {
      this.checkAccessToken();
    }, 500);
  }

  ngOnDestroy(): void {
    // Xóa interval khi component bị hủy để tránh rò rỉ bộ nhớ
    clearInterval(this.intervalCheck);
  }

  checkAccessToken(): void {
    const hasToken = document.cookie.includes('accessToken=');
    if (this.hasAccessToken !== hasToken) {
      this.hasAccessToken = hasToken;
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('#userAccountDropdown')) {
      this.dropdownOpen = false;
    }
  }
}

import { CommonModule } from '@angular/common';
import { Component, Renderer2, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { AccountService, Account } from '../../../services/account.service';
import { UserService } from '../../../services/admin/user.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBoxes,
  faTags,
  faTshirt,
  faUsers,
  faShoppingCart,
  faAngleLeft,
  faAngleRight,
  faChartLine,
  faSearch,
  faBell,
  faUserCircle,
  faChevronDown,
  faUser,
  faCog,
  faSignOutAlt,
  faHome,
  faInfoCircle,
  faTimes,
  faLayerGroup,
  faTruck,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, RouterOutlet, CommonModule, FontAwesomeModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit, OnDestroy {
  userName: string = '';
  private linkElements: HTMLLinkElement[] = [];
  isCollapsed = false;
  showUserDropdown = false;
  showMobileSearch = false;
  showSearch = false;
  isMobileView = false;

  // Font Awesome Icons
  faAngleLeft = faAngleLeft;
  faAngleRight = faAngleRight;
  faSearch = faSearch;
  faBell = faBell;
  faUserCircle = faUserCircle;
  faChevronDown = faChevronDown;
  faUser = faUser;
  faCog = faCog;
  faSignOutAlt = faSignOutAlt;
  faHome = faHome;
  faTshirt = faTshirt;
  faShoppingCart = faShoppingCart;
  faChartLine = faChartLine;
  faInfoCircle = faInfoCircle;
  faTimes = faTimes;
  faLayerGroup = faLayerGroup;
  faTruck = faTruck;

  navItems = [
    { label: 'Thương hiệu', link: '/adminDashboard/brand', icon: faBoxes, badge: null },
    { label: 'Danh mục', link: '/adminDashboard/category', icon: faTags, badge: null },
    { label: 'Sản phẩm', link: '/adminDashboard/product', icon: faTshirt, badge: null },
    { label: 'Biến thể sản phẩm', link: '/adminDashboard/product-variant', icon: faLayerGroup, badge: null },
    { label: 'Nhập hàng', link: '/adminDashboard/purchase-order', icon: faTruck, badge: null },
    { label: 'Người dùng', link: '/adminDashboard/users', icon: faUsers, badge: null },
    { label: 'Đơn hàng', link: '/adminDashboard/order', icon: faShoppingCart, badge: '12' },
    { label: 'Thống kê', link: '/adminDashboard/statistics', icon: faChartLine, badge: null },
  ];

  constructor(
    private renderer: Renderer2,
    private userService: UserService,
    private router: Router
  ) {
    this.checkMobileView();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?: any) {
    this.checkMobileView();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.showUserDropdown = false;
    }
  }

  checkMobileView() {
    this.isMobileView = window.innerWidth <= 768;
    if (this.isMobileView) {
      this.isCollapsed = true;
    }
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      this.renderer.addClass(document.body, 'sidebar-collapse');
    } else {
      this.renderer.removeClass(document.body, 'sidebar-collapse');
    }
  }

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
  }

  toggleMobileSearch() {
    this.showMobileSearch = !this.showMobileSearch;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    // 1) Load CSS như trước
    const links = [
      'https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback',
      'assets/AdminLTE-master/dist/css/adminlte.min.css',
    ];
    links.forEach((linkHref) => {
      const linkEl = this.renderer.createElement('link');
      this.renderer.setAttribute(linkEl, 'rel', 'stylesheet');
      this.renderer.setAttribute(linkEl, 'href', linkHref);
      this.renderer.appendChild(document.head, linkEl);
      this.linkElements.push(linkEl);
    });

    this.userService.getCurrentUserName().subscribe({
      next: (name: string) => {
        this.userName = name;
      },
      error: (err) => {
        console.error('Không lấy được tên user:', err);
      },
    });
  }

  ngOnDestroy(): void {
    this.linkElements.forEach((linkEl) =>
      this.renderer.removeChild(document.head, linkEl)
    );
  }

  toggleSearch(): void {
    this.showSearch = !this.showSearch;
  }
}

import { Component, Renderer2 } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { LoginComponent } from '../login/login.component';
@Component({
  selector: 'app-layout-admin',
  standalone: true,
  imports: [RouterModule, RouterOutlet],
  templateUrl: './layout-admin.component.html',
  styleUrls: ['./layout-admin.component.scss'],
})
export class LayoutAdminComponent {
  // Mảng lưu các phần tử <link> đã thêm vào head
  private linkElements: HTMLLinkElement[] = [];

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    const links = [
      'https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback',
      'https://fonts.googleapis.com/css?family=Open+Sans:300,400|Source+Code+Pro:700,900&display=swap',
      'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css',
      'assets/AdminLTE-master/plugins/fontawesome-free/css/all.min.css',
      'assets/AdminLTE-master/plugins/icheck-bootstrap/icheck-bootstrap.min.css',
      'assets/AdminLTE-master/dist/css/adminlte.min.css',
    ];

    links.forEach((linkHref) => {
      const linkEl = this.renderer.createElement('link');
      this.renderer.setAttribute(linkEl, 'rel', 'stylesheet');
      this.renderer.setAttribute(linkEl, 'href', linkHref);
      // Thêm phần tử <link> vào <head>
      this.renderer.appendChild(document.head, linkEl);
      this.linkElements.push(linkEl);
    });
  }

  ngOnDestroy(): void {
    // Loại bỏ các <link> khi component bị hủy để không ảnh hưởng tới giao diện khác
    this.linkElements.forEach((linkEl) => {
      this.renderer.removeChild(document.head, linkEl);
    });
  }
}

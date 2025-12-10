// layouts.component.ts
import { Component, Renderer2 } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { UseraccessComponent } from '../useraccess/useraccess.component';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { ChatbotComponent } from '../chatbot/chatbot.component';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-layouts',
  standalone: true, 
  imports: [RouterModule,CommonModule, RouterOutlet, HeaderComponent, FooterComponent,ChatbotComponent], // Import RouterModule để sử dụng router-outlet
  templateUrl: './layouts.component.html',
  styleUrls: ['./layouts.component.scss'],
})
export class LayoutsComponent {
  // Mảng lưu các phần tử <link> đã thêm vào head
  showChat = false;
  toggleChat() {
    this.showChat = !this.showChat;
    console.log('showChat =', this.showChat);
  }
  private linkElements: HTMLLinkElement[] = [];

  constructor(private renderer: Renderer2) {}

  ngOnInit(): void {
    const links = [
      'https://fonts.googleapis.com/css?family=Open+Sans:300,400|Source+Code+Pro:700,900&display=swap',
      'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.10.0/css/all.min.css',
      'assets/lib/slick/slick.css',
      'assets/lib/slick/slick-theme.css',
      'assets/css/style.css',
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

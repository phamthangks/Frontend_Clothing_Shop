// src/app/components/chatbot/chatbot.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule }              from '@angular/common';
import { FormsModule }               from '@angular/forms';    // <-- import vào đây
import { RouterModule }              from '@angular/router';

@Component({
  selector: 'app-chatbot',
  standalone: true,                   // <-- bật standalone
  imports: [
    CommonModule,                     // cho *ngIf, *ngFor nếu có
    FormsModule,                      // cho [(ngModel)]
    RouterModule                      // nếu bạn dùng routerLink bên trong
  ],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent {
  @Output() closed = new EventEmitter<void>();
  userMsg = '';
  messages: Array<{ from: 'user'|'bot', text: string }> = [];

  send() {
    if (!this.userMsg.trim()) return;
    this.messages.push({ from: 'user', text: this.userMsg });
    // TODO: call API chatbot, đẩy phản hồi về messages
    this.userMsg = '';
  }

  close() {
    this.closed.emit();
  }
}

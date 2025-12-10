import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss']
})
export class StatCardComponent {
  @Input() title!: string;
  @Input() value: string | number = 0;  // Allow string (for formatted values like 'VNĐ') and number
  @Input() bgColor: string = 'primary';
  /** optional: allow passing a custom number format */
  @Input() format: string = '1.0-0';
  @Input() isCurrency: boolean = false;
}

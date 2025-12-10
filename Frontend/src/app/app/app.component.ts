import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { LoaderService } from '../services/loader.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  // Khai báo isLoading$ là một Observable<boolean>
  isLoading$: Observable<boolean>;

  constructor(private loaderService: LoaderService) {
    // Gán isLoading$ giá trị từ LoaderService
    this.isLoading$ = this.loaderService.isLoading.asObservable();
  }
}

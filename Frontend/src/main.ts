import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app/app.component';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    // Đặt thời gian chờ trước khi ẩn spinner, ví dụ 2 giây (2000ms)
    setTimeout(() => {
      const loader = document.getElementById('app-loading');
      if (loader) {
        loader.style.display = 'none';
      }
    }, 300);
  })
  .catch((err) => console.error(err));

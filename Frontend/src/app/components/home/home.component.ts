import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// declare var $: any; // Import jQuery nếu bạn đang dùng jQuery

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule], // Đúng cách
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  products: any[] = [];
  // Base URL for images
  private baseImageUrl = 'https://localhost:7163';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getTopSellingProducts();
  }

  // Lấy 30 sản phẩm bán chạy nhất
  getTopSellingProducts(): void {
    this.http.get<any>('https://localhost:7163/api/products/top-selling?limit=30').subscribe({
      next: (data) => {
        console.log('Top selling products:', data);
        // Kiểm tra nếu có thuộc tính $values thì gán nó cho products, ngược lại gán data trực tiếp
        this.products = data.$values ? data.$values : data;
        // Đảm bảo chỉ lấy 30 sản phẩm đầu tiên
        if (this.products.length > 30) {
          this.products = this.products.slice(0, 30);
        }
      },
      error: (error) => {
        console.error('Lỗi khi lấy sản phẩm bán chạy:', error);
        // Fallback: nếu API lỗi, load tất cả sản phẩm
        this.getAllProducts();
      },
    });
  }

  // Fallback method nếu API top-selling lỗi
  getAllProducts(): void {
    this.http.get<any>('https://localhost:7163/api/products/all').subscribe({
      next: (data) => {
        console.log(data);
        // Kiểm tra nếu có thuộc tính $values thì gán nó cho products, ngược lại gán data trực tiếp
        const allProducts = data.$values ? data.$values : data;
        // Chỉ lấy 30 sản phẩm đầu tiên
        this.products = allProducts.slice(0, 30);
      },
      error: (error) => {
        console.error('Lỗi khi lấy sản phẩm:', error);
      },
    });
  }
  sliderImages = [
    {
      imageUrl: 'assets/img/slider-1.jpg',
      caption: 'Khám phá những bộ sưu tập thời trang độc đáo',
    },
    // {
    //   imageUrl: 'assets/img/slider-2.jpg',
    //   caption: 'Some text goes here that describes the image',
    // },
    // {
    //   imageUrl: 'assets/img/slider-3.jpg',
    //   caption: 'Some text goes here that describes the image',
    // },
  ];

  brandImages = [
    'assets/img/brand-1.png',
    'assets/img/brand-2.png',
    'assets/img/brand-3.png',
    'assets/img/brand-4.png',
    'assets/img/brand-5.png',
    'assets/img/brand-6.png',
  ];

  features = [
    {
      icon: 'fab fa-cc-mastercard',
      title: 'Thanh toán an toàn',
      description: 'Giao dịch bảo mật tuyệt đối.',
    },
    {
      icon: 'fa fa-truck',
      title: 'Giao hàng mọi nơi',
      description: 'Nhanh chóng, đúng hẹn.',
    },
    {
      icon: 'fa fa-sync-alt',
      title: 'Đổi trả trong 90 ngày',
      description: 'Đổi trả dễ dàng, linh hoạt.',
    },
    {
      icon: 'fa fa-comments',
      title: 'Hỗ trợ 24/7',
      description: 'Luôn sẵn sàng hỗ trợ bạn.',
    },
  ];  

  categories = [
    {
      imageUrl: 'assets/img/category-1.jpg',
      caption: 'Phong cách thanh lịch cho mọi dịp – Tự tin tỏa sáng mỗi ngày',
      heightClass: 'ch-400',
    },
    {
      imageUrl: 'assets/img/category-2.jpg',
      caption: 'Thời trang năng động, trẻ trung – Bắt kịp xu hướng mới nhất',
      heightClass: 'ch-400',
    },
    {
      imageUrl: 'assets/img/category-3.jpg',
      caption: 'Sự kết hợp hoàn hảo giữa thoải mái và đẳng cấp',
      heightClass: 'ch-400',
    },
    {
      imageUrl: 'assets/img/category-2.jpg',
      caption: 'Khám phá bộ sưu tập mới – Cập nhật phong cách riêng của bạn',
      heightClass: 'ch-400',
    },
  ];

  // Get full image URL
  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return 'assets/img/placeholder.jpg';
    // Nếu đã là URL đầy đủ (http/https), trả về như cũ
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // Nếu bắt đầu bằng /, là relative URL, thêm base URL
    if (imageUrl.startsWith('/')) {
      return this.baseImageUrl + imageUrl;
    }
    // Nếu chỉ là tên file, thêm đường dẫn đầy đủ
    return `${this.baseImageUrl}/uploads/image/${imageUrl}`;
  }

  // products = [
  //   { id: 1, name: 'Product 1', image: 'product-1.jpg', price: 100 },
  //   { id: 2, name: 'Product 2', image: 'product-2.jpg', price: 150 },
  //   { id: 3, name: 'Product 3', image: 'product-3.jpg', price: 200 },
  // ];
  // ngAfterViewInit(): void {
  //   $('.header-slider').slick({
  //     infinite: true,
  //     slidesToShow: 1,
  //     slidesToScroll: 1,
  //     autoplay: true,
  //     autoplaySpeed: 3000,
  //     dots: true,
  //     arrows: true, // Hiển thị mũi tên
  //     prevArrow: '<button type="button" class="slick-prev">❮</button>',
  //     nextArrow: '<button type="button" class="slick-next">❯</button>',
  //   });
  //   $('.brand-slider').slick({
  //     infinite: true, // Lặp lại vô hạn
  //     slidesToShow: 5, // Số logo hiển thị trên một slide
  //     slidesToScroll: 1, // Dịch chuyển từng logo
  //     autoplay: true, // Tự động chạy
  //     autoplaySpeed: 0, // Không có độ trễ giữa các lần lặp
  //     speed: 3000, // Tốc độ chạy (ms)
  //     cssEase: 'linear', // Chạy mượt liên tục
  //     arrows: false, // Ẩn mũi tên điều hướng
  //     dots: false, // Ẩn chấm điều hướng
  //     pauseOnHover: false, // Không dừng khi hover
  //   });
  //   this.initSlickSlider();
  // }
  // initSlickSlider(): void {
  //   $('.product-slider').slick({
  //     infinite: true,
  //     slidesToShow: 4,
  //     slidesToScroll: 1,
  //     autoplay: true,
  //     autoplaySpeed: 3000,
  //     dots: false,
  //     arrows: true, // Hiển thị mũi tên
  //     prevArrow: '<button type="button" class="slick-prev">❮</button>',
  //     nextArrow: '<button type="button" class="slick-next">❯</button>',
  //     responsive: [
  //       { breakpoint: 1024, settings: { slidesToShow: 3 } },
  //       { breakpoint: 768, settings: { slidesToShow: 2 } },
  //       { breakpoint: 480, settings: { slidesToShow: 1 } },
  //     ],
  //   });
  // }


}

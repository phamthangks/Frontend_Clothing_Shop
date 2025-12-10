import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AccountService, ReviewRequest } from '../../services/account.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-review-dialog',
  templateUrl: './review-dialog.component.html',
  styleUrls: ['./review-dialog.component.scss'],
  imports: [CommonModule, FormsModule, MatSnackBarModule],
})
export class ReviewDialogComponent implements OnInit {
  rating: number = 0;
  reviewText: string = '';
  mediaFiles: File[] = [];
  previewUrls: SafeUrl[] = [];

  constructor(
    public dialogRef: MatDialogRef<ReviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private snackBar: MatSnackBar,
    private accountService: AccountService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Nếu có dữ liệu review (chế độ chỉnh sửa) thì prefill rating và reviewText
    if (this.data.review) {
      this.rating = this.data.review.rating;
      this.reviewText = this.data.review.reviewText;
      // Nếu có media trong review, bạn có thể hiển thị preview (lưu ý media không phải là File, mà là URL)
      if (this.data.review.media && this.data.review.media.length) {
        this.previewUrls = this.data.review.media.map((m: any) =>
          this.sanitizer.bypassSecurityTrustUrl(m.mediaUrl)
        );
      }
    }
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'video/mp4',
        'video/webm',
      ];
      const maxSize = 100 * 1024 * 1024; // 15MB
      const files = Array.from(event.target.files) as File[];
      files.forEach((file) => {
        if (!allowedTypes.includes(file.type)) {
          this.snackBar.open(
            `File ${file.name} không phải định dạng cho phép.`,
            '',
            {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['my-snackbar'],
            }
          );
          return;
        }
        if (file.size > maxSize) {
          this.snackBar.open(
            `File ${file.name} vượt quá giới hạn kích thước.`,
            '',
            {
              duration: 3000,
              horizontalPosition: 'right',
              verticalPosition: 'top',
              panelClass: ['my-snackbar'],
            }
          );
          return;
        }
        this.mediaFiles.push(file);
        const url = URL.createObjectURL(file);
        const safeUrl = this.sanitizer.bypassSecurityTrustUrl(url);
        this.previewUrls.push(safeUrl);
      });
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 0);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    const reviewRequest: ReviewRequest = {
      productId: this.data.product.productId,
      rating: this.rating,
      reviewText: this.reviewText,
      mediaFiles: this.mediaFiles,
    };

    if (this.rating <= 0) {
      this.snackBar.open('Vui lòng chọn số sao đánh giá.', '', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
        panelClass: ['my-snackbar'],
      });
      return;
    }

    if (this.data.review) {
      // Chế độ chỉnh sửa review: gọi API updateReview
      // Có thể cần thêm reviewId vào reviewRequest nếu API yêu cầu
      // reviewRequest.reviewId = this.data.review.reviewId; // nếu cần
      this.accountService.updateReview(reviewRequest).subscribe({
        next: (response) => {
          this.snackBar.open('Cập nhật đánh giá thành công!', '', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['my-snackbar'],
          });
          this.dialogRef.close(response);
        },
        error: (error) => {
          this.snackBar.open(error.error, '', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['my-snackbar'],
          });
          console.error(error);
        },
      });
    } else {
      // Chế độ tạo review mới
      this.accountService.addReview(reviewRequest).subscribe({
        next: (response) => {
          this.snackBar.open('Đánh giá đã gửi thành công!', '', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['my-snackbar'],
          });
          this.dialogRef.close(response);
        },
        error: (error) => {
          this.snackBar.open(error.error, '', {
            duration: 3000,
            horizontalPosition: 'right',
            verticalPosition: 'top',
            panelClass: ['my-snackbar'],
          });
          console.error(error);
        },
      });
    }
  }

  // Base URL for images
  private baseImageUrl = 'https://localhost:7163';

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
}

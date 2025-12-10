import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface SearchResult {
  id: number | null;
  name: string | null;
  price: number | null;
  description: string | null;
  image: string;
  distance: number;
}

@Injectable({
  providedIn: 'root'
})
export class ImageSearchService {
  private readonly apiUrl = 'http://localhost:5000/search-by-image/';

  constructor(private http: HttpClient) {}

  /**
   * Gửi file ảnh lên API và nhận danh sách products
   */
  searchByImage(file: File): Observable<SearchResult[]> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<{ results: any[] }>(this.apiUrl, formData)
      .pipe(
        map(response => response.results as SearchResult[]),
        catchError(this.handleError)
      );
  }

  /**
   * Theo dõi tiến trình upload (tuỳ chọn)
   */
  searchByImageWithProgress(file: File): Observable<number> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(this.apiUrl, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            return Math.round((event.loaded / (event.total || 1)) * 100);
          case HttpEventType.Response:
            return 100; // Completed
          default:
            return 0;
        }
      }),
      catchError(err => {
        console.error('Upload error:', err);
        // Trả về 0% nếu có lỗi
        return of(0);
      })
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('ImageSearchService error:', error);
    return throwError(() => new Error(
      error.error?.message || 'Có lỗi xảy ra khi tìm kiếm ảnh'
    ));
  }
}

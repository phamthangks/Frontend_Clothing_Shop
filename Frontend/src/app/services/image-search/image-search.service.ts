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

export interface SearchProgressResult {
  progress: number;
  results?: SearchResult[];
}

@Injectable({
  providedIn: 'root'
})
export class ImageSearchService {
  private readonly apiUrl = 'http://localhost:5000/search-by-image/';

  constructor(private http: HttpClient) {}

  /**
   * Gửi file ảnh lên API, theo dõi tiến trình upload và nhận danh sách products trong 1 request duy nhất.
   */
  searchByImage(file: File): Observable<SearchProgressResult> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<{ results: any[] }>(this.apiUrl, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map((event: HttpEvent<{ results: any[] }>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            return {
              progress: Math.round((event.loaded / (event.total || 1)) * 100)
            };
          case HttpEventType.Response:
            return {
              progress: 100,
              results: (event.body?.results || []) as SearchResult[]
            };
          default:
            return { progress: 0 };
        }
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('ImageSearchService error:', error);
    return throwError(() => new Error(
      error.error?.message || 'Có lỗi xảy ra khi tìm kiếm ảnh'
    ));
  }
}

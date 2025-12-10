import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ShippingAddress {
  id: number;
  fullname: string;
  phoneNumber: string;
  address: string;
  isDefault: boolean;
  lat?: number;
  lon?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private apiUrl = 'https://localhost:7163/api/MyAccountAPI';
  private apiKey = '89cJ9_Epa5IyhIrKo_UlMB_2A04Lt5IjlX0Il64Hrp4';
  constructor(private http: HttpClient) {}

  // Lấy danh sách địa chỉ giao hàng
  getShippingAddresses(): Observable<ShippingAddress[]> {
    return this.http.get<ShippingAddress[]>(
      `${this.apiUrl}/GetShippingAddresses`
    );
  }

  // Thêm địa chỉ mới
  addNewAddress(address: {
    Fullname: string;
    PhoneNumber: string;
    Address: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/AddNewAddress`, address);
  }

  // Chỉnh sửa địa chỉ
  editAddress(address: {
    Id: number;
    Fullname: string;
    PhoneNumber: string;
    Address: string;
  }): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/EditAddress`, address);
  }

  // Xóa địa chỉ
  deleteAddress(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/DeleteAddress`, {
      body: { Id: id },
    });
  }

  // Đặt địa chỉ làm mặc định
  setDefaultAddress(id: number): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/SetDefaultAddress`,
      { Id: id },
      { headers: { skipLoading: 'true' } }
    );
  }
  // // Phương thức mới để xác thực địa chỉ với opensitemap
  // verifyAddress(address: string): Observable<any> {
  //   // Giả sử API endpoint của opensitemap là dạng GET với tham số 'address'
  //   const apiUrl = `https://api.opensitemap.com/verify?address=${encodeURIComponent(
  //     address
  //   )}`;
  //   return this.http.get(apiUrl);
  // }
  // Hàm lấy kết quả autocomplete
  getAutocompleteResults(query: string): Observable<any> {
    const url = `https://autocomplete.search.hereapi.com/v1/autocomplete?q=${encodeURIComponent(
      query
    )}&apiKey=${this.apiKey}`;
    return this.http.get(url, { headers: { skipLoading: 'true' } });
  }

  // Hàm lấy kết quả geocode để xác thực địa chỉ
  getGeocodeResults(query: string): Observable<any> {
    const url = `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(
      query
    )}&apiKey=${this.apiKey}`;
    return this.http.get(url, { headers: { skipLoading: 'true' } });
  }
  getAutosuggestResults(query: string, at: string): Observable<any> {
    const url = `https://autosuggest.search.hereapi.com/v1/autosuggest?q=${encodeURIComponent(
      query
    )}&at=${at}&apiKey=${this.apiKey}`;
    return this.http.get(url, { headers: { skipLoading: 'true' } });
  }
}

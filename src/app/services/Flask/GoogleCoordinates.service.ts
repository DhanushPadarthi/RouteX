import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CoordinatesService {
  private apiUrl = 'http://127.0.0.1:5000/get_cities'; // Flask API URL

  constructor(private http: HttpClient) {}

  getCityNames(coordinates: any[]): Observable<any> {
    return this.http.post<any>(this.apiUrl, { coordinates });
  }
}
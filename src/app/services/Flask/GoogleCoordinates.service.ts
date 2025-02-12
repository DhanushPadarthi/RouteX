import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CoordinatesService {
  private apiUrl = 'http://127.0.0.1:5000'; // Flask API URL

  constructor(private http: HttpClient) {}

  fetch_youtube_and_comments(data: any[]): Observable<any> {
    const response = this.http.post(`${this.apiUrl}/fetch_news_comments`, { coordinates: data });
    console.log(response)
    return response
  }

  sendCoordinates(data: any[]): Observable<any> {
    const response = this.http.post(`${this.apiUrl}/process_coordinates`, { coordinates: data });
    console.log(response)
    return response
  }
}

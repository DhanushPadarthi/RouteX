import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private apiUrl:string = 'http://localhost:3000'; // Replace with your actual API URL

  constructor(private http: HttpClient) { }
  sethistory(start: string, end: string, maptype : string, username : string): Observable<any> {
    const body = {
      startDestination: start,
      endDestination: end,
      maptype : maptype,
      username : username
    };
    console.log('body', body)
    const res = this.http.post(this.apiUrl+'/set-history', body);
    console.log('response', res)
    return res
  }



  getfullhistory(): Observable<any>{
    const res = this.http.post(this.apiUrl+'/get-full-history', {});
    console.log('response', res)
    return res
  }
}

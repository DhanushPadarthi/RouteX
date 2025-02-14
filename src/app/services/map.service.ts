import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private apiUrl:string = 'http://localhost:3000'; // Replace with your actual API URL

  // private locationSource = new BehaviorSubject<{ start: string, end: string } | null>(null);
  // location$ = this.locationSource.asObservable();

  // setLocation(start: string, end: string) {
  //   this.locationSource.next({ start, end });
  //   console.log(this.locationSource.getValue())
  // }

  // getLocation() {
  //   return this.locationSource.getValue();  // Get latest value
  // }
  

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

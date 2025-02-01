import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl:string = 'http://localhost:3000'; // Replace with your actual API URL

  constructor(private http: HttpClient) { }
  
  login(username: string, password: string): Observable<any> {
    const body = {
      username: username,
      password: password
    };
    const res = this.http.post(this.apiUrl+'/login', body);
    return res
  }

  signup(username : string, password : string): Observable<any>{
    const body = {
      username: username,
      password: password
    };
    const res = this.http.post(this.apiUrl+'/sign-up', body);
    return res
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../interfaces/user.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private endpoint = "http://localhost:3000/api";

  constructor(
    private _http: HttpClient
  ) { }

  login(data: any): Observable<any> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this._http.post<any>(`${this.endpoint}/user/login`, data, { headers: headers, observe: "response" });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../interfaces/user.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private endpoint = "http://localhost:3000/api";

  constructor(
    private _http: HttpClient
  ) { }

  getProfile(): Observable<any> {
    return this._http.get<any>(`${this.endpoint}/user/profile`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  getFriends(page: number): Observable<any> {
    return this._http.get<any>(`${this.endpoint}/user/friendships/list?page=${page}`);
  }

  getPosts(page: number): Observable<any> {
    return this._http.get<any>(`${this.endpoint}/user/posts/list?page=${page}`);
  }

  createPost(post: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this._http.post<any>(`${this.endpoint}/user/post`, post, { headers: headers });
  }
}

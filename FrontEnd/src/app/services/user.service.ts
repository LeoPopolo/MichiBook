import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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

    let params = new HttpParams()
      .set('page', page)

    return this._http.get<any>(`${this.endpoint}/user/friendships/list`, { params: params });
  }

  getPosts(page: number): Observable<any> {

    let params = new HttpParams()
      .set('page', page)

    return this._http.get<any>(`${this.endpoint}/user/posts/list`, { params: params });
  }

  getUsers(filters: any): Observable<any> {

    let params = new HttpParams()
      .set('page', filters.page)
      .set('filter_string', filters.filter_string);

    return this._http.get<any>(`${this.endpoint}/user`, { params: params });
  }

  getPostsById(id: number, page: number): Observable<any> {

    let params = new HttpParams()
      .set('page', page)

    return this._http.get<any>(`${this.endpoint}/user/posts/${id}`, { params: params });
  }

  identifyUserById(id: number): Observable<any> {
    return this._http.get<any>(`${this.endpoint}/user/${id}`);
  }

  createPost(post: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this._http.post<any>(`${this.endpoint}/user/post`, post, { headers: headers });
  }

  sendFriendshipRequest(id: number): Observable<any> {
    return this._http.patch<any>(`${this.endpoint}/user/friendship_request/${id}`, null);
  }

  getFriendshipRequest(): Observable<any> {
    return this._http.get<any>(`${this.endpoint}/user/friendship_request/list`);
  }

  acceptFriendshipRequest(id: number): Observable<any> {
    return this._http.patch<any>(`${this.endpoint}/user/accept_friendship/${id}`, null);
  }

  declineFriendshipRequest(id: number): Observable<any> {
    return this._http.patch<any>(`${this.endpoint}/user/decline_friendship/${id}`, null);
  }
}

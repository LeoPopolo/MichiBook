import { Component, OnInit } from '@angular/core';
import { Post } from '../../interfaces/post.interface';
import { User, createUser } from '../../interfaces/user.interface';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  user: User = createUser();
  friends: Array<User> = [];
  posts: Array<Post> = [];

  pageFriends: number = 1;
  pagePosts: number = 1;

  constructor(
    private userServices: UserService
  ) { }

  ngOnInit(): void {
    this.getUserProfile();
    this.getFriends();
    this.getPosts();
  }

  getUserProfile() {
    this.userServices.getProfile().subscribe(data => {
      this.user = data.user;
    });
  }

  getFriends() {
    this.userServices.getFriends(this.pageFriends).subscribe(data => {
      this.friends = data.friends;
    });
  }

  getPosts() {
    this.userServices.getPosts(this.pagePosts).subscribe(data => {
      this.posts = data.posts;
    });
  }

}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { Post } from '../../../../interfaces/post.interface';
import { User } from '../../../../interfaces/user.interface';

@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss']
})
export class PostsComponent implements OnInit {

  @Input() posts!: Array<Post>;
  @Output() posted: EventEmitter<any> = new EventEmitter();

  user: User;

  post = this.initializatePost();

  constructor(
    private userServices: UserService
  ) {
    this.user = JSON.parse(localStorage.getItem('user')!);
  }

  ngOnInit(): void {
  }

  postIt() {
    this.userServices.createPost(this.post).subscribe(() => {
        alert('Publicado!');
        this.post = this.initializatePost();
        this.posted.emit();
      },
      error => {
        alert('Ocurrió un error al intentar publicar el post');
      }
    );
  }

  initializatePost() {
    return {
      post_text: '',
      image_path: null
    };
  }
}

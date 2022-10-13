import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { createUser, User } from '../../../interfaces/user.interface';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-modal-see-user',
  templateUrl: './modal-see-user.component.html',
  styleUrls: ['./modal-see-user.component.scss']
})
export class ModalSeeUserComponent implements OnInit {

  userWithPosts: any = {};
  user: User = createUser();
  page: number = 1;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userServices: UserService
  ) { }

  ngOnInit(): void {
    this.getUserWithPosts();
    this.identifyUserById();
  }

  getUserWithPosts() {
    this.userServices.getPostsById(this.data.id, this.page).subscribe(data => {
      this.userWithPosts = data;
    });
  }

  identifyUserById() {
    this.userServices.identifyUserById(this.data.id).subscribe(data => {
      this.user = data.user;
    });
  }

}

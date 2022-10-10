import { Component, Input, OnInit } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { User } from '../../../../interfaces/user.interface';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit {

  @Input() friends!: Array<User>;

  users: Array<User> = [];

  filter = {
    page: 1,
    filter_string: ''
  }

  constructor(
    private userServices: UserService
  ) { }

  ngOnInit(): void {
  }

  getUsers() {
    if (!this.filter.filter_string) {
      this.users = [];
      return;
    }

    this.userServices.getUsers(this.filter).subscribe(data => {
      this.users = data.users;
      console.log(this.users);
    });
  }

}

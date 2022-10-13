import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { User } from '../../../../interfaces/user.interface';
import { Friendship } from '../../../../interfaces/friendship.interface';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent {

  @Input() friends!: Array<User>;
  @Input() requests!: Array<Friendship>;

  @Output() requestHandled: EventEmitter<any> = new EventEmitter();
  @Output() requestSentHandled: EventEmitter<any> = new EventEmitter();

  users: Array<User> = [];

  filter = {
    page: 1,
    filter_string: ''
  }

  constructor(
    private userServices: UserService
  ) { }

  getUsers() {
    if (!this.filter.filter_string) {
      this.users = [];
      return;
    }

    this.userServices.getUsers(this.filter).subscribe(data => {
      this.users = data.users;
    });
  }

  sendRequest(id: number) {
    this.userServices.sendFriendshipRequest(id).subscribe(() => {
      this.requestSentHandled.emit();
      this.getUsers();
    });
  }

  emitRequestHandled() {
    this.requestHandled.emit();
  }

}

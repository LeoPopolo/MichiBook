import { Component, Input, OnInit } from '@angular/core';
import { User } from '../../../../interfaces/user.interface';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.scss']
})
export class FriendsComponent implements OnInit {

  @Input() friends!: Array<User>;

  constructor() { }

  ngOnInit(): void {
  }

}

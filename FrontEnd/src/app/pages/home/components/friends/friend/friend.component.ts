import { Component, Input, OnInit } from '@angular/core';
import { User } from '../../../../../interfaces/user.interface';

@Component({
  selector: 'app-friend',
  templateUrl: './friend.component.html',
  styleUrls: ['./friend.component.scss']
})
export class FriendComponent implements OnInit {

  @Input() friend!: User;
  @Input() smallMargin!: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from '../../../interfaces/user.interface';

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.scss']
})
export class UserHeaderComponent implements OnInit {

  @Input() user!: User;
  @Input() showFriendshipStatus!: boolean;
  @Input() showRequestActions!: boolean;

  @Output() confirmRequest: EventEmitter<boolean> = new EventEmitter();

  loggedUser: User;

  constructor() {
    this.loggedUser = JSON.parse(localStorage.getItem('user')!);
  }

  ngOnInit(): void {
  }

  parseFriendshipStatus(status: string) {
    switch (status) {
      case 'no friends': {
        return 'Agregar';
      }
      case 'emitted': {
        return 'Pendiente';
      }
      case 'received': {
        return 'Confirmar';
      }
      case 'friends': {
        return 'Amigos';
      }
      default: {
        return '';
      }
    }
  }

  parseButtonClass(status: string) {
    if (status === 'emitted' || status === 'received' || status === 'friends')
      return 'btn-secondary';
    else
      return 'btn-primary';
  }

  confirmRequestClick() {
    this.confirmRequest.emit(true);
  }

  declineRequestClick() {
    this.confirmRequest.emit(false);
  }
}

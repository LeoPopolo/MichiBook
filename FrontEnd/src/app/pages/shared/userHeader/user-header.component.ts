import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../../../interfaces/user.interface';
import { ModalSeeUserComponent } from '../modal-see-user/modal-see-user.component';

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
  @Output() sendRequest: EventEmitter<number> = new EventEmitter();

  loggedUser: User;

  constructor(
    private dialog: MatDialog
  ) {
    this.loggedUser = JSON.parse(localStorage.getItem('user')!);
  }

  ngOnInit(): void {
  }

  parseFriendshipStatus() {
    switch (this.user.friendship_status) {
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

  parseButtonClass() {
    if (this.user.friendship_status === 'emitted' ||
        this.user.friendship_status === 'received' ||
        this.user.friendship_status === 'friends')
      return 'btn-secondary';
    else
      return 'btn-primary';
  }

  action() {
    if (this.user.friendship_status === 'no friends') {
      this.sendRequest.emit(this.user.id);
    }
  }

  openModalSeeUser() {
    const dialogOptions = {
      width: '50%',
      maxHeight: '80vh',
      data: {
        id: this.user.id
      }
    }

    this.dialog.open(ModalSeeUserComponent, dialogOptions);
  }

  confirmRequestClick() {
    this.confirmRequest.emit(true);
  }

  declineRequestClick() {
    this.confirmRequest.emit(false);
  }
}

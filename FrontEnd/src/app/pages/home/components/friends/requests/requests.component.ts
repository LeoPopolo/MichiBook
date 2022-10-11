import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UserService } from '../../../../../services/user.service';
import { Friendship } from '../../../../../interfaces/friendship.interface';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss']
})
export class RequestsComponent implements OnInit {

  @Input() requests!: Array<Friendship>;
  @Output() requestHandled: EventEmitter<any> = new EventEmitter();

  constructor(
    private userServices: UserService
  ) { }

  ngOnInit(): void {
  }

  handleRequest(confirmed: boolean, request: Friendship) {
    if (confirmed) {
      this.userServices.acceptFriendshipRequest(request.id).subscribe(() => {
        this.requestHandled.emit();
        alert(`¡Ahora ${request.user_emitted.personal_data.name} es tu amigo!`);
      });
    } else {
      this.userServices.declineFriendshipRequest(request.id).subscribe(() => {
        this.requestHandled.emit();
        alert(`Rechazaste la solicitud de ${request.user_emitted.personal_data.name}`);
      });
    }
  }

}

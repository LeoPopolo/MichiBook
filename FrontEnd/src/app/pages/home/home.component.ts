import { Component, OnInit } from '@angular/core';
import { User, createUser } from '../../interfaces/user.interface';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  user: User = createUser();

  constructor(
    private userServices: UserService
  ) { }

  ngOnInit(): void {
    this.getUserProfile();
  }

  getUserProfile() {
    this.userServices.getProfile().subscribe(data => {
      this.user = data.user;
    });
  }

}

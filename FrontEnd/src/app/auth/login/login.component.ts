import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form: FormGroup;

  constructor(
    private authServices: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

  login() {
    const body = this.form.value;

    this.authServices.login(body).subscribe(data => {
      if (data.headers.get('Authorization')) {
        localStorage.setItem('token', data.headers.get('Authorization'));
        localStorage.setItem('user', JSON.stringify(data.body.data));

        this.router.navigate(['/page/home']);
      }
      },
      error => {
        console.log(error);
        alert("Usuario o contraseña incorrectos");
      }
    );
  }

  register() {
    alert('todavia no está habilitado');
  }

}

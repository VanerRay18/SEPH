import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/services/auth.service';
import { HttpResponse, HttpHeaders } from '@angular/common/http';
import { Module } from 'src/app/shared/interfaces/utils';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  username: string = '';
  password: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      user: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {

  }

  onSubmit() {
    if (this.loginForm.invalid) {


      return;
    }

    const data = {
      user: this.loginForm.value.user,
      password: this.loginForm.value.password

    };

    this.authService.authLogg(data).subscribe(
      (response) => {
        console.log(response.body.data.config.principal)
        const token = response.headers.get('Authorization');

    if (token) {
      console.log('Token JWT:', token);
      // Guarda el token en localStorage o sessionStorage
      localStorage.setItem('jwtToken', token);
    } else {
      console.warn('El token JWT no se encontró en los headers');
    }

      },
      (error) => {
        Swal.fire({
          title: 'Error!',
          text:  error.error.message,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    );

}
}


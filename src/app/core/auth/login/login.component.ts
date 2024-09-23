import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required]], 
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    const { usuario, password } = this.loginForm.value;

    this.authService.authenticate(usuario, password).subscribe(user => {
      if (!user) {
        // Usuario incorrecto
        Swal.fire({
          title: 'Error!',
          text: 'Usuario incorrecto.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } else if (user.password !== password) {
        // Contraseña incorrecta
        Swal.fire({
          title: 'Error!',
          text: 'Contraseña incorrecta.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } else {
        // Autenticación exitosa
        Swal.fire({
          title: 'Bienvenido!',
          text: 'Has iniciado sesión exitosamente.',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          // Redirige según el rol del usuario
          if (user.roles.includes(0)) {
            this.router.navigate(['Licencias-historial']);
          } else if (user.roles.includes(1)) {
            this.router.navigate(['licencias']);
          } else {
            this.router.navigate(['/']);  // Redirige a una página por defecto si no hay rol
          }
        });
      }
    });
  }
}
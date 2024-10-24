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
  isLoading = false; 
  loginForm: FormGroup;
  username: string = '';
  password: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      user: ['', [Validators.required , Validators.minLength(4) ]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
  this.checkTokenExpiration();
  localStorage.clear();
  }

  onSubmit() {
    this.isLoading = true; // Activar el loader
    const loginButton = document.getElementById('loginButton') as HTMLButtonElement;
    loginButton.disabled = true; // Deshabilitar el botón mientras se procesa

    if (this.loginForm.invalid) {
        this.isLoading = false; // Desactivar el loader si el formulario es inválido
        loginButton.disabled = false; // Habilitar el botón nuevamente
        return; // Salir si el formulario es inválido
    }

    const data = {
        user: this.loginForm.value.user,
        password: this.loginForm.value.password
    };

    this.authService.authLogg(data).subscribe(
        (response) => {
            const token = response.headers.get('Authorization');
            const tokenExpiration = new Date().getTime() + (2 * 60 * 60 * 1000) + (58 * 60 * 1000); // 2 horas y 58 minutos
            const rolId = response.body.data.rolId;
            const userId = response.body.data.userId;
            const path = response.body.data.config.principal;
            const editar = response.body.data.config.permisos.editar
            const eliminar = response.body.data.config.permisos.eliminar
            const agregar = response.body.data.config.permisos.agregar
          
            // Guardar el token y otros datos en localStorage
            if (token) {
                localStorage.setItem('userId', userId);
                localStorage.setItem('editar', editar);
                localStorage.setItem('eliminar', eliminar);
                localStorage.setItem('agregar', agregar);
                localStorage.setItem('rolId', rolId);
                localStorage.setItem('token', token);
                localStorage.setItem('tokenExpiration', tokenExpiration.toString());

                this.router.navigate([path]); // Navegar al nuevo path
            } else {
                console.warn('El token JWT no se encontró en los headers');
            }

            this.isLoading = false; // Desactivar el loader
            loginButton.disabled = false; // Habilitar el botón nuevamente
        },
        (error) => {
            Swal.fire({
              title: error.error.message != null?'Error':'Error con el sistema...',
                text: error.error.message != null? error.error.message:'Favor de acudir al area de mantenimiento',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            this.isLoading = false; // Desactivar el loader
            loginButton.disabled = false; // Habilitar el botón nuevamente
        }
    );
}


// Verifica la expiración del token
checkTokenExpiration() {
  const tokenExpiration = localStorage.getItem('tokenExpiration');
  if (tokenExpiration) {
    const now = new Date().getTime();
    console.log('Hora actual:', new Date(now));
    console.log('Hora de expiración del token:', new Date(parseInt(tokenExpiration)));

    if (now > parseInt(tokenExpiration)) {
      console.log('El token ha expirado. Ejecutando logout...');
      this.logout(); // El token ha expirado, realizar logout
      return false;
    } else {
      console.log('El token sigue siendo válido.');
    }
  }
  return true;
}

// Limpia el localStorage y redirige al login
logout() {
  console.log('Limpiando el localStorage...');
  localStorage.removeItem('token');
  localStorage.removeItem('tokenExpiration');
  localStorage.removeItem('rolId');
  this.router.navigate(['/login']); // Redirige al login
}

}


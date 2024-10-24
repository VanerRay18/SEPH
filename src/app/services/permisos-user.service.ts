import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PermisosUserService {

  constructor() { }

  edit(){
    return localStorage.getItem('editar') != null ?localStorage.getItem('editar'): true;
  }

  deleted(){
    return localStorage.getItem('aliminar') != null ?localStorage.getItem('eliminar'): true;
  }

  add(){
    return localStorage.getItem('agregar') != null ?localStorage.getItem('agregar'): true;
  }
}


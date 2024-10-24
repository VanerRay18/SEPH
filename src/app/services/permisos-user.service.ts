import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PermisosUserService {

  constructor() { }

  edit(): boolean {
    const editarValue = localStorage.getItem('editar');
    return editarValue !== null ? editarValue === 'true' : true;
  }

  deleted(): boolean {
    const eliminarValue = localStorage.getItem('eliminar');
    return eliminarValue !== null ? eliminarValue === 'true' : true;
  }
  
  add(): boolean {
    const agregarValue = localStorage.getItem('agregar');
    return agregarValue !== null ? agregarValue === 'true' : true;
  }
}


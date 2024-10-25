import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PermisosUserService {

  constructor() { }
  permisos: any;

  save(permisos:any):any{
    localStorage.setItem('permisos', JSON.stringify(permisos))
  }
  getPermisos(): any {
    const permisosString = localStorage.getItem('permisos');
    
    if (permisosString) {
        try {
            this.permisos = JSON.parse(permisosString);
            return this.permisos;
        } catch (error) {
            console.error("Error al parsear JSON de permisos:", error);
            return null;
        }
    } else {
        console.log("No se encontraron permisos en localStorage");
        return null;
    }
}

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


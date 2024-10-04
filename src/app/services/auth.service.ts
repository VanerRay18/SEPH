import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../shared/interfaces/usuario.model'; // Importa el modelo de usuario
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiResponse } from '../models/ApiResponse';
import { environment } from 'src/environments/enviroment';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Simula una base de datos de usuarios
  // private users: User[] = [
  //   { username: 'admin', password: 'admin123', roles: [0], modules: [1,2,3] },
  //   { username: 'userLice', password: 'user123', roles: [1], modules: [1] },
  //   { username: 'userYotube', password: 'user123', roles: [2], modules: [2] },
  //   { username: 'userGoogle', password: 'user123', roles: [3], modules: [3] }
  // ];
  private loggedIn: boolean = false;  // Estado de logueo del usuario
  private userRole: string | null = null;  // Almacena el nombre del rol del usuario
  private userModules: number[] = [];  // Almacena los módulos del usuario

  constructor(
    private http:HttpClient
  ) {}
  authLogg(data: any): Observable<ApiResponse> {
    return this.http.post<any>(`${environment.baseService}${'login'}`, data);
  }

  getModules(): Observable<ApiResponse> {
    return this.http.get<any>(`${environment.baseService}${'/modules'}`);
  }

  getRoles(): Observable<ApiResponse> {
    return this.http.get<any>(`${environment.baseService}${'/roles'}`);
  }

  GetCredentialsByUser(): Observable<ApiResponse> {
    return this.http.get<any>(`${environment.baseService}${'/credentialsByUser'}`);
  }

  // Método para establecer el estado de logueo
  setLoggedIn(value: boolean): void {
    this.loggedIn = value;
  }

  // Método para establecer el rol del usuario
  setUserRole(role: string): void {
    this.userRole = role;
  }

  // Método para establecer los módulos del usuario
  setUserModules(modules: number[]): void {
    this.userModules = modules;
  }

  // Método para verificar si el usuario está logueado
  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  // Método para obtener el rol del usuario
  getUserRole(): string | null {
    return this.userRole;
  }

  // Método para obtener los módulos del usuario
  getUserModules(): number[] {
    return this.userModules;
  }

  // Método para verificar si el rol coincide con los permisos requeridos
  hasAccessToModule(moduleId: number): boolean {
    return this.userModules.includes(moduleId);
  }


  


}

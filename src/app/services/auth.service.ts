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
  private users: User[] = [
    { username: 'admin', password: 'admin123', roles: [0], modules: [1,2,3] },
    { username: 'userLice', password: 'user123', roles: [1], modules: [1] },
    { username: 'userYotube', password: 'user123', roles: [2], modules: [2] },
    { username: 'userGoogle', password: 'user123', roles: [3], modules: [3] }
  ];

  constructor(
    private http:HttpClient
  ) {}

  // Método para autenticar al usuario
  authenticate(username: string, password: string): Observable<User | null> {
    const user = this.users.find(u => u.username === username && u.password === password);
    return of(user || null);
  }

  authLogg(data: any): Observable<ApiResponse> {
    return this.http.post<any>(`${environment.baseService}${'login'}`, data);
  }



}

// src/app/services/licencias.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LicenciasService {
  
 
  private apiUrl = 'https://example.com/api'; 

  constructor(private http: HttpClient) { }

// Obtiene las licencias del docente, con un parámetro opcional de tipo
getLicencias(rfc: string, tipo: number = 2): Observable<any> {
  return this.http.get(`${this.apiUrl}/licencias/${rfc}?tipo=${tipo}`);
  // Dependiendo del tipo, la API devolverá diferentes tipos de licencias
}

// Función que busca un docente a través de su nombre o RFC
// Retorna un observable que puede ser suscrito para obtener los resultados
getDocente(docente: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/docentes?query=${docente}`);
  // La API responderá con los docentes que coincidan con el nombre o RFC
}

// Recupera el historial personal del docente basado en su RFC
getHistorialPersonal(rfc: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/historial/${rfc}`);
  // El historial incluye información sobre licencias, accidentes y acuerdos presidenciales
}

// Obtiene permisos sin goce de sueldo asociados a un docente
getPermisosSinGoce(rfc: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/permisos_sin_goce/${rfc}`);
  // La API devolverá una lista de permisos asociados al RFC del docente
}

// Recupera los acuerdos presidenciales relacionados con el docente
getAcuerdosPresidenciales(rfc: string): Observable<any> {
  return this.http.get(`${this.apiUrl}/acuerdos_presidenciales/${rfc}`);
  // Se espera que el servidor devuelva acuerdos presidenciales del docente en formato JSON
}
}

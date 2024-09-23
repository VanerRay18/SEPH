import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistorialLicenciasService {
  private baseUrl = 'API_ENDPOINT'; // Reemplazar con la URL real de la API

  constructor(private http: HttpClient) { }

  // Obtener historial personal
  getHistorialPersonal(rfc: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/getHistorialPersonal`, { rfc });
  }

}

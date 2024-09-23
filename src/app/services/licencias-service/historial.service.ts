import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HistorialService {
  private apiUrl = 'controller_licencias_medicas.php'; // Ruta del servidor

  constructor(private http: HttpClient) {}


  // Obtener historial de un tipo (licencias, accidentes, acuerdos)
  getHistorial(rfc: string, tipo: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { accion: `get_${tipo}`, rfc });
  }

  // Guardar un nuevo registro dependiendo del tipo (licencia, accidente)
  setRegistro(tipo: string, data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      accion: `set_${tipo}`,
      ...data,
    });
  }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PhpTercerosService {
  private apiUrl = 'http://10.10.10.192/erp_api_php/api_php.php'; // carpeta base del backend

  constructor(private http: HttpClient) { }

  getPeople(servicio: string, page: number, size: number): Observable<any> {
    let headers = new HttpHeaders({ 'servicio': servicio, 'page': page, 'size': size });
    return this.http.get(`${this.apiUrl}/api_php.php`, { headers });
  }

  getTerceros(servicio: string, page: number, size: number): Observable<any> {
    let headers = new HttpHeaders({ 'servicio': servicio, 'page': page, 'size': size });
    return this.http.get(`${this.apiUrl}/api_php.php`, { headers });
  }

  setDataLayout(data: any, terceroId: string, userId: string, servicio: string): Observable<any> {
    let headers = new HttpHeaders({ 'servicio': servicio, 'terceroId': terceroId, 'userId': userId });
    return this.http.post(`${this.apiUrl}/api_php.php`, data, { headers });
  }

  getDataLayout(terceroId: string, servicio: string): Observable<any> {//get_layout
    let headers = new HttpHeaders({ 'terceroId': terceroId, 'servicio': servicio });
    return this.http.get(`${this.apiUrl}/api_php.php`, { headers });
  }

  setLayoutPHP(terceroId: string, userId: string, servicio: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    let headers = new HttpHeaders({ 'terceroId': terceroId, 'userId': userId, 'servicio': servicio });
    return this.http.post(`${this.apiUrl}/api_php.php`, formData, { headers });
  }

  getLayoutPHP(terceroId: string, servicio: string): Observable<Blob> {
    const headers = new HttpHeaders({
      'terceroId': terceroId,
      'servicio': servicio
    });
    return this.http.get(`${this.apiUrl}/api_php.php`, {
      headers,
      responseType: 'blob' // importante
    });
  }
}

// src/app/services/licencias.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { environment } from 'src/environments/enviroment';

@Injectable({
  providedIn: 'root'
})
export class LicenciasService {

  constructor(
    private http:HttpClient
  ) {}

  getLicencias(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${environment.baseService}${'/licMedicas'}`);
  }

  getUsers(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${environment.baseService}${'/user/users'}`);
  }

  // deleteLicencia(): Observable<ApiResponse> {
  //   const headers = new HttpHeaders({ 'licenciaId': licenciaId});
  //   return this.http.patch<ApiResponse>(`${environment.baseService}/licMedicas/softdeleted`, {}, { headers });
  // }




}

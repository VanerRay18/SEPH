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



  getLicencias(srl_emp: string): Observable<ApiResponse> {
    let headers = new HttpHeaders({'srl_emp': srl_emp})
    return this.http.get<ApiResponse>(`${environment.baseService}${'/licMedicas/user'}`,
      {headers}
    );
  }

  getUsers(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${environment.baseService}${'/user/users'}`);
  }

    // authLogg(token: string): Observable<any> {
  //   let headers = new HttpHeaders({Authorization:token})
  //   console.log(`${environment.baseService}${'/login'}`)
  //   return this.http.post<any>(`${environment.baseService}${'/login'}`, {headers});
  // }

  // deleteLicencia(): Observable<ApiResponse> {
  //   const headers = new HttpHeaders({ 'licenciaId': licenciaId});
  //   return this.http.patch<ApiResponse>(`${environment.baseService}/licMedicas/softdeleted`, {}, { headers });
  // }




}

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



  getLicencias(srl_emp: string): Observable<ApiResponse> {//Historial actual de licencias
    let headers = new HttpHeaders({'srl_emp': srl_emp})
    return this.http.get<ApiResponse>(`${environment.baseService}${'/licMedicas/user'}`,
      {headers}
    );
  }

  getUsers(): Observable<ApiResponse> {//optencion de rfc y nombre del empleado
    return this.http.get<ApiResponse>(`${environment.baseService}${'/user/users'}`);
  }

  SearchLic(folio: string): Observable<ApiResponse> {//buscar un licencia en general
    let headers = new HttpHeaders({'folio': folio})
    return this.http.get<ApiResponse>(`${environment.baseService}${'/licMedicas'}`,
      {headers}
    );
  }

  addLicencia(data:any, userId: string, srl_emp:string): Observable<ApiResponse> { //agregar una nueva licencia
    let headers = new HttpHeaders({'srl_emp': srl_emp, 'userId':userId})
    return this.http.post<ApiResponse>(`${environment.baseService}${'/licMedicas'}`,data,
      {headers}
    );
  }

  softDeleteLic(folio: string, userId: string): Observable<ApiResponse> { //agregar una nueva licencia
    let headers = new HttpHeaders({'folio': folio, 'userId':userId})
    return this.http.patch<ApiResponse>(`${environment.baseService}${'/licMedicas/softdeleted'}`,
      {headers}
    );
  }

  updateLic(data:any,licenciaId: string, userId: string): Observable<ApiResponse> { //editar una licencia
    let headers = new HttpHeaders({'licenciaId': licenciaId, 'userId':userId})
    return this.http.patch<ApiResponse>(`${environment.baseService}${'/licMedicas'}`,data,
      {headers}
    );
  }




}

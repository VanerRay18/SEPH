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

  softdeletedByOfo(folio: string, userId: string): Observable<ApiResponse> {//Eliminar un licencia en general
    let headers = new HttpHeaders({'folio': folio, 'userId':userId})
    return this.http.patch<ApiResponse>(`${environment.baseService}${'/softdeletedByOficio'}`,null,
      {headers}
    );
  }


  addLicencia(data:any, userId: string, srl_emp:string): Observable<ApiResponse> { //agregar una nueva licencia
    let headers = new HttpHeaders({'srl_emp': srl_emp, 'userId':userId})
    return this.http.post<ApiResponse>(`${environment.baseService}${'/licMedicas'}`,data,
      {headers}
    );
  }

  softDeleteLic(licenciaId: string, userId: string): Observable<ApiResponse> { //agregar una nueva licencia
    console.log(licenciaId)
    let headers = new HttpHeaders({'licenciaId': licenciaId, 'userId':userId})
    return this.http.patch<ApiResponse>(`${environment.baseService}${'/licMedicas/softdeleted'}`,null,
      {headers}
    );
  }

  updateLic(data:any,licenciaId: string, userId: string): Observable<ApiResponse> { //editar una licencia
    let headers = new HttpHeaders({'licenciaId': licenciaId, 'userId':userId})
    return this.http.patch<ApiResponse>(`${environment.baseService}${'/licMedicas'}`,data,
      {headers}
    );
  }


  getLicenciasArchivo(): Observable<ApiResponse> {//Licencias del dia
    return this.http.get<ApiResponse>(`${environment.baseService}${'/licMedicas/archivo'}`
    );
  }

  getLicenciasOficio(): Observable<ApiResponse> {//Licencias de oficio
    return this.http.get<ApiResponse>(`${environment.baseService}${'/licMedicas/oficios'}`
    );
  }

  getLicenciasOficioPdf(oficio: string): Observable<ApiResponse> { //Pdf de oficio
    let headers = new HttpHeaders({'oficio': oficio})
    return this.http.get<ApiResponse>(`${environment.baseService}${'/licMedicas/oficioPDF'}`,
      {headers}
    );
  }

  getLicMedicasLogs(): Observable<ApiResponse> {//Logs de licencias
    return this.http.get<ApiResponse>(`${environment.baseService}${'/licMedicas/licMedicaLogs'}`
    );
  }

  getAccidentes(srl_emp: string): Observable<ApiResponse> {//Historial actual de accidentes de trabajo
    let headers = new HttpHeaders({'srl_emp': srl_emp})
    return this.http.get<ApiResponse>(`${environment.baseService}${'/licMedicas/accidentes'}`,
      {headers}
    );
  }

  getAcuerdos(srl_emp: string): Observable<ApiResponse> {//Historial actual de accidentes de trabajo
    let headers = new HttpHeaders({'srl_emp': srl_emp})
    return this.http.get<ApiResponse>(`${environment.baseService}${'/licMedicas/precidenciales'}`,
      {headers}
    );
  }

  softdeletedByOficio(folio: string, userId: string): Observable<ApiResponse> { //elimina una licencia de manera general
    let headers = new HttpHeaders({'folio': folio, 'userId':userId})
    return this.http.patch<ApiResponse>(`${environment.baseService}${'/licMedicas/softdeletedByOficio'}`,null,
      {headers}
    );
  }

  patchLicenciasOficio(data: any, userId: string, srl_emp:string): Observable<ApiResponse> { //Crea nuevos oficios
    let headers = new HttpHeaders({'userId':userId,'srl_emp':srl_emp})
    return this.http.patch<ApiResponse>(`${environment.baseService}${'/licMedicas/oficios'}`,data,
      {headers}
    );
  }

  getHistorico(srl_emp: string): Observable<ApiResponse> {//Historial completo de licencias
    let headers = new HttpHeaders({'srl_emp': srl_emp})
    return this.http.get<ApiResponse>(`${environment.baseService}${'/licMedicas/historico'}`,
      {headers}
    );
  }

  getHistoricoAnte(srl_emp: string): Observable<ApiResponse> {//Historial del anio anterior de licencias
    let headers = new HttpHeaders({'srl_emp': srl_emp})
    return this.http.get<ApiResponse>(`${environment.baseService}${'/licMedicas/historicoAnterior'}`,
      {headers}
    );
  }


}

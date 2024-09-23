import { Component } from '@angular/core';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'ingresar-licencia',
  templateUrl: './ingresar-licencia.component.html',
  styleUrls: ['./ingresar-licencia.component.css']
})
export class IngresarLicenciaComponent {
  accion: string = '';
  docente: string = '';
  rfc: string = '';
  rfcLicencia: string = '';
  fechaInicio: string = '';
  fechaTermino: string = '';
  folio: string = '';
  response: any = null;

  constructor(private http: HttpClient) {}

  onSubmit() {
    const params = {
      accion: this.accion,
      docente: this.docente,
      rfc: this.rfc,
      rfcLicencia: this.rfcLicencia,
      fecha_inicio: this.fechaInicio,
      fecha_termino: this.fechaTermino,
      folio: this.folio
    };

    this.http.post<any>('/api/endpoint', params).subscribe(
      data => this.response = data,
      error => console.error('Error:', error)
    );
  }
}

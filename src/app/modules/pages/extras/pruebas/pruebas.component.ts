import { PruebaService } from './../../../../services/prueba.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-pruebas',
  templateUrl: './pruebas.component.html',
  styleUrls: ['./pruebas.component.css']
})
export class PruebasComponent {
  searchTerm: string = '';
  headers = [  'NO_COMPROBANTE', 'UR', 'PERIODO', 'TIPO_NOMINA','CLAVE_PLAZA', 'CURP', 'TIPO_CONCEPTO', 'COD_CONCEPTO', 'DESC_CONCEPTO', 'IMPORTE', 'BASE_CALCULO_ISR'];
  displayedColumns = ['NO_COMPROBANTE', 'UR', 'PERIODO', 'TIPO_NOMINA','CLAVE_PLAZA', 'CURP', 'TIPO_CONCEPTO', 'COD_CONCEPTO', 'DESC_CONCEPTO','IMPORTE','BASE_CALCULO_ISR'];
  data = [];


  constructor(
    private prueba: PruebaService
  ) {
    // Registrar las fuentes necesarias
    this.prueba.getUsuarios().subscribe((data) => {
      this.data = data;
    });
  }


}

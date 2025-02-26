import { Component } from '@angular/core';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { NominaBecService } from 'src/app/services/nomina-bec.service';

@Component({
  selector: 'app-anexo5-extra',
  templateUrl: './anexo5-extra.component.html',
  styleUrls: ['./anexo5-extra.component.css']
})
export class Anexo5ExtraComponent {
  searchTerm: string = '';
  headers = ['NO_COMPROBANTE', 'UR', 'PERIODO', 'TIPO_NOMINA', 'PRIMER_APELLIDO', 'SEGUNDO_APELLIDO', 'NOMBRE(S)', 'CLAVE_PLAZA', 'CURP', 'RFC', 'FECHA_PAGO', 'FECHA_INICIO', 'FECHA_TERMINO', 'PERCEPCIONES', 'DEDUCCIONES', 'NETO', 'NSS', 'CCT', 'FORMA_PAGO', 'CVE_BANCO', 'CLABE', 'NIVEL_CM', 'DOMINGOS_TRABAJADOS', 'DIAS_HORAS_EXTRA', 'TIPO_HORAS_EXTRA', 'SEMANAS_HORAS_EXTRA', 'HORAS_EXTRAS'];
  displayedColumns = ['NO_COMPROBANTE', 'UR', 'PERIODO', 'TIPO_NOMINA', 'PRIMER_APELLIDO', 'SEGUNDO_APELLIDO', 'NOMBRE', 'CLAVE_PLAZA', 'CURP', 'RFC', 'FECHA_PAGO', 'FECHA_INICIO', 'FECHA_TERMINO', 'PERCEPCIONES', 'DEDUCCIONES', 'NETO', 'NSS', 'CT', 'FORMA_PAGO', 'CVE_BANCO', 'CLABE', 'NIVEL_CM', 'DOMINGOS_TRABAJADOS', 'DIAS_HORAS_EXTRA', 'TIPO_HORAS_EXTRA(S)', 'SEMANAS_HORAS_EXTRA', 'HORAS_EXTRAS'];
  data = [];


  activeTab: string = 'anexo5';
  nominaId: any;

  constructor(
    private NominaBecService: NominaBecService
  ) {
    // Registrar las fuentes necesarias
  }


  async ngOnInit(): Promise<void> {
    this.nominaId = await this.loadNominaId();
    this.fetchData();
  }

  async loadNominaId() {
    const nominaId = await this.NominaBecService.getNominaId();
    return nominaId
  }
  setActiveTab(tabId: string) {
    this.activeTab = tabId; // Cambia la pestaña activa
  }

  fetchData() {
    let ordinaria = false;
    this.NominaBecService.getAnexo05(this.nominaId, ordinaria).subscribe((response: ApiResponse) => {
      this.data = response.data; // Aquí concatenas las fechas
    },
      (error) => {
        console.error('Error al obtener los datos:', error);
      });
  }

}

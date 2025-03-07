import { Component } from '@angular/core';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { NominaBecService } from 'src/app/services/nomina-bec.service';

@Component({
  selector: 'app-anexo7',
  templateUrl: './anexo7.component.html',
  styleUrls: ['./anexo7.component.css']
})
export class Anexo7Component {
  searchTerm: string = '';
  headers = [  'NO_COMPROBANTE', 'UR', 'PERIODO', 'TIPO_NOMINA','CLAVE_PLAZA', 'CURP', 'TIPO_CONCEPTO', 'COD_CONCEPTO', 'DESC_CONCEPTO', 'IMPORTE', 'BASE_CALCULO_ISR'];
  displayedColumns = ['NO_COMPROBANTE', 'UR', 'PERIODO', 'TIPO_NOMINA','CLAVE_PLAZA', 'CURP', 'TIPO_CONCEPTO', 'COD_CONCEPTO', 'DESC_CONCEPTO','IMPORTE','BASE_CALCULO_ISR'];
  data = [];

  tabs = [
    { id: 'anexo5', title: 'Anexo 5', icon: 'fas fa-file-medical' },
    { id: 'anexo6', title: 'Anexo 6', icon: 'fas fa-exclamation-triangle' },
  ];


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
    this.NominaBecService.getAnexo06(this.nominaId, ordinaria).subscribe((response: ApiResponse) => {
      this.data = response.data; // Aquí concatenas las fechas
    },
      (error) => {
        console.error('Error al obtener los datos:', error);
      });
  }

}

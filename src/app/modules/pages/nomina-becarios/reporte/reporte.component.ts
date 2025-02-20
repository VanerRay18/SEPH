import { Component } from '@angular/core';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { NominaBecService } from 'src/app/services/nomina-bec.service';


@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.component.html',
  styleUrls: ['./reporte.component.css']
})
export class ReporteComponent {
  searchTerm: string = '';
  headers = [  'NO_COMPROBANTE', 'RFC', 'CURP', 'NOMBRE(S)', 'PRIMER_APELLIDO', 'SEGUNDO_APELLIDO', 'FECHA_INICIO', 'FECHA_TERMINO','CLAVE_PLAZA', "CPTO", "IMPORTE", "CPTO", "IMPORTE","NETO"];
  displayedColumns = [ "NO_COMPROBANTE", "RFC", "CURP", "NOMBRE", "PRIMER_APELLIDO", "SEGUNDO_APELLIDO", "FECHA_INICIO", "FECHA_TERMINO", "CLAVE_PLAZA", "uno", "DEDUCCIONES", "cuatro", "PERCEPCIONES", "NETO"];
  data = [];
  isLoading = true;
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
    this.NominaBecService.getReportes(this.nominaId).subscribe((response: ApiResponse) => {
      this.data = response.data; // Aquí concatenas las fechas
    },
      (error) => {
        console.error('Error al obtener los datos:', error);
      });
  }

}

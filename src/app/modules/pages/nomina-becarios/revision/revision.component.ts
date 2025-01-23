import { Component } from '@angular/core';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { NominaBecService } from 'src/app/services/nomina-bec.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-revision',
  templateUrl: './revision.component.html',
  styleUrls: ['./revision.component.css']
})
export class RevisionComponent {
searchTerm: string = '';
  headers = ['Nombre', 'CURP', 'Clave', 'Banco', 'Total', ''];
  displayedColumns = ['nombre', 'curp', 'importTotal', 'retentionTotal', 'liquidTotal'];
  data = [];

  tabs = [
    { id: 'anexo5', title: 'Anexo 5', icon: 'fas fa-file-medical' },
    { id: 'anexo6', title: 'Anexo 6', icon: 'fas fa-exclamation-triangle' },
    { id: 'anexo7', title: 'Anexo 7', icon: 'fas fa-handshake' }
  ];

  previewData = [
    { id: 1, nombre: 'Juan Pérez', rfc: 'JUPE123456', puesto: 'Analista' },
    { id: 2, nombre: 'Ana Gómez', rfc: 'ANGO789012', puesto: 'Desarrollador' },
    { id: 3, nombre: 'Luis Martínez', rfc: 'LUMA345678', puesto: 'Gerente' },
  ];

  activeTab: string = 'anexo5';
  idNomina: any;

  constructor(
    private NominaBecService: NominaBecService
  ) {
    // Registrar las fuentes necesarias
  }

  ngOnInit(): void {
    this.fetchData();
  }

  setActiveTab(tabId: string) {
    this.activeTab = tabId; // Cambia la pestaña activa
  }

  fetchData() {
    this.NominaBecService.getInformationCalculation(this.idNomina).subscribe((response: ApiResponse) => {
      this.data = response.data; // Aquí concatenas las fechas
    },
      (error) => {
        console.error('Error al obtener los datos:', error);
      });
  }

  generateExcel(): void {
    const XLSX = require('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(this.previewData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
    XLSX.writeFile(workbook, 'vista_previa.xlsx');
  }

}

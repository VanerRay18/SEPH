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
  headers = ['Nombre', 'CURP', 'Clave', 'Banco', 'Total', ''];
  displayedColumns = ['nombre', 'curp', 'importTotal', 'retentionTotal', 'liquidTotal'];
  data = [];

  tabs = [
    { id: 'anexo5', title: 'Anexo 5', icon: 'fas fa-file-medical' },
    { id: 'anexo6', title: 'Anexo 6', icon: 'fas fa-exclamation-triangle' },
    { id: 'anexo7', title: 'Anexo 7', icon: 'fas fa-handshake' }
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
}

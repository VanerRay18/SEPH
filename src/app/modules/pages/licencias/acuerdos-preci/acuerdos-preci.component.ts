import { Component, Input } from '@angular/core';
import { LicenciasService } from 'src/app/services/licencias-service/licencias.service';
import { Employee } from 'src/app/shared/interfaces/usuario.model';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { BusquedaserlService } from 'src/app/services/busquedaserl.service';
@Component({
  selector: 'app-acuerdos-preci',
  templateUrl: './acuerdos-preci.component.html',
  styleUrls: ['./acuerdos-preci.component.css']
})
export class AcuerdosPreciComponent {
  headers = ['No. de Certificado','Acuerdo', 'Tipo', 'Desde', 'Hasta', 'Días','No. de oficio'];
  displayedColumns = ['numero_certificado','acuerdo', 'tipo', 'desde', 'hasta', 'total_dias','oficio'];
  data = [];
  table:any = true;

  rfcSearchTerm: string = '';
  nombreSearchTerm: string = '';

  // Aquí es donde se almacenarán los datos que lleguen del backend
  items: { rfc: string; nombre: string ; srl_emp:number}[] = [];

  // Sugerencias para dropdown
  rfcSuggestions: { rfc: string; nombre: string; srl_emp:number }[] = [];
  nombreSuggestions: { rfc: string; nombre: string ; srl_emp:number}[] = [];

  activeTab: string = 'licencias'; // Pestaña activa por defecto

  tabs = [
    { id: 'licencias', title: 'Licencias Médicas', icon: 'fas fa-file-medical' },
    { id: 'accidentes', title: 'Accidentes de Trabajo', icon: 'fas fa-exclamation-triangle' },
    { id: 'acuerdos', title: 'Acuerdos Precedenciales', icon: 'fas fa-handshake' }
  ];
  srl_emp: any = "";
  constructor(
    private LicenciasService: LicenciasService,
    private BusquedaserlService: BusquedaserlService,
  ) {
    //this.fetchData(); // Si tienes un endpoint real, descomenta esto
  }
  ngOnInit() {
    this.BusquedaserlService.srlEmp$.subscribe(value => {
      if(value.mostrar == true){
        this.srl_emp = value.srl_emp;
        this.buscar(this.srl_emp);
      }
    });

  }

buscar(srl_emp:any) {
  this.LicenciasService.getAcuerdos(srl_emp).subscribe((response: ApiResponse) => {
    this.table = true
    this.data = response.data;
  },
  (error) => {
    this.table = false;
  });
}


  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }

}

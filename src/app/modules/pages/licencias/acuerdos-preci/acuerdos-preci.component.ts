import { Component } from '@angular/core';
import { LicenciasService } from 'src/app/services/licencias-service/licencias.service';
import { Employee } from 'src/app/shared/interfaces/usuario.model';
import { ApiResponse } from 'src/app/models/ApiResponse';

@Component({
  selector: 'app-acuerdos-preci',
  templateUrl: './acuerdos-preci.component.html',
  styleUrls: ['./acuerdos-preci.component.css']
})
export class AcuerdosPreciComponent {
  headers = ['No. de Licencia', 'Desde', 'Hasta', 'Días', 'Status de licencia','No. de oficio'];
  displayedColumns = ['folio', 'desde', 'hasta', 'total_dias', 'status','oficio'];
  data = [];


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
  srl_emp:any ="";
  constructor(
    private LicenciasService: LicenciasService
  ) {
    //this.fetchData(); // Si tienes un endpoint real, descomenta esto
  }
  ngOnInit() {

     // Obtener datos del servicio cuando se inicializa el componente
     this.LicenciasService.getUsers().subscribe((response: { data: Employee[] }) => {
      this.items = response.data.map((user: Employee) => ({
        rfc: user.rfc,
        nombre: user.nombre,
        srl_emp:user.srl_emp
      }));
    });
  }
// Filtrar RFC al escribir
filterRFC() {
  if (this.rfcSearchTerm.length >= 3) { // Verificar si hay al menos 3 caracteres
    this.rfcSuggestions = this.items.filter(item =>
      item.rfc.toLowerCase().includes(this.rfcSearchTerm.toLowerCase())
    );
  } else {
    this.rfcSuggestions = []; // Limpiar las sugerencias si no hay suficientes caracteres
  }
  this.nombreSuggestions = [];
}

// Filtrar Nombre al escribir
filterNombre() {
  if (this.nombreSearchTerm.length >= 4) { // Verificar si hay al menos 4 caracteres
    this.nombreSuggestions = this.items.filter(item =>
      item.nombre.toLowerCase().includes(this.nombreSearchTerm.toLowerCase())
    );
  } else {
    this.nombreSuggestions = []; // Limpiar las sugerencias si no hay suficientes caracteres
  }
  this.rfcSuggestions = [];
}

// Seleccionar un RFC y completar el Nombre
selectRFC(item: { rfc: string; nombre: string; srl_emp:number}) {
  this.rfcSearchTerm = item.rfc;
  this.nombreSearchTerm = item.nombre;
  this.rfcSuggestions = [];
  this.nombreSuggestions = [];
  this.srl_emp = item.srl_emp
}

// Seleccionar un Nombre y completar el RFC
selectNombre(item: { rfc: string; nombre: string ; srl_emp:number}) {
  this.nombreSearchTerm = item.nombre;
  this.rfcSearchTerm = item.rfc;
  this.srl_emp = item.srl_emp


  this.rfcSuggestions = [];
  this.nombreSuggestions = [];
}

// Método para buscar con los términos ingresados
buscar(srl_emp:any) {
  console.log('Buscando por RFC:', this.rfcSearchTerm, 'y Nombre:', this.nombreSearchTerm);

  this.LicenciasService.getLicencias(srl_emp).subscribe((response: ApiResponse) => {
    this.data = response.data; // Asegúrate de mapear correctamente los datos
    console.log(response)
  });
}


  setActiveTab(tabId: string) {
    this.activeTab = tabId; // Cambia la pestaña activa
  }

}

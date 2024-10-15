import { Component } from '@angular/core';

@Component({
  selector: 'app-oficio-licencias',
  templateUrl: './oficio-licencias.component.html',
  styleUrls: ['./oficio-licencias.component.css']
})
export class OficioLicenciasComponent {
  searchTerm: string = '';
  headers = ['No. de Oficio', 'Nombre', 'Rango de fechas', 'Total de oficios', 'Generar PDF'];
  displayedColumns = ['folio', 'desde', 'hasta', 'total_dias', 'status', 'oficio'];
  data = [];


  // Método para buscar con los términos ingresados
//   buscar(srl_emp: any) {

//     this.srl_emp = srl_emp;
//     console.log('Buscando por RFC:', this.rfcSearchTerm, 'y Nombre:', this.nombreSearchTerm);

//     this.LicenciasService.getLicencias(srl_emp).subscribe((response: ApiResponse) => {
//       this.data = response.data; // Asegúrate de mapear correctamente los datos
//       console.log(response)
//       this.showCard = true;
//     },
//       (error) => {
//         console.error('Error al buscar licencias:', error);
//         this.showCard = false; // Oculta la tarjeta en caso de error
//       }
//     );
//   }

 }

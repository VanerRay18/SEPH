import { Component } from '@angular/core';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { NominaBecService } from 'src/app/services/nomina-bec.service';
import { NominaA } from 'src/app/shared/interfaces/utils';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-becarios',
  templateUrl: './home-becarios.component.html',
  styleUrls: ['./home-becarios.component.css']
})
export class HomeBecariosComponent {
 searchTerm: string = '';
  data: NominaA | null = null;


  constructor(
    private router: Router,
    private NominaBecService: NominaBecService
  ) {
    // Registrar las fuentes necesarias
  }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.NominaBecService.getNomina().subscribe((response: ApiResponse) => {
      this.data = response.data;
    },
      (error) => {
        console.error('Error al obtener los datos:', error);
      });
  }

  startNomina(): void {
    let status = this.data?.status;
switch (status) {
  case 0:
    Swal.fire({
      title: 'Confirmar',
      html: `¿Está seguro de que desea iniciar la nomina con ${this.data?.becarios} becarios?<br><br>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, Continuar',
      cancelButtonText: 'No, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // El usuario confirmó, proceder a enviar los datos

            this.router.navigate(['/pages/NominaBecarios/Nominas-Calcular']);

      }
    });
    break;

    case 1:
      Swal.fire({
        title: 'Confirmar',
        html: `Tienes una nomina activa que se esta calculando ¿Deseas continuar el proceso actual?<br><br>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, Continuar',
        cancelButtonText: 'No, cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          // El usuario confirmó, proceder a enviar los datos

              this.router.navigate(['/pages/NominaBecarios/Nominas-Calcular']);

        }
      });
    break;

    case 2:
      Swal.fire({
        title: 'Confirmar',
        html: `Tienes una nomina activa que se esta procesando ¿Deseas continuar el proceso actual?<br><br>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, Continuar',
        cancelButtonText: 'No, cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          // El usuario confirmó, proceder a enviar los datos

              this.router.navigate(['/pages/NominaBecarios/Nominas-Pagar']);

        }
      });
    break;

    case 3:
      Swal.fire({
        title: 'Confirmar',
        html: `Tienes una nomina activa que se esta en revision ¿Deseas continuar el proceso actual?<br><br>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, Continuar',
        cancelButtonText: 'No, cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          // El usuario confirmó, proceder a enviar los datos

              this.router.navigate(['/pages/NominaBecarios/Nominas-Revision']);

        }
      });
    break;

    case 4:
      Swal.fire({
        title: 'Confirmar',
        html: `Tienes una nomina activa que se esta apunto de enviar ¿Deseas continuar el proceso actual?<br><br>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, Continuar',
        cancelButtonText: 'No, cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          // El usuario confirmó, proceder a enviar los datos

              this.router.navigate(['/pages/NominaBecarios/Nominas-Enviar']);

        }
      });
    break;

    case 5:
      Swal.fire({
        title: 'Error',
        text:`Esta nomina ya ha sido terminada y enviada `,
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    break;

  default:
    break;
}


  }
}

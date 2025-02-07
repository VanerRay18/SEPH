import { Component } from '@angular/core';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { NominaBecService } from 'src/app/services/nomina-bec.service';
import { NominaA } from 'src/app/shared/interfaces/utils';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { PermisosUserService } from 'src/app/services/permisos-user.service';

@Component({
  selector: 'app-activas',
  templateUrl: './activas.component.html',
  styleUrls: ['./activas.component.css']
})
export class ActivasComponent {
  searchTerm: string = '';
  data: NominaA | null = null;


  eliminar: boolean = false;
  agregar: boolean = false;
  modificar: boolean = false;
  autorizar: boolean = false;


  constructor(
    private router: Router,
    private NominaBecService: NominaBecService,
    private PermisosUserService: PermisosUserService
  ) {
    // Registrar las fuentes necesarias
  }

  ngOnInit(): void {
    this.fetchData();
    this.PermisosUserService.getPermisosSpring(this.PermisosUserService.getPermisos().NominasB).subscribe((response: ApiResponse) => {
      this.eliminar = response.data.eliminar
      this.modificar = response.data.editar
      this.agregar = response.data.agregar
      this.autorizar = response.data.autorizar
    });
    console.log(this.data?.status)
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
      confirmButtonText: 'Sí, Iniciar',
      cancelButtonText: 'No, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // El usuario confirmó, proceder a enviar los datos

            this.router.navigate(['/pages/NominaBecarios/Nominas-Calcular']);

      }
    });
    break;

    case 1:
      this.router.navigate(['/pages/NominaBecarios/Nominas-Calcular']);
    break;

    case 2:
      this.router.navigate(['/pages/NominaBecarios/Nominas-Pagar']);
    break;

    case 3:
      this.router.navigate(['/pages/NominaBecarios/Nominas-Revision']);
    break;

    case 4:
      this.router.navigate(['/pages/NominaBecarios/Nominas-Enviar']);
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




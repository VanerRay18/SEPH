import { Component } from '@angular/core';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { NominaBecService } from 'src/app/services/nomina-bec.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { NominaA } from 'src/app/shared/interfaces/utils';
@Component({
  selector: 'app-enviar',
  templateUrl: './enviar.component.html',
  styleUrls: ['./enviar.component.css']
})
export class EnviarComponent {
  status = 4;
  data = [];
  nominaId: any;
  data2: NominaA | null = null;

  constructor(
    private NominaBecService: NominaBecService,
    private router: Router
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
  fetchData() {
    this.NominaBecService.getNomina().subscribe((response: ApiResponse) => {
      this.data2 = response.data;
    },
      (error) => {
        console.error('Error al obtener los datos:', error);
      });
    this.NominaBecService.getInformationCalculation(this.nominaId).subscribe((response: ApiResponse) => {
      this.data = response.data; // Aquí concatenas las fechas
    },
      (error) => {
        console.error('Error al obtener los datos:', error);
      });
  }

  saveNomina(event: any): void {
    this.NominaBecService.changeStatus(this.nominaId, this.status).subscribe(
      response => {
        console.log('Se cambio el status');
        this.fetchData();
      },
      error => {
        Swal.fire({
          title: 'Error',
          text: error.error.message,
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    );

  }


  continueNomina(): void {
    const status = 5;
    this.NominaBecService.changeStatus(this.nominaId, status).subscribe(
      response => {

              Swal.fire({
                title: 'Confirmar',
                html: `¿Está seguro de enviar la nomina?<br><br>`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, enviar',
                cancelButtonText: 'No, cancelar'
              }).then((result) => {
                if (result.isConfirmed) {
                   // Mostrar spinner de carga
                          // Swal.fire({
                          //   title: 'Guardando la nomina...',
                          //   html: 'Por favor, espere mientras se envia la nomina.',
                          //   didOpen: () => {
                          //     Swal.showLoading();
                          //   },
                          //   allowOutsideClick: false,
                          //   showConfirmButton: false
                          // });
                  // El usuario confirmó, proceder a enviar los datos
                  this.router.navigate(['/pages/NominaBecarios/Nominas-Activas']);
                  this.NominaBecService.sentNomina(this.data).subscribe(
                    response => {
                      this.fetchData();
                      Swal.fire({
                        title: 'Nomina Enviada',
                        text: 'Se envio la Nomina correctamente',
                        icon: 'success',
                        confirmButtonText: 'Aceptar'
                      });
                    },
                    error => {
                      Swal.fire({
                        title: 'Error',
                        text: error.error.message,
                        icon: 'error',
                        confirmButtonText: 'Aceptar'
                      });
                    }
                  );

                }
              })

        this.fetchData();
      },
      error => {
        Swal.fire({
          title: 'Error',
          text: error.error.message,
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    );

  }

}

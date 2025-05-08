import { Component } from '@angular/core';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { NominaBecService } from 'src/app/services/nomina-bec.service';
import { NominaA } from 'src/app/shared/interfaces/utils';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { PermisosUserService } from 'src/app/services/permisos-user.service';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-descuentos',
  templateUrl: './descuentos.component.html',
  styleUrls: ['./descuentos.component.css']
})
export class DescuentosComponent {
searchTerm: string = '';
  data: NominaA | null = null;
  zipFiles: File | null = null; // Nuevo arreglo para los archivos ZIP
  nominaId: any;
  crearlayout:any;
  eliminar: boolean = false;
  agregar: boolean = false;
  modificar: boolean = false;
  autorizar: boolean = false;
  files: File[] = [];
  status = 1;


  constructor(
    private router: Router,
    private NominaBecService: NominaBecService,
    private PermisosUserService: PermisosUserService
  ) {
    // Registrar las fuentes necesarias
  }

  async ngOnInit():  Promise<void>  {
    this.nominaId = await this.loadNominaId();
    this.fetchData();
    this.PermisosUserService.getPermisosSpring(this.PermisosUserService.getPermisos().NominasB).subscribe((response: ApiResponse) => {
      this.eliminar = response.data.eliminar
      this.modificar = response.data.editar
      this.agregar = response.data.agregar
      this.autorizar = response.data.autorizar
    });

    this.crearlayout = 0 ;
    // console.log(this.data?.status)
  }


  async loadNominaId() {
    const nominaId = await this.NominaBecService.getNominaId();
    return nominaId
  }

  fetchData() {
    this.NominaBecService.getNomina().subscribe((response: ApiResponse) => {
      this.data = response.data;
    },
      (error) => {
        // console.error('Error al obtener los datos:', error);
        Swal.fire({
          icon: 'warning',
          title: 'No hay nominas para procesar',
          text: 'La quincena actual ya fue procesada',
          confirmButtonText: 'Aceptar'
        });
      });
  }

  startNomina(): void {
    let status = this.status;
    switch (status) {
      case 0:
        this.router.navigate(['/pages/Terceros/Crear-Layout']);
        break;

      case 1:
        this.router.navigate(['/pages/Terceros/Validar']);
        break;

      case 2:
        this.router.navigate(['/pages/Terceros/Reporte-Validacion']);
        break;

      case 3:
        Swal.fire({
          title: 'Error',
          text: `El tercero ya a sido finalizado`,
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        break;

      default:
        break;

    }


  }


  opcionsNomina() {
    Swal.fire({
      title: '¿Qué accion deseas hacer?',
      html: `
                  <div style="display: flex; align-items: center; margin-bottom: 10px;">
                      <input type="radio" id="skip" name="opcions" value="skip" style="margin-right: 5px;">
                      <label for="skip">No procesar esta nomina</label>
                  </div>
                  <div style="display: flex; align-items: center; margin-bottom: 10px;">
                      <input type="radio" id="special" name="opcions" value="special" style="margin-right: 5px;">
                      <label for="special">Procesar una nomina especial</label>
                  </div>
              `,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'small-swal',
        title: 'small-swal-title'
      },
      width: '450px',
      padding: '1em',
      preConfirm: () => {
        const selectedValue = (document.querySelector('input[name="opcions"]:checked') as HTMLInputElement)?.value;
        if (!selectedValue) {
          Swal.showValidationMessage('Por favor, seleccione una opción');
          return false;
        }
        return selectedValue;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const opcionSeleccionada = result.value;

        switch (opcionSeleccionada) {
          case 'skip':
            Swal.fire({
              title: 'Confirmar',
              html: `¿Está seguro de no procesar esta nomina?<br><br>`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Sí, guardar',
              cancelButtonText: 'No, cancelar'
            }).then((result) => {
              if (result.isConfirmed) {
                // Mostrar spinner de carga
                Swal.fire({
                  title: 'Cargando...',
                  html: 'Por favor, espere mientras se realiza esta acción.',
                  didOpen: () => {
                    Swal.showLoading();
                  },
                  allowOutsideClick: false,
                  showConfirmButton: false
                });
                // El usuario confirmó, proceder a enviar los datos
                this.NominaBecService.skipnomina().subscribe(
                  response => {
                    this.fetchData();
                    Swal.fire({
                      title: 'Operacion exitosa',
                      text: 'La nomina no a sido procesada',
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
            });
            break;
          case 'special':
            Swal.fire({
              title: 'Subir archivo de TXT',
              html: `
                      <div class="custom-file-container">
                         <label for="fileInput" class="custom-file-label">Seleccionar archivo</label>
                         <input
                           type="file"
                           id="fileInput"
                           class="swal2-input custom-file-input"
                           accept=".txt"
                           aria-label="Selecciona un archivo de texto"
                           onchange="handleFileSelect(event)"
                               />
                       </div>
                    `,
              confirmButtonText: 'Procesar',
              showCancelButton: true,
              width:700,
              preConfirm: () => {
                const fileInput: any = document.getElementById('fileInput');
                const file = fileInput?.files[0];

                const files: File[] = [];
                if (file) {
                  files.push(file); // Archivo normal
                }

                Swal.fire({
                  title: 'Cargando...',
                  html: 'Por favor, espere mientras se realiza esta acción.',
                  didOpen: () => {
                    Swal.showLoading();
                  },
                  allowOutsideClick: false,
                  showConfirmButton: false
                });

                this.NominaBecService.SpecialNomina(files).subscribe({
                  next: (response) => {

                    new Promise<void>((resolve, reject) => {
                      resolve();
                    }).then(() => {
                      Swal.close();
                      this.router.navigate(['/pages/NominaBecarios/Nominas-Pagar']);
                    }).catch(error => {

                      Swal.fire('Error', 'Hubo un problema al procesar el archivo', 'error');
                    });
                  },
                  error: (error) => {
                    Swal.fire({
                      title: 'Error',
                      text: error.error.message,
                      icon: 'error',
                      confirmButtonText: 'Aceptar'
                    });
                  }
                }
              );

              }
            })
            break;
        }
      }
    });
  }
}

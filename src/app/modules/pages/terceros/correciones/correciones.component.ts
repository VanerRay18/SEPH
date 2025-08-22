import { ChangeDetectorRef, Component } from '@angular/core';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { NominaBecService } from 'src/app/services/nomina-bec.service';
import { Info, Movs, NominaA, Resumen } from 'src/app/shared/interfaces/utils';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { Anexo06 } from 'src/app/shared/interfaces/utils';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Anexo05 } from 'src/app/shared/interfaces/utils';
import { FileTransferService } from 'src/app/services/file-transfer.service';
import { TercerosService } from './../../../../services/terceros.service';


@Component({
  selector: 'app-correciones',
  templateUrl: './correciones.component.html',
  styleUrls: ['./correciones.component.css']
})
export class CorrecionesComponent {

  searchTerm: string = '';
  headersAN = ['Tipo_Orden ', 'RFC', 'Nombre', 'Desde', 'Hasta'];
  displayedColumnsAN = ['tipo_orden', 'rfc', 'nombre', 'retentionTotal'];
  dataAN = [];
  headersLI = ['Tipo_Orden ', 'RFC', 'Nombre', 'Descueto', 'Liquido'];
  displayedColumnsLI = ['tipo_orden', 'rfc', 'nombre', 'descuento', 'liquido',];
  dataLI = [];
  headersRFC = ['Tipo_Orden ', 'RFC', 'Nombre', 'Posibles'];
  displayedColumnsRFC = ['tipo_orden', 'rfc', 'nombre'];
  dataRFC = [];
  headersTN = ['Tipo_Orden ', 'RFC', 'Nombre', 'Motivo'];
  displayedColumnsTN = ['tipo_orden', 'rfc', 'nombre', 'mensaje'];
  dataTN = [];
  users: any;
  dataMov: Movs | null = null;
  crearlayout: any;
  status = localStorage.getItem('status')!;
  isLoading = true;
  ilimitado: any;
  file: File[] = [];
  data = [];
  layoutCorregido = [];
  info: any;
  added: any;

  dataFin: Info = {
    accepted: null,
    records: null,
    rejected: null,
    sinLiquido: null,
    status: null,
    terceroId: null,
    quincena: null,
    users: null,
  };
  terceroTotalId: any;
  terceroId: any;

  constructor(
    private router: Router,
    private TercerosService: TercerosService,
    private cdr: ChangeDetectorRef,
    private fileTransferService: FileTransferService,
    private route: ActivatedRoute,
  ) {
    // Registrar las fuentes necesarias
  }
  ngOnInit(): void {
    this.isLoading = true;
    this.fileTransferService.getFile().subscribe(file => {
      if (file) {
        this.file = [file]; // Solo guardas el archivo
        // console.log('Archivo almacenado para uso posterior:', this.file);
      } else {
        console.warn('No se recibió archivo');
      }
    });


    // this.fileTransferService.currentIdTercero$.subscribe((id) => {

    //   console.log('ID recibido:', this.terceroId);
    //   // Aquí puedes llamar a un servicio o usar el ID como necesites
    // });
    this.terceroId = this.route.snapshot.paramMap.get('id');
    this.fetchData();
  }



  fetchData() {


    this.TercerosService.getInformationById(this.terceroId).subscribe((response: ApiResponse) => {
      this.info = response.data;
      console.log(this.info)
      this.terceroTotalId = response.data.id;
      console.log(response.data.quincena)
      this.dataFin.quincena = response.data.quincena;
      console.log(response.data.terceroId)
      this.dataFin.terceroId = response.data.terceroId;
      this.ilimitado = response.data.ilimitado;
      this.added = response.data.added;

      if (this.added === true) {
        this.crearlayout = 1;
      } else {
        this.crearlayout = 0;
      }

    },
      (error) => {
        // console.error('Error al obtener los datos:', error);
        console.error('Ocurrio un error', error);
      });


    if (!this.users) {
      this.users = ' ';
    }
    if (this.file.length > 0) {
      const archivo = this.file[0];

      this.TercerosService.validatorLayout(archivo, this.users, this.ilimitado).subscribe({
        next: (response: ApiResponse) => {
          this.data = response.data;
          this.dataMov = response.data.resume[0];
          this.dataAN = response.data.actualizaciones;
          this.dataLI = response.data.sinLiquido;
          this.dataRFC = response.data.possibleRFC;
          this.dataTN = response.data.rechazos;
          this.isLoading = false;
          this.cdr.detectChanges();
          // this.isLoading = this.dataMov.length === 0;
        },
        error: (error) => {
          console.error('Error al enviar archivo al servicio:', error);
        }
      });
    } else {
      console.warn('No hay archivos cargados para enviar.');
    }

  }


  showDetails(row: any) {

    const posibles = Array.isArray(row.posibles)
      ? row.posibles
      : (row.posibles ? [row.posibles] : []);

    if (posibles.length === 0) {
      Swal.fire('Sin datos', 'No se encontraron registros posibles.', 'info');
      return;
    }
    const rfcViejo = row.rfc;

    let tableHtml = `
  <table class="table table-bordered">
    <thead>
      <tr>
        <th>Seleccionar</th>
        <th>Nombre</th>
        <th>RFC</th>
      </tr>
    </thead>
    <tbody>
      ${posibles.map((item: any, index: number) => `
        <tr>
          <td>
            <input type="radio" name="rfcSeleccionado" value="${item.rfc}" data-nombre="${item.nombre}">
          </td>
          <td>${item.nombre || 'N/A'}</td>
          <td>${item.rfc || 'N/A'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
`;

    Swal.fire({
      title: 'Seleccione el RFC correcto',
      html: tableHtml,
      width: '1000px',
      confirmButtonText: 'Confirmar',
      confirmButtonColor: '#3085d6',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const selectedRadio: HTMLInputElement | null = document.querySelector('input[name="rfcSeleccionado"]:checked');
        if (!selectedRadio) {
          Swal.showValidationMessage('Debe seleccionar un RFC');
          return;
        }
        return {
          rfcNuevo: selectedRadio.value,
          rfcViejo: rfcViejo,
          nombre: selectedRadio.getAttribute('data-nombre'),
        };
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        const seleccionado = result.value;
        this.users = seleccionado
        // console.log('Seleccionado:', seleccionado);

        // Aquí puedes usar el RFC y nombre:
        // seleccionado.nombre
        // seleccionado.rfc
      }
    });

  }


  correctLayout(): void {
    Swal.fire({
      title: 'Confirmar',
      html: `¿Está seguro de corregir el layout?<br><br>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, corregir',
      cancelButtonText: 'No, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Mostrar spinner de carga
        Swal.fire({
          title: 'Limpiando el Layout...',
          html: 'Por favor, espere mientras se corrige el Layout.',
          didOpen: () => {
            Swal.showLoading();
          },
          allowOutsideClick: false,
          showConfirmButton: false
        });

        if (this.file.length > 0) {
          const archivo = this.file[0];

          this.TercerosService.validatorLayout(archivo, this.users, this.ilimitado).subscribe({
            next: (response: ApiResponse) => {
              this.data = response.data;
              this.dataFin.records = response.data.resume[0]?.total ?? 0;
              console.log(this.data);


              // Aquí llamamos al segundo servicio
              this.TercerosService.validatorFormat(this.data, this.ilimitado).subscribe(
                response => {
                  this.correctLayout = response.data;
                  console.log('Layout corregido:', this.correctLayout);
                  this.dataFin.users = response.data.users;
                  this.dataFin.sinLiquido = response.data.sinLiquido;
                  this.dataFin.rejected = response.data.rechazos;
                  this.dataFin.accepted = response.data.correctos;
                  Swal.fire({
                    title: 'Layout corregido',
                    text: 'No se olvide de descargar el nuevo layout',
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
            },
            error: (error) => {
              console.error('Error al enviar archivo al servicio:', error);
              Swal.fire({
                title: 'Error',
                text: 'Hubo un problema al corregir el layout.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
              });
            }
          });
        } else {
          Swal.fire('Advertencia', 'No hay archivos cargados para enviar.', 'warning');
        }
      }
    });
  }


  SaveTercero(): void {
    Swal.fire({
      title: 'Confirmar',
      html: `¿Está seguro de guardar el layout?<br><br>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'No, cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        console.log(this.dataFin)
        // Mostrar spinner de carga antes de hacer la petición
        Swal.fire({
          title: 'Guardando el Layout...',
          html: 'Por favor, espere mientras se guarda el layout.',
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const status = 3;
        this.dataFin.status = 3;

        try {
          // Guardar layout primero
          await this.TercerosService.SaveLayout(this.dataFin).toPromise();
          // Luego cambiar el estado
          await this.TercerosService.changeStatus(this.terceroId, status).toPromise();

          // Mostrar éxito
          Swal.fire({
            title: 'Proceso terminado',
            text: 'Se guardo el layout correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          }).then(() => {
            this.router.navigate(['/pages/Terceros/Descuentos']);
          });

        } catch (error: any) {
          Swal.fire({
            title: 'Error',
            text: error?.error?.message || 'Ocurrió un error.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      }
    });
  }




  async generateAnexos(): Promise<void> {
    Swal.fire({
      title: 'Generando los Anexos..',
      html: 'Por favor, espere mientras se genera el Excel de los anexos.',
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
      showConfirmButton: false
    });

    try {

    } catch (error) {

    }
  }

  // Función para convertir a número, manejando cadenas vacías o no válidas




}

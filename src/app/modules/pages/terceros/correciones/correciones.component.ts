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
import { PhpTercerosService } from 'src/app/services/php-terceros.service';
import { finalize, map, switchMap, tap } from 'rxjs';
import { ImageToBaseService } from './../../../../services/image-to-base.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

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
    private php: PhpTercerosService,
    private ImageToBaseService: ImageToBaseService
  ) {
    // Registrar las fuentes necesarias
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
  }
  ngOnInit(): void {
    this.isLoading = true;
    this.terceroId = this.route.snapshot.paramMap.get('id');
    this.fetchData();
  }



  fetchData() {
    this.isLoading = true;

    this.TercerosService.getInformationById(this.terceroId).pipe(
      tap((response: ApiResponse) => {
        this.info = response.data;
        this.terceroTotalId = response.data.id;
        this.dataFin.quincena = response.data.quincena;
        this.dataFin.terceroId = response.data.terceroId;
        this.ilimitado = response.data.ilimitado;
        this.added = response.data.added;
        this.crearlayout = this.added ? 1 : 0;
        if (!this.users) this.users = ' ';
      }),
      // luego pide el layout al PHP
      switchMap(() =>
        this.php.getLayoutPHP(this.terceroId, 'get_file')
      ),
      // convierte el blob a File (si tu backend de validación lo requiere como File)
      map((blob: Blob) =>
        new File([blob], 'layout.txt', { type: 'text/plain' })
      ),
      // valida el layout con el servicio de terceros
      switchMap((archivo: File) => {
        // Guarda opcionalmente si lo necesitas en la UI
        this.file = [archivo];
        return this.TercerosService.validatorLayout(archivo, this.users, this.ilimitado);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (response: ApiResponse) => {
        this.data = response.data;
        console.log(this.data);
        this.dataMov = response.data.resume?.[0];
        this.dataAN = response.data.actualizaciones;
        this.dataLI = response.data.sinLiquido;
        this.dataRFC = response.data.possibleRFC;
        this.dataTN = response.data.rechazos;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error en el flujo:', error);
      }
    });
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




  async onPdfResumen(): Promise<void> {
    // Mostrar SweetAlert de carga
    Swal.fire({
      title: 'Generando PDF...',
      text: 'Por favor espere mientras se procesa el reporte',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // Extraer las secciones del JSON
      const resume = Array.isArray(this.dataMov) ? this.dataMov : (this.dataMov ? [this.dataMov] : []);
      const actualizaciones = this.dataAN || [];
      const sinLiquido = this.dataLI || [];
      const possibleRFC = this.dataRFC || [];
      const rechazos = this.dataTN || [];

      // Convertir la imagen a base64 (esto puede tomar tiempo)
      const imageBase64 = await this.ImageToBaseService.convertImageToBase64('assets/IHE_LOGO.png');

      const documentDefinition: any = {
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        content: [
          // Header con logo y título
          {
            columns: [
              {
                image: imageBase64,
                alignment: 'left',
                width: 120,
                height: 40,
              },
              {
                text: 'VALIDACION DE REGISTROS PARA LA APLICACION EN CONCEPTOS DE DESCUENTO',
                alignment: 'center',
                style: 'title',
                margin: [0, 10, 0, 0]
              }
            ]
          },

          // Información general
          {
            text: `Fecha de generación: ${new Date().toLocaleDateString('es-MX')}`,
            alignment: 'right',
            margin: [0, 10, 0, 30],
            fontSize: 10,
            color: '#666666'
          },

          // Sección RESUMEN
          {
            text: 'A CUENTA DE MOVS',
            style: 'sectionHeader',
            margin: [0, 0, 0, 10]
          },
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'Total', bold: true, fillColor: '#621132', color: 'white', alignment: 'center' },
                  { text: 'Altas', bold: true, fillColor: '#621132', color: 'white', alignment: 'center' },
                  { text: 'Bajas', fillColor: '#621132', color: 'white', alignment: 'center' },
                  { text: 'Modificaciones', bold: true, fillColor: '#621132', color: 'white', alignment: 'center' }
                ],
                ...resume.map((item: any) => [
                  { text: item.total || '0', alignment: 'center', style: 'textT' },
                  { text: item.altas || '0', alignment: 'center', style: 'textT' },
                  { text: item.bajas || '0', alignment: 'center', style: 'textT' },
                  { text: item.modificaciones || '0', alignment: 'center', style: 'textT' }
                ])
              ]
            },
            margin: [0, 0, 0, 25]
          },

          // Sección ACTUALIZACIONES (si hay datos)
          ...(actualizaciones.length > 0 ? [
            {
              text: 'Alta no aplicable por termina de contrato',
              style: 'sectionHeader',
              margin: [0, 0, 0, 10]
            },
            {
              table: {
                headerRows: 1,
                widths: ['auto', '*', '*', '*'],
                body: [
                  [
                    { text: 'Tipo_Orden', bold: true, fillColor: '#eeeeee', color: 'black', alignment: 'center' },
                    { text: 'RFC', bold: true, fillColor: '#eeeeee', color: 'black', alignment: 'center' },
                    { text: 'Nombre', bold: true, fillColor: '#eeeeee', color: 'black', alignment: 'center' },
                    { text: 'Motivo', bold: true, fillColor: '#eeeeee', color: 'black', alignment: 'center' }
                  ],
                  ...actualizaciones.map((item: any) => [
                    { text: item.tipo_orden || '---', alignment: 'center', style: 'textT' },
                    { text: item.rfc || '---', alignment: 'center', style: 'textT' },
                    { text: item.nombre || '---', alignment: 'left', style: 'textT' },
                    { text: item.mensaje || '---', alignment: 'left', style: 'textT' }
                  ])
                ]
              },
              margin: [0, 0, 0, 25]
            }
          ] : []),

          // Sección SIN LÍQUIDO (si hay datos)
          ...(sinLiquido.length > 0 ? [
            {
              text: 'Liquido Insuficiente',
              style: 'sectionHeader',
              margin: [0, 0, 0, 10]
            },
            {
              table: {
                headerRows: 1,
                widths: ['auto', '*', '*', 'auto', 'auto'],
                body: [
                  [
                    { text: 'Tipo_Orden', bold: true, fillColor: '#eeeeee', color: 'black', alignment: 'center' },
                    { text: 'RFC', bold: true, fillColor: '#eeeeee', color: 'black', alignment: 'center' },
                    { text: 'Nombre', bold: true, fillColor: '#eeeeee', color: 'black', alignment: 'center' },
                    { text: 'Descueto', bold: true, fillColor: '#eeeeee', color: 'black', alignment: 'center' },
                    { text: 'Liquido', bold: true, fillColor: '#eeeeee', color: 'black', alignment: 'center' }
                  ],
                  ...sinLiquido.map((item: any) => [
                    { text: item.registro || '---', alignment: 'center', style: 'textT' },
                    { text: item.rfc || '---', alignment: 'center', style: 'textT' },
                    { text: item.nombre || '---', alignment: 'left', style: 'textT' },
                    { text: item.descuento || '---', alignment: 'right', style: 'textT' },
                    { text: item.liquido || '---', alignment: 'right', style: 'textT' }
                  ])
                ]
              },
              margin: [0, 0, 0, 25]
            }
          ] : []),

          // Sección RFC POSIBLES (si hay datos)
          ...(possibleRFC.length > 0 ? [
            {
              text: 'Posible RFC',
              style: 'sectionHeader',
              margin: [0, 0, 0, 10]
            },
            {
              table: {
                headerRows: 1,
                widths: ['auto', '*', '*'],
                body: [
                  [
                    { text: 'Tipo_Orden ', bold: true, fillColor: '#eeeeee', color: 'black', alignment: 'center' },
                    { text: 'RFC Actual', bold: true, fillColor: '#eeeeee', color: 'black', alignment: 'center' },
                    { text: 'RFC Sugerido', bold: true, fillColor: '#eeeeee', color: 'black', alignment: 'center' }
                  ],
                  ...possibleRFC.map((item: any) => [
                    { text: item.tipoOrden || '---', alignment: 'center', style: 'textT' },
                    { text: item.rfcActual || '---', alignment: 'center', style: 'textT' },
                    { text: item.rfcSugerido || '---', alignment: 'center', style: 'textT' }

                  ])
                ]
              },
              margin: [0, 0, 0, 25]
            }
          ] : []),

          // Sección RECHAZOS (si hay datos)
          ...(rechazos.length > 0 ? [
            {
              text: 'Trab. no existente en el cpto, baja o modificacion',
              style: 'sectionHeader',
              margin: [0, 0, 0, 10]
            },
            {
              table: {
                headerRows: 1,
                widths: ['auto', '*', '*', '*'],
                body: [
                  [
                    { text: 'Tipo_Orden', bold: true, fillColor: '#eeeeee', color: 'black', alignment: 'center' },
                    { text: 'RFC', bold: true, fillColor: '#eeeeee', color: 'black', alignment: 'center' },
                    { text: 'Nombre', bold: true, fillColor: '#eeeeee', color: 'black', alignment: 'center' },
                    { text: 'Motivo del Rechazo', bold: true, fillColor: '#eeeeee', color: 'black', alignment: 'center' },
                  ],
                  ...rechazos.map((item: any) => [
                    { text: item.tipoOrden || '---', alignment: 'center', style: 'textT' },
                    { text: item.rfc || '---', alignment: 'center', style: 'textT' },
                    { text: item.nombre || '---', alignment: 'left', style: 'textT' },
                    { text: item.mensaje || '---', alignment: 'left', style: 'textT' }
                  ])
                ]
              },
              margin: [0, 0, 0, 25]
            }
          ] : []),

          // Footer
          {
            text: `Reporte generado automáticamente el ${new Date().toLocaleString('es-MX')}`,
            alignment: 'center',
            fontSize: 8,
            margin: [0, 30, 0, 0],
            color: '#666666',
            italics: true
          }
        ],

        styles: {
          title: {
            fontSize: 18,
            bold: true,
            color: '#621132'
          },
          sectionHeader: {
            fontSize: 14,
            bold: true,
            color: '#621132',
            decoration: 'underline',
            decorationColor: '#621132'
          },
          header: {
            fontSize: 12,
            bold: true
          },
          textT: {
            fontSize: 9
          }
        }
      };

      // Generar el PDF
      pdfMake.createPdf(documentDefinition).open();

      // Cerrar el loading y mostrar éxito
      Swal.fire({
        icon: 'success',
        title: '¡PDF Generado!',
        text: 'El reporte se ha generado correctamente',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      // Cerrar loading y mostrar error
      Swal.fire({
        icon: 'error',
        title: 'Error al generar PDF',
        text: 'Ocurrió un problema al generar el reporte. Intente nuevamente.',
        confirmButtonText: 'Entendido'
      });
      console.error('Error generando PDF:', error);
    }
  }

  // Función para convertir a número, manejando cadenas vacías o no válidas




}

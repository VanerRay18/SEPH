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
  selector: 'app-activas',
  templateUrl: './activas.component.html',
  styleUrls: ['./activas.component.css']
})
export class ActivasComponent {
  searchTerm: string = '';
  data: NominaA | null = null;
  zipFiles: File | null = null; // Nuevo arreglo para los archivos ZIP

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
    // console.log(this.data?.status)
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

  async generateReport(): Promise<void> {
    Swal.fire({
      title: 'Generando el Reporte..',
      html: 'Por favor, espere mientras se genera el Excel de los anexos.',
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
      showConfirmButton: false
    });

    try {
      await this.generateReporte(); // Espera a que se complete
      Swal.fire({
        icon: 'success',
        title: 'Reporte generado',
        text: 'El archivo Excel se ha generado correctamente.',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al generar el Reporte.',
      });
      console.error('Error al generar anexos:', error);
    }
  }

  generateReporte(): Promise<void> {
    return new Promise((resolve, reject) => {
      const quincena = this.data?.quincena;
      this.NominaBecService.getReportes(this.data?.id).subscribe({
        next: async response => {
          if (response && response.data && Array.isArray(response.data)) {
            const sortedData = response.data.sort((b, a) =>
              Number(b.NO_COMPROBANTE) - Number(a.NO_COMPROBANTE)
            );

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Reporte_Nomina');

            // Títulos
            const titleRow1 = worksheet.addRow(["Dirección General de Recursos Humanos"]);
            const titleRow2 = worksheet.addRow(["Dirección de Nómina y Control de Plazas"]);
            const titleRow3 = worksheet.addRow([`Nómina de sustitutos de becarios Qna. ${quincena}`]);
            worksheet.addRow([]);

            // Fusionar celdas
            worksheet.mergeCells('A1:N1'); // Dirección General de Recursos Humanos
            worksheet.mergeCells('A2:N2'); // Dirección de Nómina y Control de Plazas
            worksheet.mergeCells('A3:N3'); // Nómina de sustitutos de becarios

            // Aplicar estilos
            [titleRow1, titleRow2, titleRow3].forEach(row => {
              row.eachCell(cell => {

                cell.font = { bold: true };
                cell.alignment = { horizontal: 'left' };
              });
            });
            // Encabezados con subcolumnas
            const headersRow1 = worksheet.addRow([
              "No comprobante", "RFC", "CURP", "NOMBRE(S)", "APELLIDO P", "APELLIDO M",
              "FECHA INICIO", "FECHA TERMINO", "CLAVE PLAZA","DEDUCCIONES", "", "PERCEPCIONES", "", "NETO","CATEGORIA"
            ]);
            const headersRow2 = worksheet.addRow([
              "", "", "", "", "", "", "", "", "","CPTO", "IMPORTE", "CPTO", "IMPORTE", "",""
            ]);

            worksheet.mergeCells('J5:K5'); // Fusionar "DEDUCCIONES"
            worksheet.mergeCells('L5:M5'); // Fusionar "PERCEPCIONES"

            // Aplicar estilos a los encabezados
            [headersRow1, headersRow2].forEach(row => {
              row.eachCell(cell => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D3D3D3' } };
                cell.font = { bold: true };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
              });
            });

            // Agregar datos
            sortedData.forEach(item => {
              const row = worksheet.addRow([
                item.NO_COMPROBANTE, item.RFC, item.CURP, item.NOMBRE, item.PRIMER_APELLIDO,
                item.SEGUNDO_APELLIDO, item.FECHA_INICIO, item.FECHA_TERMINO, item.CLAVE_PLAZA,
                item.uno, item.DEDUCCIONES, item.cuatro, item.PERCEPCIONES, item.NETO,item.CATEGORIA
              ]);

              row.eachCell((cell, colNumber) => {
                cell.alignment = { horizontal: colNumber >= 10 ? 'right' : 'left' };
              });
            });

            // Ajustar ancho de columnas
            worksheet.columns.forEach((column, index) => {
              column.width = index < 9 ? 18 : 12;
            });

            // Generar archivo Excel
            const buffer = await workbook.xlsx.writeBuffer();
            this.saveAsExcelFile(buffer, `Reporte_Nomina_${quincena}`);
            resolve();
          } else {
            reject('Datos no válidos en la respuesta');
          }
        },
        error: err => {
          reject(err);
        }
      });
    });
  }

   private saveAsExcelFile(buffer: any, fileName: string): void {
      const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
      saveAs(data, `${fileName}.xlsx`);
    }


     generateFUUPS(): Promise<Blob> {
        return new Promise((resolve, reject) => {
          this.NominaBecService.downloadZip().subscribe({
            next: (response) => {
              const blob = response.body; // Recibir directamente el archivo ZIP

              if (!blob) {
                reject('El archivo ZIP no se recibió correctamente.');
                return;
              }

              // Obtener el nombre del archivo desde el header Content-Disposition
              const contentDisposition = response.headers.get('Content-Disposition');
              let filename = 'fupps.zip'; // Nombre por defecto

              if (contentDisposition) {
                const matches = contentDisposition.match(/filename="(.+)"/);
                if (matches && matches.length > 1) {
                  filename = matches[1]; // Extraer el nombre real
                  console.log("JJSJSJSJS : " + filename)
                }
              }

              // Crear un enlace invisible para descargar el archivo
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              window.URL.revokeObjectURL(url);

              resolve(blob); // ✅ Retornar el Blob correctamente
            },
            error: (err) => {
              reject(err);
            }
          });
        });
      }




      // La función addFUUPS debe manejar la agregación correctamente:
      async addFUUPS(): Promise<void> {
        Swal.fire({
          title: 'Generando FUUPS...',
          text: 'Por favor espera, estamos generando el archivo...',
          icon: 'info',
          showConfirmButton: false,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        try {
          const zipBlob = await this.generateFUUPS(); // Espera la descarga del ZIP

          // Obtener el nombre real desde `this.data2?.quincena`
          const zipFileName = `fups_${this.data?.quincena}.zip`;

          // Crear el archivo ZIP con el nombre correcto
          this.zipFiles = new File([zipBlob], zipFileName, { type: 'application/zip' });

          Swal.fire({
            title: 'Éxito',
            text: 'El archivo FUUPS se ha generado correctamente.',
            icon: 'success',
            confirmButtonText: 'OK'
          });

        } catch (error) {
          // console.error('Error al agregar el archivo FUUPS:', error);
          Swal.fire('Error', 'No se pudo generar el archivo FUUPS', 'error');
        }
      }
}




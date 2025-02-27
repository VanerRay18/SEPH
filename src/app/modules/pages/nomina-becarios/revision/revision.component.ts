import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { NominaBecService } from 'src/app/services/nomina-bec.service';
import { Anexo06, NominaA, Reporte, Resumen } from 'src/app/shared/interfaces/utils';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { PermisosUserService } from 'src/app/services/permisos-user.service';
import { saveAs } from 'file-saver';
import { Anexo05 } from 'src/app/shared/interfaces/utils';
import { ChangeDetectorRef } from '@angular/core';
import * as ExcelJS from 'exceljs';

@Component({
  selector: 'app-revision',
  templateUrl: './revision.component.html',
  styleUrls: ['./revision.component.css']
})
export class RevisionComponent {
  searchTerm: string = '';
  headers = ['NO_COMPROBANTE', 'UR', 'PERIODO', 'TIPO_NOMINA', 'PRIMER_APELLIDO', 'SEGUNDO_APELLIDO', 'NOMBRE(S)', 'CLAVE_PLAZA', 'CURP', 'RFC', 'FECHA_PAGO', 'FECHA_INICIO', 'FECHA_TERMINO', 'PERCEPCIONES', 'DEDUCCIONES', 'NETO', 'NSS', 'CCT', 'FORMA_PAGO', 'CVE_BANCO', 'CLABE', 'NIVEL_CM', 'DOMINGOS_TRABAJADOS', 'DIAS_HORAS_EXTRA', 'TIPO_HORAS_EXTRA', 'SEMANAS_HORAS_EXTRA', 'HORAS_EXTRAS'];
  displayedColumns = ['NO_COMPROBANTE', 'UR', 'PERIODO', 'TIPO_NOMINA', 'PRIMER_APELLIDO', 'SEGUNDO_APELLIDO', 'NOMBRE', 'CLAVE_PLAZA', 'CURP', 'RFC', 'FECHA_PAGO', 'FECHA_INICIO', 'FECHA_TERMINO', 'PERCEPCIONES', 'DEDUCCIONES', 'NETO', 'NSS', 'CT', 'FORMA_PAGO', 'CVE_BANCO', 'CLABE', 'NIVEL_CM', 'DOMINGOS_TRABAJADOS', 'DIAS_HORAS_EXTRA', 'TIPO_HORAS_EXTRA(S)', 'SEMANAS_HORAS_EXTRA', 'HORAS_EXTRAS'];
  data = [];

  tabs = [
    { id: 'anexo5', title: 'Anexo 5', icon: 'fa-solid fa-file-csv' },
    { id: 'anexo6', title: 'Anexo 6', icon: 'fa-solid fa-file-csv' },
    { id: 'anexo5Extra', title: 'Anexo 5 Extra', icon: 'fa-solid fa-file-csv' },
    { id: 'anexo6Extra', title: 'Anexo 6 Extra', icon: 'fa-solid fa-file-csv' },
  ];

  eliminar: boolean = false;
  agregar: boolean = false;
  modificar: boolean = false;
  autorizar: boolean = false;

  isLoading = true;
  activeTab: string = 'anexo5';
  nominaId: any;
  status = 3;
  data2: NominaA | null = null;
  resumen: Resumen = {
    clabes: 0,
    plazas: 0,
    deducciones: '',
    personas: 0,
    percepciones: '',
    liquido: ''
  };


  constructor(
    private NominaBecService: NominaBecService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private PermisosUserService: PermisosUserService
  ) {
    // Registrar las fuentes necesarias
  }

  async ngOnInit(): Promise<void> {
    this.isLoading = true;
    this.nominaId = await this.loadNominaId();
    this.fetchData();

    this.PermisosUserService.getPermisosSpring(this.PermisosUserService.getPermisos().NominasB).subscribe((response: ApiResponse) => {
      this.eliminar = response.data.eliminar
      this.modificar = response.data.editar
      this.agregar = response.data.agregar
      this.autorizar = response.data.autorizar
    });
  }

  async loadNominaId() {
    const nominaId = await this.NominaBecService.getNominaId();
    return nominaId
  }

  setActiveTab(tabId: string) {
    this.activeTab = tabId; // Cambia la pestaña activa
  }

  fetchData() {
    this.NominaBecService.getNomina().subscribe((response: ApiResponse) => {
      this.data2 = response.data;
    },
      (error) => {
        console.error('Error al obtener los datos:', error);
      });
    let ordinaria = true;
    this.NominaBecService.getAnexo05(this.nominaId, ordinaria).subscribe((response: ApiResponse) => {
      this.data = response.data; // Aquí concatenas las fechas
      this.cdr.detectChanges();
      // console.log(this.data)
      this.isLoading = this.data.length === 0;
    },
      (error) => {
        console.error('Error al obtener los datos:', error);
        this.isLoading = false;
      });

      this.NominaBecService.getResumeExel(this.nominaId).subscribe((response: ApiResponse) => {
        this.resumen = response.data; // Aquí concatenas las fechas

      },
        (error) => {
          console.error('Error al obtener los datos:', error);
        });
  }

  saveNomina(event: any): void {
    // console.log(this.status, this.nominaId)
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
    this.router.navigate(['/pages/NominaBecarios/Nominas-Enviar']);
    this.fetchData();
  }

  autorizarNomina(): void {
    let status = 4;
    Swal.fire({
      title: 'Confirmar',
      html: `¿Está seguro de autorizar la nomina?<br><br>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, autorizar',
      cancelButtonText: 'No, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.NominaBecService.changeStatus(this.nominaId, status).subscribe(
          response => {
            console.log('Se cambio el status');
            this.fetchData();
            this.router.navigate(['/pages/NominaBecarios/Nominas-Activas']);
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
      await this.generateExcelAnexo5(); // Espera a que se complete
      await this.generateExcelAnexo6(); // Espera a que se complete
      await this.generateExcelAnexo5Extr();
      await this.generateExcelAnexo6Extr();
      Swal.fire({
        icon: 'success',
        title: 'Anexos generados',
        text: 'El archivo Excel se ha generado correctamente.',
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al generar los anexos.',
      });
      console.error('Error al generar anexos:', error);
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

  private toNumber(value: string): number {
    // Limpiar el valor de caracteres no numéricos (como '$' y ',')
    const cleanedValue = value.replace(/[\$,]/g, '').trim();  // Elimina '$' y ',' y espacios extras
    const parsed = parseFloat(cleanedValue);  // Convertir el valor limpio a número
    return isNaN(parsed) ? 0 : parsed;  // Si no es un número, devolver 0
  }

  generateReporte(): Promise<void> {
    return new Promise((resolve, reject) => {
      const quincena = this.data2?.quincena;
      this.NominaBecService.getReportes(this.nominaId).subscribe({
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
              "FECHA INICIO", "FECHA TERMINO", "CLAVE PLAZA", "DEDUCCIONES", "", "PERCEPCIONES", "", "NETO"
            ]);
            const headersRow2 = worksheet.addRow([
              "", "", "", "", "", "", "", "", "", "CPTO", "IMPORTE", "CPTO", "IMPORTE", ""
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
                item.uno, item.DEDUCCIONES, item.cuatro, item.PERCEPCIONES, item.NETO
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


  generateExcelAnexo5(): Promise<void> {
    return new Promise((resolve, reject) => {
      const quincena = this.data2?.quincena;
      let ordinaria = true;

      this.NominaBecService.getAnexo05(this.nominaId, ordinaria).subscribe({
        next: async response => {
          if (response && response.data && Array.isArray(response.data)) {
            const headers = [
              'NO_COMPROBANTE', 'UR', 'PERIODO', 'TIPO_NOMINA', 'PRIMER_APELLIDO', 'SEGUNDO_APELLIDO',
              'NOMBRE', 'CLAVE_PLAZA', 'CURP', 'RFC', 'FECHA_PAGO', 'FECHA_INICIO', 'FECHA_TERMINO',
              'PERCEPCIONES', 'DEDUCCIONES', 'NETO', 'NSS', 'CTT', 'FORMA_PAGO', 'CVE_BANCO', 'CLABE',
              'NIVEL_CM', 'DOMINGOS_TRABAJADOS', 'DIAS_HORAS_EXTRA', 'TIPO_HORAS_EXTRA',
              'SEMANAS_HORAS_EXTRA', 'HORAS_EXTRAS'
            ];

            const sortedData = response.data.sort((b, a) =>
              Number(b.NO_COMPROBANTE) - Number(a.NO_COMPROBANTE)
            );

            const excelData = sortedData.map((item: Anexo05) => ([
              item.NO_COMPROBANTE, item.UR, item.PERIODO, item.TIPO_NOMINA, item.PRIMER_APELLIDO,
              item.SEGUNDO_APELLIDO, item.NOMBRE, item.CLAVE_PLAZA, item.CURP, item.RFC, item.FECHA_PAGO,
              item.FECHA_INICIO, item.FECHA_TERMINO, this.toNumber(item.PERCEPCIONES), this.toNumber(item.DEDUCCIONES), this.toNumber(item.NETO),
              item.NSS, item.CT, item.FORMA_PAGO, item.CVE_BANCO, item.CLABE, item.NIVEL_CM,
              item.DOMINGOS_TRABAJADOS, item.DIAS_HORAS_EXTRA, item.TIPO_HORAS_EXTRA,
              item.SEMANAS_HORAS_EXTRA, item.HORAS_EXTRAS
            ]));

            // Unir encabezados con los datos
            const hojaCompleta = [headers, ...excelData];

            // Crear hoja de Excel
            const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(hojaCompleta);

            // Ajustar ancho de columnas
            worksheet['!cols'] = headers.map(() => ({ wpx: 120 }));


            // Crear libro de Excel
            const workbook: XLSX.WorkBook = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(workbook, worksheet, 'Anexo05');



            // Generar archivo Excel
            const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

            // Guardar el archivo
            this.saveAsExcelFile(excelBuffer, `Anexo05_Ordinario ${quincena}`);
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

  generateExcelAnexo5Extr(): Promise<void> {
    return new Promise((resolve, reject) => {
      const quincena = this.data2?.quincena;
      let ordinaria = false;

      this.NominaBecService.getAnexo05(this.nominaId, ordinaria).subscribe({
        next: async response => {
          if (response && response.data && Array.isArray(response.data)) {
            const headers = [
              'NO_COMPROBANTE', 'UR', 'PERIODO', 'TIPO_NOMINA', 'PRIMER_APELLIDO', 'SEGUNDO_APELLIDO',
              'NOMBRE', 'CLAVE_PLAZA', 'CURP', 'RFC', 'FECHA_PAGO', 'FECHA_INICIO', 'FECHA_TERMINO',
              'PERCEPCIONES', 'DEDUCCIONES', 'NETO', 'NSS', 'CTT', 'FORMA_PAGO', 'CVE_BANCO', 'CLABE',
              'NIVEL_CM', 'DOMINGOS_TRABAJADOS', 'DIAS_HORAS_EXTRA', 'TIPO_HORAS_EXTRA',
              'SEMANAS_HORAS_EXTRA', 'HORAS_EXTRAS'
            ];

            const sortedData = response.data.sort((b, a) =>
              Number(b.NO_COMPROBANTE) - Number(a.NO_COMPROBANTE)
            );

            const excelData = sortedData.map((item: Anexo05) => ([
              item.NO_COMPROBANTE, item.UR, item.PERIODO, item.TIPO_NOMINA, item.PRIMER_APELLIDO,
              item.SEGUNDO_APELLIDO, item.NOMBRE, item.CLAVE_PLAZA, item.CURP, item.RFC, item.FECHA_PAGO,
              item.FECHA_INICIO, item.FECHA_TERMINO,this.toNumber(item.PERCEPCIONES), this.toNumber(item.DEDUCCIONES), this.toNumber(item.NETO),
              item.NSS, item.CT, item.FORMA_PAGO, item.CVE_BANCO, item.CLABE, item.NIVEL_CM,
              item.DOMINGOS_TRABAJADOS, item.DIAS_HORAS_EXTRA, item.TIPO_HORAS_EXTRA,
              item.SEMANAS_HORAS_EXTRA, item.HORAS_EXTRAS
            ]));

            // Unir encabezados con los datos
            const hojaCompleta = [headers, ...excelData];

            // Crear hoja de Excel
            const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(hojaCompleta);

            // Ajustar ancho de columnas
            worksheet['!cols'] = headers.map(() => ({ wpx: 120 }));

            // Crear libro de Excel
            const workbook: XLSX.WorkBook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Anexo05_Extraordinario');

            // Generar archivo Excel
            const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

            // Guardar el archivo
            this.saveAsExcelFile(excelBuffer, `Anexo05_Extraordinario ${quincena}`);
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

  generateExcelAnexo6(): Promise<void> {
    return new Promise((resolve, reject) => {
      const quincena = this.data2?.quincena;
      let ordinaria = true;

      this.NominaBecService.getAnexo06(this.nominaId, ordinaria).subscribe({
        next: async response => {
          if (response && response.data && Array.isArray(response.data)) {
            const headers = [
              'NO_COMPROBANTE', 'UR', 'PERIODO', 'TIPO_NOMINA', 'CLAVE_PLAZA', 'CURP', 'TIPO_CONCEPTO', 'COD_CONCEPTO', 'DESC_CONCEPTO', 'IMPORTE',
              'BASE_CALCULO_ISR'
            ];

            const sortedData = response.data.sort((b, a) =>
              Number(b.NO_COMPROBANTE) - Number(a.NO_COMPROBANTE)
            );

            const excelData = sortedData.map((item: Anexo06) => ([
              item.NO_COMPROBANTE, item.UR, item.PERIODO, item.TIPO_NOMINA, item.CLAVE_PLAZA, item.CURP, item.TIPO_CONCEPTO, item.COD_CONCEPTO,
              item.DESC_CONCEPTO,this.toNumber(item.IMPORTE), item.BASE_CALCULO_ISR
            ]));

            // Unir encabezados con los datos
            const hojaCompleta = [headers, ...excelData];

            // Crear hoja de Excel
            const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(hojaCompleta);

            // Ajustar ancho de columnas
            worksheet['!cols'] = headers.map(() => ({ wpx: 120 }));

            // Crear libro de Excel
            const workbook: XLSX.WorkBook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Anexo06');

            // Generar archivo Excel
            const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

            // Guardar el archivo
            this.saveAsExcelFile(excelBuffer, `Anexo06_Ordinario ${quincena}`);
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


  generateExcelAnexo6Extr(): Promise<void> {
    return new Promise((resolve, reject) => {
      const quincena = this.data2?.quincena;
      let ordinaria = false;

      this.NominaBecService.getAnexo06(this.nominaId, ordinaria).subscribe({
        next: async response => {
          if (response && response.data && Array.isArray(response.data)) {
            const headers = [
              'NO_COMPROBANTE', 'UR', 'PERIODO', 'TIPO_NOMINA', 'CLAVE_PLAZA', 'CURP', 'TIPO_CONCEPTO', 'COD_CONCEPTO', 'DESC_CONCEPTO', 'IMPORTE',
              'BASE_CALCULO_ISR'
            ];

            const sortedData = response.data.sort((b, a) =>
              Number(b.NO_COMPROBANTE) - Number(a.NO_COMPROBANTE)
            );

            const excelData = sortedData.map((item: Anexo06) => ([
              item.NO_COMPROBANTE, item.UR, item.PERIODO, item.TIPO_NOMINA, item.CLAVE_PLAZA, item.CURP, item.TIPO_CONCEPTO, item.COD_CONCEPTO,
              item.DESC_CONCEPTO,this.toNumber(item.IMPORTE), item.BASE_CALCULO_ISR
            ]));

            // Unir encabezados con los datos
            const hojaCompleta = [headers, ...excelData];

            // Crear hoja de Excel
            const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(hojaCompleta);

            // Ajustar ancho de columnas
            worksheet['!cols'] = headers.map(() => ({ wpx: 120 }));

            // Crear libro de Excel
            const workbook: XLSX.WorkBook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Anexo06_Extraordinario');

            // Generar archivo Excel
            const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

            // Guardar el archivo
            this.saveAsExcelFile(excelBuffer, `Anexo06_Extraordinario ${quincena}`);
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

  // Método para guardar el archivo Excel
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, `${fileName}.xlsx`);
  }

}

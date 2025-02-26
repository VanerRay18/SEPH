import { ChangeDetectorRef, Component } from '@angular/core';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { NominaBecService } from 'src/app/services/nomina-bec.service';
import { NominaA } from 'src/app/shared/interfaces/utils';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Anexo06} from 'src/app/shared/interfaces/utils';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Anexo05 } from 'src/app/shared/interfaces/utils';
import { OnChanges, SimpleChanges } from '@angular/core';


@Component({
  selector: 'app-calcular',
  templateUrl: './calcular.component.html',
  styleUrls: ['./calcular.component.css']
})
export class CalcularComponent {
  searchTerm: string = '';
  headers = ['Nombre', 'CURP', 'Percepciones', 'Deducciones', 'Total', 'Detalles'];
  displayedColumns = ['nombre', 'curp', 'importTotal', 'retentionTotal', 'liquidTotal'];
  data = [];
  nominaId :any;
  status = localStorage.getItem('status')!;
  data2: NominaA | null = null;
  isButtonDisabled: boolean = false;
  isButtonDisabled2: boolean = false;
  isLoading = true;

  constructor(
    private router: Router,
    private NominaBecService: NominaBecService,
    private cdr: ChangeDetectorRef
  ) {
    // Registrar las fuentes necesarias
  }
  async ngOnInit(): Promise<void> {
    this.nominaId = await this.loadNominaId();
    this.fetchData();
    this.isLoading =true;

  }


  async loadNominaId() {
    const nominaId = await this.NominaBecService.getNominaId();
    return nominaId
  }

  onContinueNomina() {
    this.continueNomina();  // Primero ejecuta la lógica de continuar la nómina

    // Si continueNomina() es síncrona
    this.fetchData();
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
      this.isLoading = this.data.length === 0;
    },
      (error) => {
        console.error('Error al obtener los datos:', error);
      });


  }

  showDetails(row: any) {

    const detalles = row.detalles;

    let tableHtml = `
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>Pago</th>
            <th>Tipo</th>
            <th>Plaza</th>
            <th>Quincenas</th>
            <th>Total</th>
            <th>Retención</th>
            <th>Líquido</th>
          </tr>
        </thead>
        <tbody>
          ${detalles.map((item: any) => `
            <tr>
              <td>${item.pago || 'N/A'}</td>
              <td>${item.type || 'N/A'}</td>
              <td>${item.plaza || 'N/A'}</td>
              <td>${item.quincenas || 'N/A'}</td>
              <td>${item.import || 'N/A'}</td>
              <td>${item.retention || 'N/A'}</td>
              <td>${item.liquid || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;

    Swal.fire({
      title: 'Detalles del Pago',
      html: tableHtml,
      width: '1000px',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#3085d6',
      backdrop: true,
    });
  }

  saveNomina(): void {

    if (this.data2?.status == 1) {
      this.isButtonDisabled = true;

    } else {
      this.isButtonDisabled = false;

      Swal.fire({
        title: 'Confirmar',
        html: `¿Está seguro de que los calculos de la nomina estan correctos?<br><br>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'No, cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
           // Mostrar spinner de carga
                  Swal.fire({
                    title: 'Guardando la nomina...',
                    html: 'Por favor, espere mientras se guarda la nomina.',
                    didOpen: () => {
                      Swal.showLoading();
                    },
                    allowOutsideClick: false,
                    showConfirmButton: false
                  });
          // El usuario confirmó, proceder a enviar los datos
          this.NominaBecService.saveNomina(this.data).subscribe(
            response => {
              this.fetchData();
              Swal.fire({
                title: 'Nomina Guardada',
                text: 'Se guardo la Nomina correctamente',
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

    }
  }

  continueNomina(): void{
    this.router.navigate(['/pages/NominaBecarios/Nominas-Pagar']);
    this.fetchData();
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
        await this.generateExcelAnexo5Extra(); // Espera a que se complete
        await this.generateExcelAnexo6Extra();
        await this.generateExcelAnexo5(); // Espera a que se complete
        await this.generateExcelAnexo6(); // Espera a que se complete
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

    // Función para convertir a número, manejando cadenas vacías o no válidas
    private toNumber(value: string): number {
      // Limpiar el valor de caracteres no numéricos (como '$' y ',')
      const cleanedValue = value.replace(/[\$,]/g, '').trim();  // Elimina '$' y ',' y espacios extras
      const parsed = parseFloat(cleanedValue);  // Convertir el valor limpio a número
      return isNaN(parsed) ? 0 : parsed;  // Si no es un número, devolver 0
    }


    generateExcelAnexo5(): Promise<void> {
      return new Promise((resolve, reject) => {
        const quincena = this.data2?.quincena;
        let ordinaria = true;

        this.NominaBecService.getPreAnexo5(this.nominaId, ordinaria).subscribe({
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
              this.saveAsExcelFile(excelBuffer, `PreAnexo05_Ordinaria_${quincena}`);
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

    generateExcelAnexo5Extra(): Promise<void> {
      return new Promise((resolve, reject) => {
        const quincena = this.data2?.quincena;
        let ordinaria = false;

        this.NominaBecService.getPreAnexo5(this.nominaId, ordinaria).subscribe({
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
              XLSX.utils.book_append_sheet(workbook, worksheet, 'Anexo05');

              // Generar archivo Excel
              const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

              // Guardar el archivo
              this.saveAsExcelFile(excelBuffer, `PreAnexo05_Extraordinaria_${quincena}`);
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

        this.NominaBecService.getPreAnexo6(this.nominaId, ordinaria).subscribe({
          next: async response => {
            if (response && response.data && Array.isArray(response.data)) {
              const headers = [
                'NO_COMPROBANTE', 'UR', 'PERIODO', 'TIPO_NOMINA','CLAVE_PLAZA', 'CURP', 'TIPO_CONCEPTO', 'COD_CONCEPTO', 'DESC_CONCEPTO', 'IMPORTE',
                'BASE_CALCULO_ISR'
              ];

              const sortedData = response.data.sort((b, a) =>
                Number(b.NO_COMPROBANTE) - Number(a.NO_COMPROBANTE)
              );

              const excelData = sortedData.map((item: Anexo06) => ([
                item.NO_COMPROBANTE, item.UR, item.PERIODO, item.TIPO_NOMINA, item.CLAVE_PLAZA, item.CURP, item.TIPO_CONCEPTO, item.COD_CONCEPTO,
                item.DESC_CONCEPTO, this.toNumber(item.IMPORTE), item.BASE_CALCULO_ISR
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
              this.saveAsExcelFile(excelBuffer, `PreAnexo06_Ordinaria_${quincena}`);
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
    generateExcelAnexo6Extra(): Promise<void> {
      return new Promise((resolve, reject) => {
        const quincena = this.data2?.quincena;
        let ordinaria = false;

        this.NominaBecService.getPreAnexo6(this.nominaId, ordinaria).subscribe({
          next: async response => {
            if (response && response.data && Array.isArray(response.data)) {
              const headers = [
                'NO_COMPROBANTE', 'UR', 'PERIODO', 'TIPO_NOMINA','CLAVE_PLAZA', 'CURP', 'TIPO_CONCEPTO', 'COD_CONCEPTO', 'DESC_CONCEPTO', 'IMPORTE',
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
              this.saveAsExcelFile(excelBuffer, `PreAnexo06_Extraordinaria_${quincena}`);
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

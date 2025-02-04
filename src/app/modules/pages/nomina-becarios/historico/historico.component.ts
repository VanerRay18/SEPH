import { Anexo05, Anexo06, NominaH } from './../../../../shared/interfaces/utils';
import { Component } from '@angular/core';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { NominaBecService } from 'src/app/services/nomina-bec.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { NominaA } from 'src/app/shared/interfaces/utils';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-historico',
  templateUrl: './historico.component.html',
  styleUrls: ['./historico.component.css']
})
export class HistoricoComponent {
    headers = ['Nombre', 'CURP', 'Percepciones', 'Deducciones', 'Total', 'Detalles', ''];
    displayedColumns = ['nombre', 'curp', 'importTotal', 'retentionTotal', 'liquidTotal'];
    data: NominaA | null = null;
    nominaId:any;
    data2 : NominaH [] = [];


    constructor(

      private NominaBecService: NominaBecService,

    ) {
      // Registrar las fuentes necesarias
    }
    async ngOnInit(): Promise<void> {
      this.nominaId = await this.loadNominaId();
      this.fetchData();

    }


    async loadNominaId() {
      const nominaId = await this.NominaBecService.getNominaId();
    }

    fetchData() {

      this.NominaBecService.getHistory().subscribe((response: ApiResponse) => {
        this.data2 = response.data;
      },
        (error) => {
          console.error('Error al obtener los datos:', error);
        });

        this.NominaBecService.getNomina().subscribe((response: ApiResponse) => {
          this.data = response.data;
        },
          (error) => {
            console.error('Error al obtener los datos:', error);
          });

    }

 generateExcelAnexo5(nominaId :any): Promise<void> {
      Swal.fire({
        title: 'Generando los Anexos..',
        html: 'Por favor, espere mientras se genera el Excel de los anexos.',
        didOpen: () => {
          Swal.showLoading();
        },
        allowOutsideClick: false,
        showConfirmButton: false
      });
    return new Promise((resolve, reject) => {
      const quincena = this.data?.quincena;

      this.NominaBecService.getAnexo05(nominaId).subscribe({
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
              item.FECHA_INICIO, item.FECHA_TERMINO, item.PERCEPCIONES, item.DEDUCCIONES, item.NETO,
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
            this.saveAsExcelFile(excelBuffer, `Anexo05 ${quincena}`);
            Swal.close();
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

  generateExcelAnexo6(nominaId :any): Promise<void> {
        Swal.fire({
          title: 'Generando los Anexos..',
          html: 'Por favor, espere mientras se genera el Excel de los anexos.',
          didOpen: () => {
            Swal.showLoading();
          },
          allowOutsideClick: false,
          showConfirmButton: false
        });
    return new Promise((resolve, reject) => {
      const quincena = this.data?.quincena;

      this.NominaBecService.getAnexo06(nominaId).subscribe({
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
              item.DESC_CONCEPTO, item.IMPORTE, item.BASE_CALCULO_ISR
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
            this.saveAsExcelFile(excelBuffer, `Anexo06 ${quincena}`);
            Swal.close();
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

  getCurrentFormattedDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Los meses empiezan en 0
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  }

  generateDailyNumber(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Asegura dos dígitos
    const day = today.getDate().toString().padStart(2, '0');          // Asegura dos dígitos

    // Concatenar día, mes y año para generar el número único
    const dailyNumber = `${day}${month}${year}`;

    return dailyNumber;
}

  // generatePdfNomina() {
//   const dailyNumber = this.generateDailyNumber();
//   const formattedDate = this.getCurrentFormattedDate();
//   this.NominaBecService.getLicenciasArchivo().subscribe(async response => {
//     if (response && response.data && Array.isArray(response.data)) {

//       const sortedData = response.data.sort((a, b) => {
//         const nameA = a.rfc.toLowerCase();
//         const nameB = b.rfc.toLowerCase();
//         return nameA.localeCompare(nameB); // Orden alfabético
//       });


//       const data = sortedData.map((item, index) => ({
//         no: index + 1, // Número autoincremental
//         nombre: item.nombre,
//         rfc: item.rfc,
//         licenciasMedicas: item.folio
//       }));
//       const imageBase64 = await this.ImageToBaseService.convertImageToBase64('assets/IHE_LOGO.png');
//       const documentDefinition: any = {
//         pageOrientation: 'landscape',

//         content: [
//           {
//             table: {
//               widths: ['auto', '*'], // Asegura que solo haya dos columnas como especificado
//               body: [
//                 [
//                   {
//                     image: imageBase64,
//                     alignment: 'left',
//                     width: 170,
//                     height: 50,
//                     margin: [0, 0, 0, 30]
//                   },
//                   {
//                     text: 'Coordinación General de Administración y Finanzas\nDirección General de Recursos Humanos\nDirección de Nómina y Control de Plazas',
//                     alignment: 'right',
//                     bold: true,
//                     color: '#621132',
//                     margin: [0, 0, 0, 30]
//                   }
//                 ],
//                 [

//                   {
//                     text: 'Para: Lic. Brenda Martínez Alavéz\nJefa de la Unidad Técnica de Resguardo Documental\n\n De: Lic. Guillermo Paredes Camarena\nSubdirector de incidencias y Control de Plazas',
//                     alignment: 'left',
//                     bold: true
//                   },
//                   {
//                     text: `NO. OFICIO: DNCP/SNI/${dailyNumber}/2024\nFECHA: ${formattedDate}`,
//                     alignment: 'right'
//                   }
//                 ]
//               ]
//             },
//             layout: 'noBorders', // Sin bordes para la tabla de encabezado
//           },
//           { text: '', margin: [0, 30, 0, 0] }, // Espacio de 20 unidades de margen arriba
//           {
//             table: {
//               headerRows: 1,
//               widths: ['auto', '*', 'auto', 'auto'], // Anchos para las columnas de la tabla
//               body: [
//                 // Encabezados de la tabla
//                 [
//                   { text: 'No.', bold: true, color: '#FFFFFF', fillColor: '#621132', alignment: 'center' },
//                   { text: 'Nombre', bold: true, color: '#FFFFFF', fillColor: '#621132', alignment: 'center' },
//                   { text: 'RFC', bold: true, color: '#FFFFFF', fillColor: '#621132', alignment: 'center' },
//                   { text: 'Licencias Médicas', bold: true, color: '#FFFFFF', fillColor: '#621132', alignment: 'center' },

//                 ],
//                 // Filas de contenido de la tabla
//                 ...data.map(item => [
//                   { text: item.no, color: '#000000', fillColor: '#FFFFFF', alignment: 'left' },
//                   { text: item.nombre, color: '#000000', fillColor: '#FFFFFF', alignment: 'left' },
//                   { text: item.rfc, color: '#000000', fillColor: '#FFFFFF', alignment: 'left' },
//                   { text: item.licenciasMedicas, color: '#000000', fillColor: '#FFFFFF', alignment: 'left' },

//                 ])
//               ]
//             },
//             layout: {
//               hLineWidth: () => 0.5, // Grosor de las líneas horizontales
//               vLineWidth: () => 0.5, // Grosor de las líneas verticales
//               hLineColor: () => '#000000', // Color de las líneas horizontales
//               vLineColor: () => '#000000', // Color de las líneas verticales
//             }
//           }
//         ],
//         styles: {
//           header: {
//             fontSize: 18,
//             bold: true,
//             alignment: 'center'
//           },
//           subheader: {
//             fontSize: 14,
//             bold: true,
//             alignment: 'center'
//           },
//           tableHeader: {
//             bold: true,
//             fontSize: 12,
//             fillColor: '#621132',
//             color: 'white'
//           }
//         }
//       };

//       pdfMake.createPdf(documentDefinition).open();


//     }
//   });
// }

}

import { LicenciasService } from 'src/app/services/licencias-service/licencias.service';
import { Component, OnInit } from '@angular/core';
import { ApiResponse } from 'src/app/models/ApiResponse';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ImageToBaseService } from './../../../../services/image-to-base.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';



@Component({
  selector: 'app-archivo-licencias',
  templateUrl: './archivo-licencias.component.html',
  styleUrls: ['./archivo-licencias.component.css']
})
export class ArchivoLicenciasComponent implements OnInit {
  searchTerm: string = '';
  headers = ['No.', 'Nombre', 'RFC','Licencias Médicas'];
  displayedColumns = ['no', 'nombre', 'rfc','folio'];
  data: any[] = [];
  readonly  EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  readonly  EXCEL_EXTENSION = '.xlsx';


  constructor(
    private fb: FormBuilder,
    private LicenciasService: LicenciasService,
    private ImageToBaseService: ImageToBaseService
  ) {
    // Registrar las fuentes necesarias
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
  }

  date: string = '';
  fechaform!: FormGroup;
  private pdfId: string = 'licencias_antiguas';

  ngOnInit(): void {
    this.fetchData();
    this.form();
  }

  form() {
    this.fechaform = this.fb.group({
      dia_arch: ['', Validators.required],

    });
  }


  fetchData() {
    this.LicenciasService.getLicenciasArchivo().subscribe((response: ApiResponse) => {
      if (response && response.data && Array.isArray(response.data)) {
        // console.log(response)
        // Asignar el número autoincrementable a cada fila
        this.data = response.data.map((item, index) => ({
          ...item,
          no: index + 1 // Añadir el número de fila autoincremental (inicia en 1)
        }));
        // console.log(this.data);
      } else {
        console.error('La respuesta no contiene un array de datos.');
      }
    },
      (error) => {
        console.error('Error al obtener los datos:', error);
      }
    );
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


  generateUniqueNumber(fecha: string): string {
    // Convertir fecha en un número único concatenando día, mes y año
    const [year, month, day] = fecha.split('-');
    const fechaUnica = `${day}${month}${year}`; // Concatenar día, mes y año

    // Retornar el número único generado
    return fechaUnica;
}


generateExcelLicencias(): void {
  const dailyNumber = this.generateDailyNumber();
  const formattedDate = this.getCurrentFormattedDate();

  this.LicenciasService.getLicenciasArchivo().subscribe(async response => {
    if (response && response.data && Array.isArray(response.data)) {

      const sortedData = response.data.sort((a, b) => a.rfc.localeCompare(b.rfc));

      // Preparar datos para Excel
      const excelData = sortedData.map((item, index) => ([
        index + 1,
        item.nombre,
        item.rfc,
        item.folio
      ]));

      // Encabezado personalizado similar al PDF
      const encabezado = [
        ['INSTITUTO HIDALGUENSE DE EDUCACIÓN'],
        ['Coordinación General de Administración y Finanzas'],
        ['Dirección General de Recursos Humanos'],
        ['Dirección de Nómina y Control de Plazas'],
        [],
        [`NO. OFICIO: DNCP/SNI/${dailyNumber}/2024`],
        [`FECHA: ${formattedDate}`],
        ['Para: Lic. Brenda Martínez Alavéz'],
        ['Jefa de la Unidad Técnica de Resguardo Documental'],
        ['De: Lic. Guillermo Paredes Camarena'],
        ['Subdirector de Incidencias y Control de Plazas'],
        [],
        ['No.', 'Nombre', 'RFC', 'Licencias Médicas']
      ];

      // Unir encabezado con los datos
      const hojaCompleta = [...encabezado, ...excelData];

      // Crear hoja de Excel
      const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(hojaCompleta);

      // Ajustar ancho de columnas
      worksheet['!cols'] = [
        { wpx: 40 },   // No.
        { wpx: 250 },  // Nombre
        { wpx: 120 },  // RFC
        { wpx: 150 }   // Licencias Médicas
      ];

      // Crear libro de Excel
      const workbook: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Licencias');

      // Generar archivo Excel
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      // Guardar el archivo
      this.saveAsExcelFile(excelBuffer, `Licencias_${dailyNumber}`);
    }
  });
}

// Método para guardar el archivo Excel
private saveAsExcelFile(buffer: any, fileName: string): void {
  const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  saveAs(data, `${fileName}.xlsx`);
}


  generatePdfLicenciasAnt() {
    const fecha = this.fechaform.get('dia_arch')?.value;
    const dailyNumber = this.generateUniqueNumber(fecha);
    const formattedDate = this.getCurrentFormattedDate();

    this.LicenciasService.getLicenciasArchivoDate(fecha).subscribe(response => {
      if (response && response.data && Array.isArray(response.data)) {

        // Ordenar los datos por RFC
        const sortedData = response.data.sort((a, b) => a.rfc.localeCompare(b.rfc));

        // Preparar los datos para el Excel
        const excelData = sortedData.map((item, index) => ({
          'No.': index + 1,
          'Nombre': item.nombre,
          'RFC': item.rfc,
          'Licencias Médicas': item.folio
        }));

        // Crear la hoja de Excel
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

        // Crear el libro de Excel
        const workbook: XLSX.WorkBook = {
          Sheets: { 'Licencias Médicas': worksheet },
          SheetNames: ['Licencias Médicas']
        };

        // Crear el buffer del Excel
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        // Descargar el archivo Excel
        this.saveAsExcelFileAnte(excelBuffer, `Licencias_Medicas_${dailyNumber}_${formattedDate}`);
      }
    });
  }

  // Función para guardar el archivo Excel
  private saveAsExcelFileAnte(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(data, `${fileName}.xlsx`);

  }


  formatearFecha(fecha: string): string {
    const meses = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];

    // Divide la fecha en partes (año, mes, día)
    const [anio, mes, dia] = fecha.split('-').map(Number);

    // Crea manualmente la fecha sin desfasar el día
    const mesNombre = meses[mes - 1]; // El mes en el array es 0-indexado
    return `${dia} de ${mesNombre} del ${anio}`;
  }

  generatePdfFormatoAnte() {
    const fecha = this.fechaform.get('dia_arch')?.value;
    const dailyNumber = this.generateUniqueNumber(fecha);
    const fechaFormateada = this.formatearFecha(fecha);
    const anioOficio = new Date(fecha).getFullYear();
    this.LicenciasService.getLicenciasArchivoDate(fecha).subscribe(async response => {
      if (response && response.message) {
        const messageNumber = response.message;
        const imageBase64 = await this.ImageToBaseService.convertImageToBase64('assets/IHE_LOGO.png');
        const documentDefinition: any = {
          content: [
            {
              columns: [
                {
                  image: imageBase64, // Usar la imagen convertida
                  alignment: 'right',
                  width: 170, // Ajustar el ancho
                  height: 50, // Ajustar la altura
                }
              ]
            },

            {
              text: `NO. OFICIO: DNCP/SNI/${dailyNumber}/${anioOficio}`,alignment: 'right', margin: [0, 10, 0, 10]},
            { text: `Pachuca HGO. a, ${fechaFormateada}`, alignment: 'right', margin: [0, 10, 0, 10] },
            { text: '', margin: [0, 30, 0, 0] }, // Espacio de 20 unidades de margen arriba
            { text: 'Lic. Brenda Martínez Alavéz\nJefa de la Unidad Técnica de Resguardo Documental' },
            { text: 'P R E S E N T E', bold: true, margin: [0, 10, 0, 90] }, // [izquierda, arriba, derecha, abajo]

            {
              text: `Por medio del presente, remito a usted ${messageNumber} licencias médicas.`,
              margin: [0, 10, 0, 10]
            },

            {
              text: 'Agradeciendo de antemano la atención que sirva brindar y sin otro asunto en particular, envío un cordial saludo.',
              margin: [0, 10, 0, 90]
            },

            {
              text: 'ATENTAMENTE',
              style: 'centeredText',
              margin: [0, 20, 0, 40]
            },

            {
              text: 'L.I. GUILLERMO PAREDES CAMARENA',
              bold: true,
              alignment: 'center'
            },
            {
              text: 'SUBDIRECTOR DE INCIDENCIAS Y CONTROL DE PLAZAS',
              alignment: 'center'
            },
            {
              text: 'Blvd.Felipe Angeles s/n, Col.Venta Prieta  Pachuca de Soto, HGO. C.P. 42080     Tel 771-717-3524  www.hgo.sep.gob.x',
              fontSize: 8,
              alignment: 'right',
              margin: [0, 0, 0, 0], // margen superior para separar del contenido anterior
              absolutePosition: { x: 410, y: 760 }, // Ajusta 'y' según la altura de la página
            }
          ],
          styles: {
            header: {
              fontSize: 14,
              bold: true
            },
            subheader: {
              fontSize: 12,
              bold: false
            },
            centeredText: {
              fontSize: 12,
              bold: true,
              alignment: 'center'
            }
          }
        };

        pdfMake.createPdf(documentDefinition).open();
      } else {
        console.error('No se pudo obtener el mensaje del servicio');
      }
    }, error => {
      console.error('Error al obtener los datos:', error);
    });

  }

  generatePdfFormato() {
    this.LicenciasService.getLicenciasArchivo().subscribe(async response => {
      if (response && response.message) {
        const dailyNumber = this.generateDailyNumber();
        const messageNumber = response.message;
        const today = new Date();
        const formattedDate = today.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
        const imageBase64 = await this.ImageToBaseService.convertImageToBase64('assets/IHE_LOGO.png');
        const documentDefinition: any = {
          content: [
            {
              columns: [
                {
                  image: imageBase64, // Usar la imagen convertida
                  alignment: 'right',
                  width: 170, // Ajustar el ancho
                  height: 50, // Ajustar la altura
                }
              ]
            },

            {
              text: `NO. OFICIO: DNCP/SNI/${dailyNumber}/${new Date().getFullYear()}`,alignment: 'right', margin: [0, 10, 0, 10]},
            { text: `Pachuca HGO. a, ${formattedDate}`, alignment: 'right', margin: [0, 10, 0, 10] },
            { text: '', margin: [0, 30, 0, 0] }, // Espacio de 20 unidades de margen arriba
            { text: 'Lic. Brenda Martínez Alavéz\nJefa de la Unidad Técnica de Resguardo Documental' },
            { text: 'P R E S E N T E', bold: true, margin: [0, 10, 0, 90] }, // [izquierda, arriba, derecha, abajo]

            {
              text: `Por medio del presente, remito a usted ${messageNumber} licencias médicas.`,
              margin: [0, 10, 0, 10]
            },

            {
              text: 'Agradeciendo de antemano la atención que sirva brindar y sin otro asunto en particular, envío un cordial saludo.',
              margin: [0, 10, 0, 90]
            },

            {
              text: 'ATENTAMENTE',
              style: 'centeredText',
              margin: [0, 20, 0, 40]
            },

            {
              text: 'L.I. GUILLERMO PAREDES CAMARENA',
              bold: true,
              alignment: 'center'
            },
            {
              text: 'SUBDIRECTOR DE INCIDENCIAS Y CONTROL DE PLAZAS',
              alignment: 'center'
            },
            {
              text: 'Blvd.Felipe Angeles s/n, Col.Venta Prieta  Pachuca de Soto, HGO. C.P. 42080     Tel 771-717-3524  www.hgo.sep.gob.x',
              fontSize: 8,
              alignment: 'right',
              margin: [0, 0, 0, 0], // margen superior para separar del contenido anterior
              absolutePosition: { x: 410, y: 760 }, // Ajusta 'y' según la altura de la página
            }
          ],
          styles: {
            header: {
              fontSize: 14,
              bold: true
            },
            subheader: {
              fontSize: 12,
              bold: false
            },
            centeredText: {
              fontSize: 12,
              bold: true,
              alignment: 'center'
            }
          }
        };

        pdfMake.createPdf(documentDefinition).open();
      } else {
        console.error('No se pudo obtener el mensaje del servicio');
      }
    }, error => {
      console.error('Error al obtener los datos:', error);
    });

  }


}

// generatePdfLicencias() {
//   const dailyNumber = this.generateDailyNumber();
//   const formattedDate = this.getCurrentFormattedDate();
//   this.LicenciasService.getLicenciasArchivo().subscribe(async response => {
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

// generatePdfLicenciasAnt() {
//   const fecha = this.fechaform.get('dia_arch')?.value;
//   const dailyNumber = this.generateUniqueNumber(fecha);
//   const formattedDate = this.getCurrentFormattedDate();
//   this.LicenciasService.getLicenciasArchivoDate(fecha).subscribe(async response => {
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
//         fups: '', // Campo vacío
//         nombramientos: '', // Campo vacío
//         licenciasEspeciales: '', // Campo vacío
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
//                     width: 150,
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
//                     text: `NO. OFICIO: DNCP/SNI/${dailyNumber}/2024\nFECHA: ${fecha}`,
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


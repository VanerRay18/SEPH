import { Component } from '@angular/core';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { NominaBecService } from 'src/app/services/nomina-bec.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { NominaA } from 'src/app/shared/interfaces/utils';
import Swal from 'sweetalert2';
import { ImageToBaseService } from './../../../../services/image-to-base.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as ExcelJS from 'exceljs';
import { Anexo05, Anexo06, NominaH } from './../../../../shared/interfaces/utils';

@Component({
  selector: 'app-historico',
  templateUrl: './historico.component.html',
  styleUrls: ['./historico.component.css']
})
export class HistoricoComponent {
headers = ['Nombre', 'CURP', 'Percepciones', 'Deducciones', 'Total', 'Detalles', ''];
  displayedColumns = ['nombre', 'curp', 'importTotal', 'retentionTotal', 'liquidTotal'];
  data: NominaA | null = null;
  nominaId: any;
  data2: NominaH[] = [];
  formattedDates: any[] = [];
  years: number[] = [];          // Años extraídos de las fechas
  selectedYear: number = 2025;   // Año seleccionado en el dropdown
  groupedByMonth: { [month: string]: any[] } = {}; // Agrupar datos por mes
  objectKeys = Object.keys;


  constructor(

    private NominaBecService: NominaBecService,
    private ImageToBaseService: ImageToBaseService

  ) {
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
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
      console.log(this.data2)
      this.formattedDates = this.data2.map(item => this.formatDate(item.fecha));
      const extractedYears = this.formattedDates.map(date => parseInt(date.split('-')[0]));
      // console.log("Años extraídos antes de eliminar duplicados:", extractedYears);
      // console.log("Años únicos después de eliminar duplicados:", [...new Set(extractedYears)]);
      this.years = [...new Set(this.formattedDates.map(date => parseInt(date.split('-')[0])))];

      //console.log(this.formattedDates);

      this.groupDataByMonth();
      // console.log("Claves agrupadas por mes:", this.objectKeys(this.groupedByMonth));

      // console.log('Fechas formateadas:', this.formattedDates);
    },
      (error) => {
        console.error('Error al obtener los datos:', error);
      });




  }

  async generateAnexos5(nominaId: any): Promise<void> {
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
      await this.generateExcelAnexo5(nominaId); // Espera a que se complete
      await this.generateExcelAnexo5Extra(nominaId);
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

  async generateAnexos6(nominaId: any): Promise<void> {
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
      await this.generateExcelAnexo6(nominaId); // Espera a que se complete
      await this.generateExcelAnexo6Extra(nominaId);
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

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);  // Crear un objeto Date con el timestamp
    const year = date.getFullYear();   // Obtener el año
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Obtener el mes y formatearlo a '01', '02', ...

    return `${year}-${month}`; // Devolver el formato Año-Mes
  }

  groupDataByMonth(): void {
    this.groupedByMonth = {};

    this.data2.forEach(item => {
      const formattedDate = this.formatDate(item.fecha);
      // console.log(`Fecha procesada: ${formattedDate}`); // <-- Verifica que no se repita con otro formato

      if (!this.groupedByMonth[formattedDate]) {
        this.groupedByMonth[formattedDate] = [];
      }

      this.groupedByMonth[formattedDate].push(item);
    });

    // console.log('Datos agrupados:', this.groupedByMonth);
  }

  monthNumberToName(month: string): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[parseInt(month) - 1]; // Convertir el mes numérico al nombre
  }

  // Cambiar el año seleccionado
  onYearChange(event: any): void {
    this.selectedYear = parseInt(event.target.value);
  }

  private toNumber(value: string): number {
    // Limpiar el valor de caracteres no numéricos (como '$' y ',')
    const cleanedValue = value.replace(/[\$,]/g, '').trim();  // Elimina '$' y ',' y espacios extras
    const parsed = parseFloat(cleanedValue);  // Convertir el valor limpio a número
    return isNaN(parsed) ? 0 : parsed;  // Si no es un número, devolver 0
  }

  generateExcelAnexo5(nominaId: any): Promise<void> {
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
      let ordinaria = true;

      this.NominaBecService.getAnexo05(nominaId, ordinaria).subscribe({
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

  generateExcelAnexo5Extra(nominaId: any): Promise<void> {
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
      let ordinaria = false;

      this.NominaBecService.getAnexo05(nominaId, ordinaria).subscribe({
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
            this.saveAsExcelFile(excelBuffer, `Anexo05_Extraordinaria ${quincena}`);
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

  generateExcelAnexo6(nominaId: any): Promise<void> {
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
      let ordinaria = true;

      this.NominaBecService.getAnexo06(nominaId, ordinaria).subscribe({
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

  generateExcelAnexo6Extra(nominaId: any): Promise<void> {
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
      let ordinaria = true;

      this.NominaBecService.getAnexo06(nominaId, ordinaria).subscribe({
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
            this.saveAsExcelFile(excelBuffer, `Anexo06_Extraordinaria ${quincena}`);
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

  //   getCurrentFormattedDate() {
  //     const today = new Date();
  //     const day = String(today.getDate()).padStart(2, '0');
  //     const month = String(today.getMonth() + 1).padStart(2, '0'); // Los meses empiezan en 0
  //     const year = today.getFullYear();
  //     return `${day}/${month}/${year}`;
  //   }

  //   generateDailyNumber(): string {
  //     const today = new Date();
  //     const year = today.getFullYear();
  //     const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Asegura dos dígitos
  //     const day = today.getDate().toString().padStart(2, '0');          // Asegura dos dígitos

  //     // Concatenar día, mes y año para generar el número único
  //     const dailyNumber = `${day}${month}${year}`;

  //     return dailyNumber;
  // }

  generatePdfNomina(nominaId: any) {
    this.NominaBecService.getHistoryById(nominaId).subscribe(async response => {
      if (response && response.data) {
        const nominaData = response.data;
        const imageBase64 = await this.ImageToBaseService.convertImageToBase64('assets/IHE_LOGO.png');

        const documentDefinition: any = {
          pageOrientation: 'landscape',
          content: [
            {
              table: {
                widths: ['auto', '*'],
                body: [
                  [
                    {
                      image: imageBase64,
                      alignment: 'left',
                      width: 170,
                      height: 50,
                      margin: [0, 0, 0, 30]
                    },
                    {
                      text: 'Coordinación General de Administración y Finanzas\nDirección General de Recursos Humanos\nDirección de Nómina y Control de Plazas',
                      alignment: 'right',
                      bold: true,
                      color: '#621132',
                      margin: [0, 0, 0, 30]
                    }
                  ],
                  [
                    {
                      text: '',
                      alignment: 'left',
                      bold: true
                    },
                    {
                      text: ``,
                      alignment: 'right'
                    }
                  ]
                ]
              },
              layout: 'noBorders',
            },
            { text: 'Datos Generales de la Nómina', style: 'header', margin: [0, 30, 0, 10] },
            {
              table: {
                widths: ['*', '*', '*', '*'],
                body: [
                  [
                    { text: 'Retención Total', bold: true },
                    { text: 'Fecha', bold: true },
                    { text: 'Total', bold: true },
                    { text: 'Importe Total', bold: true }
                  ],
                  [
                    nominaData.retentionTotal,
                    new Date(nominaData.fecha).toLocaleDateString(),
                    nominaData.total,
                    nominaData.importeTotal
                  ]
                ]
              },
              layout: 'lightHorizontalLines'
            },
            ...nominaData.nomina.map((empleado: any) => [
              { text: empleado.nombre, style: 'subheader', margin: [0, 20, 0, 5] },
              {
                table: {
                  widths: ['*', '*', '*', '*', '*'],
                  body: [
                    [
                      { text: 'Retención Total', bold: true },
                      { text: 'SRL_EMP', bold: true },
                      { text: 'Líquido Total', bold: true },
                      { text: 'Importe Total', bold: true },
                      { text: 'CURP', bold: true }
                    ],
                    [
                      empleado.retentionTotal,
                      empleado.srl_emp,
                      empleado.liquidTotal,
                      empleado.importTotal,
                      empleado.curp
                    ]
                  ]
                },
                layout: 'lightHorizontalLines'
              },
              {
                table: {
                  headerRows: 1,
                  widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                  body: [
                    [
                      { text: 'Retención', bold: true },
                      { text: 'Quincena Inicial', bold: true },
                      { text: 'Quincena Final', bold: true },
                      { text: 'Plaza', bold: true },
                      { text: 'Motivo', bold: true },
                      { text: 'Comprobante', bold: true },
                      { text: 'Tipo', bold: true },
                      { text: 'Pago', bold: true }
                    ],
                    ...empleado.detalles.map((detalle: any) => [
                      detalle.retention,
                      detalle.QNAINI,
                      detalle.QNAFIN,
                      detalle.plaza,
                      detalle.motiv,
                      detalle.comprobante,
                      detalle.type,
                      detalle.pago
                    ])
                  ]
                },
                layout: 'lightHorizontalLines'
              }
            ]).flat()
          ],
          styles: {
            header: {
              fontSize: 18,
              bold: true,
              alignment: 'center'
            },
            subheader: {
              fontSize: 14,
              bold: true,
              alignment: 'left'
            },
            tableHeader: {
              bold: true,
              fontSize: 12,
              fillColor: '#621132',
              color: 'white'
            }
          }
        };

        pdfMake.createPdf(documentDefinition).open();
      }
    });
  }

    sentNomina(nominaId: any): void {
      this.NominaBecService.getPDFEnvioN(nominaId).subscribe(async response => {
        const data = response.data;

        // Convertir la imagen a base64
        const imageBase64 = await this.ImageToBaseService.convertImageToBase64('assets/IHE_LOGO.png');

        const documentDefinition: any = {
          pageSize: 'A4', // Puedes cambiar 'A4' por 'LETTER' si deseas tamaño carta
          pageMargins: [40, 40, 40, 40], // Márgenes opcionales (izq, arriba, der, abajo)
          content: [
            {
              image: imageBase64,
              alignment: 'right',
              width: 150,
              height: 40,
            },
            {
              text: `Dirección General de Recursos Humanos\n Dirección de Nómina y Control de Plazas`,
              alignment: 'left',
              style: 'subheader'
            },
            {
              text: `${data.folio}\n Asunto: Envio de nomina "sustitutos de becario".`,
              alignment: 'right',
              style: 'subheader'
            },
            {
              text: '\n M.T.I Alberto Noble Gómez\nDirector de Atención y Aclaración de Nómina\nPRESENTE:',
              style: 'header',
              alignment: 'left',
              margin: [0, 20, 0, 5]
            },
            {
              text: `${data.fecha}`,
              alignment: 'left',
            },
            {
              text: `Anexo al presente me permito enviar nuevamente en forma digital el archivo “Resumen-Entrega-${data.quincena}-${data.ano}, que contiene la información correspondiente a la nómina ordinaria y extraordinaria de Sustitutos de Becario de la quincena ${data.quincena} del ejercicio ${data.ano}, con la finalidad de que sean validados por el área a su digno cargo.`,
              margin: [0, 10, 0, 10],
              alignment: 'justify',
              fontSize: 12
            },
            {
              text: `Mencionando que dichos anexos contienen la siguiente información:\n 1. ${data.plazas} plazas con pago a ${data.becarios} personas.\n 2. Importes:`,
              margin: [0, 10, 0, 10],
              alignment: 'justify',
              fontSize: 12
            },
            {
              columns: [
                { width: '*', text: '' },
                {
                  table: {
                    headerRows: 1,
                    widths: ['auto', '*'],
                    body: [
                      [
                        { text: 'CONCEPTO', bold: true, fontSize: 11, color: '#000000', fillColor: '#cac9c9', alignment: 'center' },
                        { text: 'IMPORTE', bold: true, fontSize: 11, color: '#000000', fillColor: '#cac9c9', alignment: 'center' }
                      ],
                      [
                        { text: 'Percepciones', fontSize: 9, alignment: 'center' },
                        { text: data.percepciones, fontSize: 9, alignment: 'right' }
                      ],
                      [
                        { text: 'Deducciones', fontSize: 9, alignment: 'center' },
                        { text: data.deducciones, fontSize: 9, alignment: 'right' }
                      ],
                      [
                        { text: 'Líquido', fontSize: 9, alignment: 'center' },
                        { text: data.liquido, fontSize: 9, alignment: 'right' }
                      ]
                    ]
                  },
                  margin: [0, 10, 0, 10],
                  alignment: 'center'
                },
                { width: '*', text: '' }
              ]
            },
            {
              text: 'De igual manera me permito informarle que en esta quincena se operaron movimientos (por plaza) de la siguiente manera:',
              margin: [0, 10, 0, 10],
              alignment: 'justify',
              fontSize: 12
            },
            {
              columns: [
                { width: 55, text: '' },
                {
                  table: {
                    headerRows: 1,
                    widths: ['auto', '*'],
                    body: [
                      [
                        { text: 'TIPO', bold: true, fontSize: 11, color: '#000000', fillColor: '#cac9c9', alignment: 'center' },
                        { text: 'CANTIDAD', bold: true, fontSize: 11, color: '#000000', fillColor: '#cac9c9', alignment: 'center' }
                      ],
                      [
                        { text: 'Altas', fontSize: 9, alignment: 'center' },
                        { text: data.altas, fontSize: 9, alignment: 'center' }
                      ],
                      [
                        { text: 'Bajas', fontSize: 9, alignment: 'center' },
                        { text: data.bajas, fontSize: 9, alignment: 'center' }
                      ]
                    ]
                  },
                  margin: [0, 10, 0, 10],
                  alignment: 'center'
                },
                { width: 55, text: '' }
              ]
            },
            {
              text: 'Sin más por el momento, me es grato enviarle un cordial saludo.',
              margin: [0, 10, 0, 10],
              alignment: 'justify',
              fontSize: 12
            },
            {
              text: 'ATENTAMENTE',
              margin: [0, 40, 0, 30],
              alignment: 'center',
              bold: true
            },
            {
              text: ' M.A.T.I. José Jayli Callejas Barrera\nDirector de Nómina y Control de Plazas',
              alignment: 'center',
              bold: true,
              margin: [0, 0, 0, 10]
            },
            {
              text: 'Ccp. Adolfo Ozumbilla Castillo. - Director General de recursos Humanos. PARA SU CONOCIMMIENTO.\n Arcivo.\n ard*',
              alignment: 'Left',
              bold: true,
              fontSize: 6
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
            }
            , textT: {
              fontSize: 10
            },
            subheader: {
              fontSize: 12,
              bold: true
            },
            tableHeader: {
              bold: true,
              fontSize: 12,
              fillColor: '#621132',
              color: 'white'
            }
          }
        };
        // Generar y descargar el PDF
        pdfMake.createPdf(documentDefinition).open();
      });
    }

    ReciboNomina(nominaId: any): void {
      this.NominaBecService.getPDFReciboN(nominaId).subscribe(async response => {
        const data = response.data;

        // Convertir la imagen a base64
        const imageBase64 = await this.ImageToBaseService.convertImageToBase64('assets/IHE_LOGO.png');

        const documentDefinition: any = {
          pageSize: 'A4', // Puedes cambiar 'A4' por 'LETTER' si deseas tamaño carta
          pageMargins: [40, 40, 40, 40], // Márgenes opcionales (izq, arriba, der, abajo)
          content: [
            {
              image: imageBase64,
              alignment: 'right',
              width: 150,
              height: 40,
            },
            {
              text: `Coordinación General de Administracion y Finanzas\n Dirección General de Recursos Financieros`,
              alignment: 'left',
              style: 'subheader',
              margin: [0, 10, 0, 5]
            },
            {
              text: `${data.fecha}`,
              alignment: 'right',
              margin: [0, 10, 0, 5]
            },
            {
              text: `Oficio Numero ${data.folio}`,
              alignment: 'right',
              style: 'subheader',
              margin: [0, 10, 0, 5]
            },
            {
              text: 'M.A.T.I. José Jayli Callejas Barrera\nDirector de Nómina y Control de Plazas\nPresente',
              style: 'header',
              alignment: 'left',
              margin: [0, 20, 0, 20]
            },
            {
              text: [
                'En respuesta a su Oficio DNyCP/0048/2025, le informo que en relación a la validación realizada al archivo magnético denominado ',
                { text: `“Resumen-Entrega-${data.quincena}-${data.ano}”`, bold: true },
                ' que contiene información concerniente a la prenómina de la ',
                { text: `Qna ${data.quincena}/${data.ano}`, bold: true },
                ' para el personal ',
                { text: '“SUSTITUTO DE BECARIO”', bold: true },
                ', a continuación me permito hacer las siguientes precisiones:'
              ],
              margin: [0, 10, 0, 10],
              alignment: 'justify',
              fontSize: 12
            },
            {
              text: `1. En relación al número total de plazas (${data.plazas}) y personas (${data.becarios}), hay coincidencia.`,
              margin: [0, 10, 0, 10],
              alignment: 'justify',
              fontSize: 12
            },
            {
              text: '2. En cuanto a las cifras totales de las columnas Percepciones, Deducciones, Neto, le informo que hay coincidencia.',
              margin: [0, 10, 0, 10],
              alignment: 'justify',
              fontSize: 12
            },
            {
              text: 'Sin más por el momento, quedo de usted',
              margin: [0, 30, 0, 10],
              alignment: 'justify',
              fontSize: 12
            },
            {
              text: 'Atentamente',
              margin: [0, 40, 0, 30],
              alignment: 'center',
              bold: true
            },
            {
              text: 'M.T.I Alberto Noble Gómez\nDirector de Atención y Aclaración de Nómina',
              alignment: 'center',
              bold: true,
              margin: [0, 40, 0, 20]
            },
            {
              text: 'Ccp. Flor de Maria Vargas Silva - Subdirectora de Revisión y Validación de Prenominas\n Arcivo.\n ANG/fmvs',
              alignment: 'left',
              bold: true,
              fontSize: 8,
              absolutePosition: { x: 50, y: 760 } // Ajusta 'y' según la altura de la página
            }
          ],
          styles: {
            header: {
              fontSize: 14,
              bold: true
            }
            , textT: {
              fontSize: 10
            },
            subheader: {
              fontSize: 12,
              bold: true
            },
            tableHeader: {
              bold: true,
              fontSize: 12,
              fillColor: '#621132',
              color: 'white'
            }
          }
        };
        // Generar y descargar el PDF
        pdfMake.createPdf(documentDefinition).open();
      });
    }

     async generateReport(nominaId: any): Promise<void> {
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
          await this.generateReporte(nominaId); // Espera a que se complete
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

      generateReporte(nominaId: any): Promise<void> {
        return new Promise((resolve, reject) => {
          const quincena = this.data?.quincena;
          this.NominaBecService.getReportes(nominaId).subscribe({
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
                  "FECHA INICIO", "FECHA TERMINO", "CLAVE PLAZA", "DEDUCCIONES", "", "PERCEPCIONES", "", "NETO", "CATEGORIA"
                ]);
                const headersRow2 = worksheet.addRow([
                  "", "", "", "", "", "", "", "", "", "CPTO", "IMPORTE", "CPTO", "IMPORTE", "", ""
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
                    item.uno, item.DEDUCCIONES, item.cuatro, item.PERCEPCIONES, item.NETO, item.CATEGORIA
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





}

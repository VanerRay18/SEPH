import { ImageToBaseService } from './../../../../services/image-to-base.service';
import { Component } from '@angular/core';
import { LicenciasService } from 'src/app/services/licencias-service/licencias.service';
import { ApiResponse } from 'src/app/models/ApiResponse';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Oficio } from 'src/app/shared/interfaces/utils';
import { OficioPdf } from 'src/app/shared/interfaces/utils';
import { style } from '@angular/animations';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-oficio-licencias',
  templateUrl: './oficio-licencias.component.html',
  styleUrls: ['./oficio-licencias.component.css']
})
export class OficioLicenciasComponent {
  searchTerm: string = '';
  headers = ['No. de Oficio','Año', 'Nombre', 'Rango de fechas', 'Total de Licencias', 'Generar PDF'];
  displayedColumns = ['oficio', 'ultima_fecha_oficio', 'nombre', 'rango_fechas','total_folios' ];
  data = [];

  constructor(
    private LicenciasService: LicenciasService,
    private ImageToBaseService: ImageToBaseService
  ) {
    // Registrar las fuentes necesarias
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
  }

  ngOnInit(): void {
    this.fetchData();
  }



  fetchData() {
    this.LicenciasService.getLicenciasOficio().subscribe((response: ApiResponse) => {
      this.data = response.data.map((item: Oficio) => ({
        ...item,
        rango_fechas: `${item.fecha_primera_licencia} al ${item.fecha_ultima_licencia}`
      })); // Aquí concatenas las fechas
    },
      (error) => {
        console.error('Error al obtener los datos:', error);
      });
  }

  convertImageToBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        const reader = new FileReader();
        reader.onloadend = function() {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.open('GET', url);
      xhr.responseType = 'blob';
      xhr.send();
    });
  }

  onPdf(oficioId: any) {
    console.log(oficioId);
    this.LicenciasService.getLicenciasOficioPdf(oficioId).subscribe(async response => {
      const data = response.data;
      const claves = data.claves || []; // Asegura que 'claves' esté definido
      const licencias = data.licencias || []; // Asegura que 'licencias' esté definido

      // Convertir la imagen a base64
      const imageBase64 = await this.ImageToBaseService.convertImageToBase64('assets/IHE_LOGO.png');

      const documentDefinition: any = {
        pageSize: 'A4', // Puedes cambiar 'A4' por 'LETTER' si deseas tamaño carta
        pageMargins: [40, 40, 40, 40], // Márgenes opcionales (izq, arriba, der, abajo)
        content: [
          {
            columns: [
              {
                image: imageBase64,
                alignment: 'right',
                width: 180,
                height: 50,
              },
              {
                text: `Pachuca HGO. ${data.impresion}.\nOficio Num: ${data.oficio}.`,
                alignment: 'right',
                style: 'header'
              }
            ]
          },
          {
            text: '\n M.T.I Alberto Noble Gómez\nDirector de Atención y Aclaración de Nómina\nPresente:',
            style: 'subheader',
            margin: [0, 20, 0, 5]
          },
          {
            text: `Con fundamento en el Artículo 111, de la Ley Federal de los Trabajadores al Servicio del Estado y Artículo 52, Fracción I del Reglamento de las Condiciones Generales de Trabajo del personal de la Secretaría del ramo, por este conducto solicito a Usted, gire instrucciones a quien corresponda a efecto de que la (el) C. ${data.nombre.trim()} R.F.C. ${data.rfc} fecha de ingreso ${data.fecha_ingreso}, quien labora en el CT con clave(s) presupuestal(es) siguientes:`,
            margin: [0, 20, 0, 20],
            alignment: 'justify',
            fontSize: 12
          },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*'],
              body: [
                // Agregar una fila de cabecera si 'claves' no está vacío
                [{ text: 'PLAZA', alignment: 'center', bold: true, fillColor: '#eeeeee'}, { text: 'CT', alignment: 'center', bold: true, fillColor: '#eeeeee' }],
                ...claves.map((clave: { PLAZA: any; CT: any; }) => [
                  { text: clave.PLAZA, alignment: 'center', bold: true,  style: 'textT' },
                  { text: clave.CT, alignment: 'center', bold: true, style: 'textT'  }
                ])
              ]
            },
            margin: [0, 10, 0, 20]
          },
          {
            text: 'Reintegre al Estado el sueldo no devengado, de conformidad con la(s) licencia(s) médica(s) que se mencionan a continuación:',
            margin: [0, 10, 0, 10],
            alignment: 'justify',
            fontSize: 12
          },
          {
            table: {
              headerRows: 1,
              widths: ['auto', 'auto', '*', '*', 'auto'],
              body: [
                // Cabeceras de la tabla
                [
                  { text: 'Folio', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Días', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Periodo de la Licencia', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Observaciones', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'A partir de', bold: true, fillColor: '#eeeeee', alignment: 'center' }
                ],
                // Agregar filas si 'licencias' no está vacío
                ...licencias.map((licencia: { foliolic: any; total_dias: any; desde: any; hasta: any; observaciones: any; apartir: any; }) => [
                  { text: licencia.foliolic, alignment: 'center', style: 'textT' },
                  { text: licencia.total_dias, alignment: 'center', style: 'textT' },
                  { text: `${licencia.desde} - ${licencia.hasta}`, alignment: 'center', style: 'textT' },
                  { text: licencia.observaciones, alignment: 'center', style: 'textT' },
                  { text: licencia.apartir || '---', alignment: 'center', style: 'textT'}
                ])
              ]
            },
            margin: [0, 10, 0, 30]
          },
          {
            text: 'Atentamente',
            margin: [0, 20, 0, 30],
            alignment: 'center'
          },
          {
            text: ' M.A.T.I. José Jayli Callejas Barrera\nDirector de Nómina y Control de Plazas',
            alignment: 'center',
            bold: true
          },
          {
            text: 'Ccp-Minotauro\nAOC/JJCB/GPC/jga',
            alignment: 'Left',
            bold: true,
            fontSize: 6
          }
        ],
        styles: {
          header: {
            fontSize: 12,
            bold: true
          }
          , textT: {
            fontSize: 9
          }
        }
      };
      // Generar y descargar el PDF
      pdfMake.createPdf(documentDefinition).open();
    });
  }

  historyDesc(): void {
    Swal.fire({
      title: "Selecciona el rango de fechas",
      html: `
        <label for="desde">Desde:</label>
        <input type="date" id="desde" class="swal2-input"><br>
        <label for="hasta">Hasta:</label>
        <input type="date" id="hasta" class="swal2-input">
      `,
      showCancelButton: true,
      confirmButtonText: "Buscar",
      preConfirm: () => {
        const desde = (document.getElementById("desde") as HTMLInputElement).value;
        const hasta = (document.getElementById("hasta") as HTMLInputElement).value;

        if (!desde || !hasta) {
          Swal.showValidationMessage("Por favor, selecciona ambas fechas.");
          return false;
        }


        return { desde, hasta, periodo: `${desde} - ${hasta}` };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const today = new Date().toISOString().split('T')[0];

        // Mostrar spinner de carga antes de hacer la petición
        Swal.fire({
          title: 'Generando reporte...',
          html: 'Por favor, espere mientras se genera el reporte.',
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.LicenciasService.getReporte(result.value.desde, result.value.hasta).subscribe({
          next: async (response) => {
            const data = response.data || [];
            const imageBase64 = await this.ImageToBaseService.convertImageToBase64('assets/IHE_LOGO.png');

            const documentDefinition: any = {
              pageSize: 'A4',
              pageMargins: [40, 40, 40, 40],
              pageOrientation: 'landscape',
              content: [
                {
                  columns: [
                    {
                      text: `Reporte de Descuentos\nFecha de Generación: ${today}\nPeriodo: ${result.value.periodo}`,
                      alignment: 'left',
                      margin: [0, 0, 0, 20],
                      style: 'header'
                    },
                    {
                      image: imageBase64,
                      alignment: 'right',
                      width: 180,
                      height: 50,
                      margin: [0, 0, 0, 20]
                    }
                  ]
                },
                {
                  table: {
                    headerRows: 1,
                    widths: ['*', 'auto', 'auto', 'auto', '*', 'auto'],
                    body: [
                      [
                        { text: 'Nombre', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                        { text: 'RFC', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                        { text: 'CT', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                        { text: 'Cargo', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                        { text: 'Nivel', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                        { text: 'Oficio', bold: true, fillColor: '#eeeeee', alignment: 'center' }
                      ],
                      ...data.map((item: {
                        oficio: any; CT: any; cargo: any; nombre: any; nivel: any; RFC: any; }) => [
                        { text: item.nombre, alignment: 'center', style: 'textT' },
                        { text: item.RFC, alignment: 'center', style: 'textT' },
                        { text: item.CT, alignment: 'center', style: 'textT' },
                        { text: item.cargo, alignment: 'center', style: 'textT' },
                        { text: item.nivel, alignment: 'center', style: 'textT' },
                        { text: item.oficio, alignment: 'center', style: 'textT' },
                      ])
                    ]
                  },
                  margin: [0, 10, 0, 20]
                }
              ],
              styles: {
                textT: {
                  fontSize: 10
                },
                header: {
                  fontSize: 12,
                  bold: true
                }
              }
            };
            Swal.close();
            pdfMake.createPdf(documentDefinition).open();
          },
          error: () => {
            Swal.fire("Error", "Hubo un problema al generar el reporte", "error");
          }
        });
      }
    });
  }




    // getCurrentDate() {
    //   const today = new Date();
    //   const day = String(today.getDate()).padStart(2, '0');
    //   const month = String(today.getMonth() + 1).padStart(2, '0'); // Meses van de 0-11
    //   const year = today.getFullYear();
    //   return `${day}/${month}/${year}`;
    // }


}


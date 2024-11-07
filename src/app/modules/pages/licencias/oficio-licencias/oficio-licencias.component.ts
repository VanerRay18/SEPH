import { ImageToBaseService } from './../../../../services/image-to-base.service';
import { Component } from '@angular/core';
import { LicenciasService } from 'src/app/services/licencias-service/licencias.service';
import { ApiResponse } from 'src/app/models/ApiResponse';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Oficio } from 'src/app/shared/interfaces/utils';
import { OficioPdf } from 'src/app/shared/interfaces/utils';
@Component({
  selector: 'app-oficio-licencias',
  templateUrl: './oficio-licencias.component.html',
  styleUrls: ['./oficio-licencias.component.css']
})
export class OficioLicenciasComponent {
  searchTerm: string = '';
  headers = ['No. de Oficio', 'Nombre', 'Rango de fechas', 'Total de Licencias', 'Generar PDF'];
  displayedColumns = ['oficio', 'nombre', 'rango_fechas', 'total_folios'];
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

  onPdf(oficio: any) {
    console.log(oficio);
    this.LicenciasService.getLicenciasOficioPdf(oficio).subscribe(async response => {
      const data = response.data;
      const claves = data.claves || []; // Asegura que 'claves' esté definido
      const licencias = data.licencias || []; // Asegura que 'licencias' esté definido

      // Convertir la imagen a base64
      const imageBase64 = await this.ImageToBaseService.convertImageToBase64('assets/IHE_LOGO.png');

      const documentDefinition: any = {
        content: [
          {
            columns: [
              {
                image: imageBase64,
                alignment: 'right',
                width: 210,
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
            text: '\nAlberto Noble Gómez\nDirector de Atención y Aclaración de Nómina\nPresente:',
            style: 'subheader',
            margin: [0, 20, 0, 20]
          },
          {
            text: `Con fundamento en el Artículo 111, de la Ley Federal de los Trabajadores al Servicio del Estado y Artículo 52, Fracción I del Reglamento de las Condiciones Generales de Trabajo del personal de la Secretaría del ramo, por este conducto solicito a Usted, gire instrucciones a quien corresponda a efecto de que la (el) C. ${data.nombre.trim()} R.F.C. ${data.rfc} fecha de ingreso ${data.fecha_ingreso}, quien labora en el CT con clave(s) presupuestal(es) siguientes:`,
            margin: [0, 20, 0, 20]
          },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*'],
              body: [
                // Agregar una fila de cabecera si 'claves' no está vacío
                [{ text: 'PLAZA', alignment: 'center', bold: true }, { text: 'CT', alignment: 'center', bold: true }],
                ...claves.map((clave: { PLAZA: any; CT: any; }) => [
                  { text: clave.PLAZA, alignment: 'center', bold: true },
                  { text: clave.CT, alignment: 'center', bold: true }
                ])
              ]
            },
            margin: [0, 10, 0, 20]
          },
          {
            text: 'Reintegre al Estado el sueldo no devengado, de conformidad con las licencias médicas que se mencionan a continuación:',
            margin: [0, 20, 0, 10]
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
                  { text: licencia.foliolic, alignment: 'center' },
                  { text: licencia.total_dias, alignment: 'center' },
                  { text: `${licencia.desde} - ${licencia.hasta}`, alignment: 'center' },
                  { text: licencia.observaciones, alignment: 'center' },
                  { text: licencia.apartir || '---', alignment: 'center' }
                ])
              ]
            },
            margin: [0, 10, 0, 30]
          },
          {
            text: 'Atentamente',
            margin: [0, 20, 0, 90],
            alignment: 'center'
          },
          {
            text: 'José Gabriel Castro Bautista\nDirector de Nómina y Control de Plazas',
            alignment: 'center',
            bold: true
          }
        ],
        styles: {
          header: {
            fontSize: 12,
            bold: true
          }
        }
      };

      // Generar y descargar el PDF
      pdfMake.createPdf(documentDefinition).open();
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


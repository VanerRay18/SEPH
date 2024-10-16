import { LicenciasService } from 'src/app/services/licencias-service/licencias.service';
import { Component, OnInit } from '@angular/core';
import { PdfService } from 'src/app/services/pdf-service.service';
import { ApiResponse } from 'src/app/models/ApiResponse';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';


@Component({
  selector: 'app-archivo-licencias',
  templateUrl: './archivo-licencias.component.html',
  styleUrls: ['./archivo-licencias.component.css']
})
export class ArchivoLicenciasComponent implements OnInit {
  searchTerm: string = '';
  headers = ['No.', 'Nombre', 'RFC', 'FI_PS', 'Nombraminetos definitivos', 'Licencias Medicas', 'Licencias Especiales'];
  displayedColumns = ['no', 'nombre', 'rfc', ' ', ' ', 'folio', ' '];
  data: any[] = [];

  constructor(
    private pdfService: PdfService,
    private LicenciasService: LicenciasService
  ) {
    // Registrar las fuentes necesarias
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
  }


  ngOnInit(): void {
    this.fetchData();
  }



  fetchData() {
    this.LicenciasService.getLicenciasArchivo().subscribe((response: ApiResponse) => {
      if (response && response.data && Array.isArray(response.data)) {
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

  mostrarMensaje() {
    console.log('Hola');
    // O si prefieres mostrar un alert:
    alert('Hola');
  }




  generatePdfLicencias() {
    const documentDefinition: any = {
      content: [
        { text: 'Coordinación General de Administración y Finanzas', bold: true, margin: [0, 0, 0, 0], alignment: 'left', color: '#621132'},
        { text: 'Dirección General de Recursos Humanos', bold: true, margin: [0, 0, 0, 0], alignment: 'left', color: '#621132'},
        { text: 'Dirección de Nómina y Control de Plazas', bold: true, margin: [0, 0, 0, 20], alignment: 'left', color: '#621132'},

        {
          table: {
            widths: ['*', '*'], // Dos columnas de igual tamaño
            body: [
              [
                {
                  text: 'Para: Brenda Martínez Alavez\nTitular de la Unidad Técnica de Resguardo Documental',
                  margin: [0, 0, 0, 0], // Sin margen
                  alignment: 'left',
                  bold: true // Alinear a la izquierda
                },
                {
                  text: 'HOJA: 1',
                  margin: [0, 0, 0, 0], // Sin margen
                  alignment: 'right', // Alinear a la derecha
                }
              ],
              [
                {
                  text: 'De: José Gabriel Castro Bautista\nDirector de Nómina y Control de Plazas',
                  margin: [0, 0, 0, 0], // Sin margen
                  alignment: 'left',
                  bold: true // Alinear a la izquierda
                },
                {
                  text: 'NO. OFICIO: DNCP/SNI/0150/2024\nFECHA: 19/09/2024',
                  margin: [0, 0, 0, 0], // Sin margen
                  alignment: 'right', // Alinear a la derecha
                }
              ]
            ]
          },
          layout: 'noBorders', // Sin bordes para que parezca más limpio
        },
        { text: '', margin: [0, 20, 0, 0] }, // Espacio de 20 unidades de margen arriba
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'No.', style: 'tableHeader' },
                { text: 'Nombre', style: 'tableHeader' },
                { text: 'RFC', style: 'tableHeader' },
                { text: 'FI_PS', style: 'tableHeader' },
                { text: 'Nombramientos Definitivos', style: 'tableHeader' },
                { text: 'Licencias Médicas', style: 'tableHeader' },
                { text: 'Licencias Especiales', style: 'tableHeader' }
              ],
              ['1', 'BAUTISTA DE LA CRUZ LORENA', 'BACLB61230SF4', '', '', '120401324001595', ''],
              ['2', 'BAUTISTA LARA MOISES', 'BALM830818TZA', '', '', '120401324000861', '']
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => {
              return (rowIndex % 2 === 0) ? '#F5F5F5' : null;
            }
          }
        }
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
          alignment: 'center'
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

  generatePdfFormato() {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    const documentDefinition: any = {
      content: [

        { text: `Pachuca HGO., ${formattedDate}`, alignment: 'right', margin: [0, 10, 0, 10] },

        { text: 'Brenda Martínez Alavez', bold: true, margin: [0, 10, 0, 0] },
        { text: 'Jefa de la Unidad Técnica de Resguardo Documental' },
        { text: 'P R E S E N T E', bold: true,  margin: [0, 0, 0, 90],}, // [izquierda, arriba, derecha, abajo]

        {
          text: 'Por medio del presente, remito a usted 50 licencias médicas.',
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
          text: 'GUILLERMO PAREDES CAMARENA',
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
  }




}

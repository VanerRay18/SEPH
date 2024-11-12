import { LicenciasService } from 'src/app/services/licencias-service/licencias.service';
import { Component, OnInit } from '@angular/core';
import { ApiResponse } from 'src/app/models/ApiResponse';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { ImageToBaseService } from './../../../../services/image-to-base.service';


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
    const month = today.getMonth() + 1; // Los meses comienzan desde 0, por lo que sumamos 1
    const day = today.getDate();

    // Generar un número basado en la fecha y sumar 1000 para empezar desde 1000
    const number = ((year * 10000 + month * 100 + day) % 1000) + 1000; // Genera un número entre 1000 y 1999
    return number.toString();
  }


  generatePdfLicencias() {
    const dailyNumber = this.generateDailyNumber();
    const formattedDate = this.getCurrentFormattedDate();
    this.LicenciasService.getLicenciasArchivo().subscribe(async response => {
      if (response && response.data && Array.isArray(response.data)) {
        const data = response.data.map((item, index) => ({
          no: index + 1, // Número autoincremental
          nombre: item.nombre,
          rfc: item.rfc,
          fups: '', // Campo vacío
          nombramientos: '', // Campo vacío
          licenciasEspeciales: '', // Campo vacío
          licenciasMedicas: item.folio
        }));
        const imageBase64 = await this.ImageToBaseService.convertImageToBase64('assets/IHE_LOGO.png');
        const documentDefinition: any = {
          content: [
            {
              table: {
                widths: ['auto', '*'], // Asegura que solo haya dos columnas como especificado
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
                      text: 'De: José Gabriel Castro Bautista\nDirector de Nómina y Control de Plazas',
                      alignment: 'left',
                      bold: true
                    },
                    {
                      text: `NO. OFICIO: DNCP/SNI/${dailyNumber}/2024\nFECHA: ${formattedDate}`,
                      alignment: 'right'
                    }
                  ]
                ]
              },
              layout: 'noBorders', // Sin bordes para la tabla de encabezado
            },
            { text: '', margin: [0, 30, 0, 0] }, // Espacio de 20 unidades de margen arriba
            {
              table: {
                headerRows: 1,
                widths: ['auto', '*', 'auto', 'auto'], // Anchos para las columnas de la tabla
                body: [
                  // Encabezados de la tabla
                  [
                    { text: 'No.', bold: true, color: '#FFFFFF', fillColor: '#621132', alignment: 'center' },
                    { text: 'Nombre', bold: true, color: '#FFFFFF', fillColor: '#621132', alignment: 'center' },
                    { text: 'RFC', bold: true, color: '#FFFFFF', fillColor: '#621132', alignment: 'center' },
                    { text: 'Licencias Médicas', bold: true, color: '#FFFFFF', fillColor: '#621132', alignment: 'center' },

                  ],
                  // Filas de contenido de la tabla
                  ...data.map(item => [
                    { text: item.no, color: '#000000', fillColor: '#FFFFFF', alignment: 'center' },
                    { text: item.nombre, color: '#000000', fillColor: '#FFFFFF', alignment: 'center' },
                    { text: item.rfc, color: '#000000', fillColor: '#FFFFFF', alignment: 'center' },
                    { text: item.licenciasMedicas, color: '#000000', fillColor: '#FFFFFF', alignment: 'center' },

                  ])
                ]
              },
              layout: {
                hLineWidth: () => 0.5, // Grosor de las líneas horizontales
                vLineWidth: () => 0.5, // Grosor de las líneas verticales
                hLineColor: () => '#000000', // Color de las líneas horizontales
                vLineColor: () => '#000000', // Color de las líneas verticales
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
    });
  }

  generatePdfFormato() {
    this.LicenciasService.getLicenciasArchivo().subscribe(async response => {
      if (response && response.message) {
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

            { text: `Pachuca HGO., ${formattedDate}`, alignment: 'right', margin: [0, 10, 0, 10] },
            { text: 'Brenda Martínez Alavez', bold: true, margin: [0, 10, 0, 0] },
            { text: 'Jefa de la Unidad Técnica de Resguardo Documental' },
            { text: 'P R E S E N T E', bold: true, margin: [0, 0, 0, 90], }, // [izquierda, arriba, derecha, abajo]

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
      } else {
        console.error('No se pudo obtener el mensaje del servicio');
      }
    }, error => {
      console.error('Error al obtener los datos:', error);
    });

  }


}

import { Component } from '@angular/core';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { NominaBecService } from 'src/app/services/nomina-bec.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { NominaA, SendEmailDTO } from 'src/app/shared/interfaces/utils';
import { saveAs } from 'file-saver';
import { Anexo05 } from 'src/app/shared/interfaces/utils';
import { Anexo06 } from 'src/app/shared/interfaces/utils';
import * as XLSX from 'xlsx';
import { Email } from 'src/app/shared/interfaces/utils';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
@Component({
  selector: 'app-enviar',
  templateUrl: './enviar.component.html',
  styleUrls: ['./enviar.component.css']
})
export class EnviarComponent {
  status = 4;
  data = [];
  nominaId: any;
  data2: NominaA | null = null;
  selectedFile: File | null = null;
  message = '';
  anexo5Buffer: any;
  anexo6Buffer: any;
  anexo5EBuffer: any;
  anexo6EBuffer: any;
  files: File[] = [];  // Aquí se almacenarán los archivos seleccionados
  system = 'becarios';
  emailList: string = '';
  emailForm: FormGroup;
  updatedEmail = [];


  constructor(
    private NominaBecService: NominaBecService,
    private router: Router,
    private fb: FormBuilder
  ) {
       (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
    this.emailForm = this.fb.group({
      subjet: ['', Validators.required],  // Campo obligatorio
      emailMessage: ['', Validators.required] // Campo obligatorio
    });
  }


  async ngOnInit(): Promise<void> {
    this.nominaId = await this.loadNominaId();
    this.fetchData();
  }

  async loadNominaId() {
    const nominaId = await this.NominaBecService.getNominaId();
    return nominaId
  }


  fetchData() {

    this.NominaBecService.getEmailForInput(this.system).subscribe(response => {
      if (response.success) {
        this.emailList = response.data; // Guardamos los correos en la variable
      }
    });

    this.NominaBecService.getNomina().subscribe((response: ApiResponse) => {
      this.data2 = response.data;
    },
      (error) => {
        console.error('Error al obtener los datos:', error);
      });
    this.NominaBecService.getInformationCalculation(this.nominaId).subscribe((response: ApiResponse) => {
      this.data = response.data; // Aquí concatenas las fechas
    },
      (error) => {
        console.error('Error al obtener los datos:', error);
      });
  }

  showCrudSwal() {
    this.NominaBecService.getEmails(this.system).subscribe((response) => {
      let items = response.data.map((item: any) => ({
        id: item.id,
        email: item.email,
        checked: item.active === 1,
        system: item.system,
        deleted: item.deleted
      }));

      Swal.fire({
        title: 'Gestión de Usuarios',
        html: `
          <div id="crud-container">
            <ul id="item-list" style="list-style: none; padding: 0; display: flex;  flex-direction: column;justify-content: center; align-items: center;">
              ${items.map((item: { id: any; checked: any; email: any; }) => `
                <li style="display: flex; align-items: center; margin-bottom: 10px;   border-radius: 8px;">
                  <input type="checkbox" id="check-${item.id}" ${item.checked ? 'checked' : ''} />
                  <input type="text" id="email-${item.id}" value="${item.email}" style="margin-left: 10px; border-radius: 5px;" />
                  <button class="delete-btn" data-id="${item.id}" style="margin-left: 10px;   border: 0px;">🗑️</button>
                </li>
              `).join('')}
            </ul>
            <button id="add-item" style="margin-top: 10px;   padding: 10px 20px;
background-color: #ffffff;
  color: #621132;
  border-color: #621132;
  font-weight: bold;
  height: 38px;
  border-radius: 15px;
  margin: 7px;
  transition: background-color 0.3s, color 0.3s;
  background: none;
  border: 1px solid #6A1B4D;
  color: #6A1B4D;
  padding: 8px 12px;
  border-radius: 20px;
  cursor: pointer;">Agregar</button>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        preConfirm: () => {
        const updatedItems = items.map((item: { id: any; }) => ({
          idEmail: item.id,
          email: (document.getElementById(`email-${item.id}`) as HTMLInputElement).value,
          active: (document.getElementById(`check-${item.id}`) as HTMLInputElement).checked ? 1 : 0,
          system: this.system
        }));

        console.log("Datos actualizados:", updatedItems);
        return updatedItems; // ✅ Retornar los datos para que .then los reciba
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        result.value.forEach((item: any) => {
          this.NominaBecService.ChangEmail(item, item.idEmail,).subscribe(() => {
            console.log(`Email ${item.email} actualizado.`);
          });
        });
      }
      });

      // Agregar evento para eliminar usuario
      setTimeout(() => {
        document.querySelectorAll('.delete-btn').forEach(btn => {
          btn.addEventListener('click', (event) => {
            const idAttr = (event.target as HTMLElement).getAttribute('data-id');
            console.log(idAttr)
            const idEmail = idAttr ? parseInt(idAttr, 10) : null;

            if (idEmail !== null && !isNaN(idEmail)) {
              this.NominaBecService.DeleteEmails(idEmail).subscribe(() => {
                console.log(`Email con ID ${idEmail} eliminado.`);
                this.showCrudSwal(); // Recargar swal
              });
            } else {
              console.error('ID no válido para eliminación:', idAttr);
            }
          });
        });
      }, 100);


      // Agregar evento para agregar un nuevo usuario
      // Agregar evento para agregar un nuevo usuario con otro Swal
      setTimeout(() => {
        document.getElementById('add-item')?.addEventListener('click', () => {
          Swal.fire({
            title: 'Agregar Nuevo Usuario',
            input: 'email',
            inputLabel: 'Ingrese el nuevo email:',
            inputPlaceholder: 'ejemplo@correo.com',
            showCancelButton: true,
            confirmButtonText: 'Agregar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
              if (!value) {
                return 'El email no puede estar vacío';
              }
              // Expresión regular simple para validar el formato de correo electrónico
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(value)) {
                return 'Ingrese un email válido';
              }
              return null;
            }
          }).then((result) => {
            if (result.isConfirmed) {
              const newItem = { email: result.value, system: this.system, active: 1 };
              this.NominaBecService.addEmail(newItem).subscribe(() => {
                console.log(`Email ${result.value} agregado.`);
                this.showCrudSwal(); // Recargar swal para actualizar la lista
              });
            }
          });
        });
      }, 100);

    });
  }



  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  async onUpload(): Promise<void> {
    await this.generateExcelAnexo5();
    await this.generateExcelAnexo6();
    await this.generateExcelAnexo5Extra();
    await this.generateExcelAnexo6Extra();



    const files: File[] = [];
    if (this.selectedFile) {
      files.push(this.selectedFile); // Archivo normal

    }

    // Verifica si los buffers existen antes de agregarlos


    if (this.anexo5Buffer) {
      const anexo5Blob = new Blob([this.anexo5Buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const anexo5File = new File([anexo5Blob], `Anexo05 ${this.data2?.quincena}.xlsx`, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      files.push(anexo5File);
    }

    if (this.anexo5EBuffer) {
      const anexo5Blob = new Blob([this.anexo5EBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const anexo5EFile = new File([anexo5Blob], `Anexo05Extraordinarias ${this.data2?.quincena}.xlsx`, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      files.push(anexo5EFile);
    }

    if (this.anexo6EBuffer) {
      const anexo6EBlob = new Blob([this.anexo6EBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const anexo6File = new File([anexo6EBlob], `Anexo06Extraordinarias ${this.data2?.quincena}.xlsx`, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      files.push(anexo6File);
    }
    if (this.anexo6Buffer) {
      const anexo6Blob = new Blob([this.anexo6Buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const anexo6File = new File([anexo6Blob], `Anexo06 ${this.data2?.quincena}.xlsx`, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      files.push(anexo6File);
    }
    // Crear el SendEmailDTO con los datos necesarios
    const sendEmailDTO: SendEmailDTO = {
      // Rellena los valores de tu DTO según lo que necesites
      subject:  this.emailForm.get('subjet')?.value,
      message: this.emailForm.get('emailMessage')?.value,
      from: 'becarios'
    };

    // Llamar al servicio con el SendEmailDTO y los archivos
    this.NominaBecService.SentArchives(sendEmailDTO, files).subscribe({
      next: (response) => {
        this.message = response.message || 'Archivo subido con éxito';
      },
      error: () => {
        this.message = 'Error al subir el archivo';
      }
    });
    console.log('Archivos a enviar:', files);
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
            this.anexo5Buffer = excelBuffer; // Guardar buffer para envío posterior

            // Guardar el archivo
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
            this.anexo5EBuffer = excelBuffer; // Guardar buffer para envío posterior

            // Guardar el archivo
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
            this.anexo6Buffer = excelBuffer;

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
            this.anexo6EBuffer = excelBuffer;

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
  // private saveAsExcelFile(buffer: any, fileName: string): void {
  //   const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  //   saveAs(data, `${fileName}.xlsx`);
  // }

  numfup = '12345'; // Ejemplo de variable numfup
  fec_fup = '2025-02-13'; // Ejemplo de fecha

  // Función para generar el PDF
  generatePDF() {
    const docDefinition: any = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      content: [
        {
          text: 'I.H.E FORMATO ÚNICO DE PERSONAL',
          fontSize: 22,
          alignment: 'left',
          margin: [0, 0, 0, 5]
        },
        {
          text: '(CONSTANCIA DE NOMBRAMIENTO)',
          fontSize: 15,
          alignment: 'left',
          margin: [0, 0, 0, 10]
        },
        {
          style: 'tableExample',
          table: {
            headerRows: 1,
            widths: [20, 20, '*', 'auto', 'auto', 30, 30, 10, 10],
            body: [
              [
                { text: 'No. OFICIO', style: 'tableHeader' },
                { text: 'FECHA', style: 'tableHeader' },
                { text: this.numfup, alignment: 'center' },
                { text: this.fec_fup, alignment: 'center' },
                'GOBIERNO DEL ESTADO DE HIDALGO',
                'UNIDAD ADMINISTRATIVA: Coordinación General de Administración y Finanzas',
                'FORH8-01 (01)',
              ]
            ]
          },
          layout: 'lightHorizontalLines'
        },
        {
          text: 'GOBIERNO DEL ESTADO DE HIDALGO',
          margin: [0, 10, 0, 0]
        },
        {
          style: 'tableExample',
          table: {
            widths: [30, 35, 20, 20, 30, 10, 10, 10, 95],
            body: [
              [
                { text: 'FILIACIÓN', style: 'tableHeader' },
                { text: 'C.U.R.P.', style: 'tableHeader' },
                { text: 'PATERNO', style: 'tableHeader' },
                { text: 'MATERNO', style: 'tableHeader' },
                { text: 'NOMBRE', style: 'tableHeader' },
                { text: 'E.NAC.', style: 'tableHeader' },
                { text: 'SEXO', style: 'tableHeader' },
                { text: 'E.CIV.', style: 'tableHeader' },
                { text: 'DOMICILIO', style: 'tableHeader' },
              ],
              [
                'RFC', 'CURP', 'PATERNO', 'MATERNO', 'NOMBRE', 'E.NAC.', 'SEXO', 'E.CIV.', 'DOMICILIO',
              ]
            ]
          },
          layout: 'lightHorizontalLines'
        },
        {
          style: 'tableExample',
          table: {
            widths: ['*', '*', '*', '*'],
            body: [
              [
                { text: 'Observaciones', style: 'tableHeader' },
                { text: 'Firma', style: 'tableHeader' },
                { text: 'Fecha', style: 'tableHeader' },
                { text: 'Aprobado', style: 'tableHeader' },
              ],
              [
                'Observación 1', 'Firma 1', '2025-02-13', 'Sí',
              ]
            ]
          },
          layout: 'lightHorizontalLines'
        }
      ],
      styles: {
        tableHeader: {
          bold: true,
          fontSize: 10,
          alignment: 'center',
          fillColor: '#d3d3d3'
        },
        tableExample: {
          margin: [0, 5, 0, 15]
        }
      }
    };

    // Generar el PDF
    pdfMake.createPdf(docDefinition).open();
  }


  saveNomina(event: any): void {
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
    const status = 5;
    this.NominaBecService.changeStatus(this.nominaId, status).subscribe(
      response => {

        Swal.fire({
          title: 'Confirmar',
          html: `¿Está seguro de enviar la nomina?<br><br>`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, enviar',
          cancelButtonText: 'No, cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.onUpload()
            // Mostrar spinner de carga
            Swal.fire({
              title: 'Enviado la nomina ...',
              html: 'Por favor, espere mientras se envia la nomina.',
              didOpen: () => {
                Swal.showLoading();
              },
              allowOutsideClick: false,
              showConfirmButton: false
            });
            // El usuario confirmó, proceder a enviar los datos
            this.fetchData();
            Swal.fire({
              title: 'Nomina Enviada',
              text: 'Se envio la Nomina correctamente',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
            this.router.navigate(['/pages/NominaBecarios/Nominas-Activas']);
            this.fetchData();


          }
        })


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

}

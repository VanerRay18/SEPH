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
import { HttpResponse } from '@angular/common/http';
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
  zipFiles: File | null = null; // Nuevo arreglo para los archivos ZIP
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

  emails() {
    this.NominaBecService.getEmailForInput(this.system).subscribe(response => {
      if (response.success) {
        // console.log(response.data)
        this.emailList = response.data; // Guardamos los correos en la variable
      }
    });
  }
  fetchData() {

    this.emails();

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
        title: 'Gestión de correos',
        html: `
<div id="crud-container" style="
  padding: 10px;
  text-align: center;
  max-height: 400px;
  overflow-y: auto;
  border-radius: 10px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
">
  <ul id="item-list" style="
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-height: 350px;
    overflow-y: auto;
  ">
    ${items.map((item: { id: any; checked: any; email: any; }) => `
      <li style="
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        padding: 10px;
        border-radius: 10px;
        background-color: #f9f9f9;
        width: 100%;
        max-width: 400px;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
        justify-content: space-between;
      ">
        <input type="checkbox" id="check-${item.id}" ${item.checked ? 'checked' : ''} style="
          width: 20px;
          height: 20px;
          cursor: pointer;
        "/>

        <input type="text" id="email-${item.id}" value="${item.email}" style="
          flex: 1;
          margin-left: 10px;
          padding: 8px;
          border-radius: 5px;
          border: 1px solid #ccc;
          outline: none;
          font-size: 14px;
          text-align: center;
        "/>

        <button class="delete-btn" data-id="${item.id}" style="
          margin-left: 10px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 18px;
          color: #e74c3c;
        ">
          <i class="fa-solid fa-trash"></i>
        </button>
      </li>
    `).join('')}
  </ul>

  <button id="add-item" style="
    margin-top: 10px;
    padding: 10px 20px;
    font-weight: bold;
    height: 38px;
    border-radius: 15px;
    transition: background-color 0.3s, color 0.3s;
    background: none;
    border: 1px solid #6A1B4D;
    color: #6A1B4D;
    padding: 8px 12px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
  ">Agregar</button>
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

          // console.log("Datos actualizados:", updatedItems);
          return updatedItems; // ✅ Retornar los datos para que .then los reciba
        }
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          result.value.forEach((item: any) => {
            this.ngOnInit();
            this.NominaBecService.ChangEmail(item, item.idEmail,).subscribe(() => {
              // console.log(`Email ${item.email} actualizado.`);
            });
          });
        }
      });

      // Agregar evento para eliminar usuario
      setTimeout(() => {
        document.querySelectorAll('.delete-btn').forEach(btn => {
          btn.addEventListener('click', (event) => {
            const target = (event.target as HTMLElement).closest('.delete-btn'); // Encuentra el botón más cercano
            const idAttr = target?.getAttribute('data-id'); // Obtiene el atributo data-id
            console.log("ID capturado:", idAttr);

            const idEmail = idAttr ? parseInt(idAttr, 10) : null;

            if (idEmail !== null && !isNaN(idEmail)) {
              this.NominaBecService.DeleteEmails(idEmail).subscribe(() => {
                console.log(`Email con ID ${idEmail} eliminado.`);
                this.ngOnInit();
                this.showCrudSwal(); // Recargar swal
              });
            } else {
              console.error('ID no válido para eliminación:', idAttr);
            }
          });
        });
      }, 100);

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
                // console.log(`Email ${result.value} agregado.`);
                this.ngOnInit();

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


    // Verifica si el ZIP realmente tiene contenido antes de agregarlo
    if (this.zipFiles) {
      files.push(this.zipFiles);
    }
    // Verifica si los buffers existen antes de agregarlos
    if (this.anexo5Buffer) {
      const anexo5Blob = new Blob([this.anexo5Buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const anexo5File = new File([anexo5Blob], `Anexo05_Ordinarias_${this.data2?.quincena}.xlsx`, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      files.push(anexo5File);
    }

    if (this.anexo5EBuffer) {
      const anexo5Blob = new Blob([this.anexo5EBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const anexo5EFile = new File([anexo5Blob], `Anexo05_Extraordinarias_${this.data2?.quincena}.xlsx`, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      files.push(anexo5EFile);
    }

    if (this.anexo6EBuffer) {
      const anexo6EBlob = new Blob([this.anexo6EBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const anexo6File = new File([anexo6EBlob], `Anexo06_Extraordinarias_${this.data2?.quincena}.xlsx`, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      files.push(anexo6File);
    }
    if (this.anexo6Buffer) {
      const anexo6Blob = new Blob([this.anexo6Buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const anexo6File = new File([anexo6Blob], `Anexo06_Ordinarias_${this.data2?.quincena}.xlsx`, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      files.push(anexo6File);
    }
    // Crear el SendEmailDTO con los datos necesarios
    const sendEmailDTO: SendEmailDTO = {
      // Rellena los valores de tu DTO según lo que necesites
      subject: this.emailForm.get('subjet')?.value,
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
    //  console.log('Archivos a enviar:', files);
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

  generateFUUPS(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.NominaBecService.downloadZip(this.nominaId).subscribe({
        next: (response) => {
          const blob = response.body; // Recibir directamente el archivo ZIP

          if (!blob) {
            reject('El archivo ZIP no se recibió correctamente.');
            return;
          }

          // Obtener el nombre del archivo desde el header Content-Disposition
          const contentDisposition = response.headers.get('Content-Disposition');
          let filename = 'fupps.zip'; // Nombre por defecto

          if (contentDisposition) {
            const matches = contentDisposition.match(/filename="(.+)"/);
            if (matches && matches.length > 1) {
              filename = matches[1]; // Extraer el nombre real
              console.log("JJSJSJSJS : " + filename)
            }
          }

          // Crear un enlace invisible para descargar el archivo
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          resolve(blob); // ✅ Retornar el Blob correctamente
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }




  // La función addFUUPS debe manejar la agregación correctamente:
  async addFUUPS(): Promise<void> {
    Swal.fire({
      title: 'Generando FUUPS...',
      text: 'Por favor espera, estamos generando el archivo...',
      icon: 'info',
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const zipBlob = await this.generateFUUPS(); // Espera la descarga del ZIP

      // Obtener el nombre real desde `this.data2?.quincena`
      const zipFileName = `fups_${this.data2?.quincena}.zip`;

      // Crear el archivo ZIP con el nombre correcto
      this.zipFiles = new File([zipBlob], zipFileName, { type: 'application/zip' });

      Swal.fire({
        title: 'Éxito',
        text: 'El archivo FUUPS se ha generado correctamente.',
        icon: 'success',
        confirmButtonText: 'OK'
      });

    } catch (error) {
      // console.error('Error al agregar el archivo FUUPS:', error);
      Swal.fire('Error', 'No se pudo generar el archivo FUUPS', 'error');
    }
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
    Swal.fire({
      title: 'Confirmar',
      html: `¿Está seguro de enviar la nómina?<br><br>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'No, cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await this.onUpload();
        // Mostrar spinner de carga antes de hacer la petición
        Swal.fire({
          title: 'Enviando la nómina...',
          html: 'Por favor, espere mientras se envía la nómina.',
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Realizar la petición
        const status = 5;
        this.NominaBecService.changeStatus(this.nominaId, status).subscribe(
          async response => {
            try {
              // Esperar a que termine la subida
              await this.fetchData(); // Esperar a que los datos se actualicen

              // Cerrar el swal de carga y mostrar el de éxito
              Swal.fire({
                title: 'Nómina Enviada',
                text: 'Se envió la nómina correctamente.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
              }).then(() => {
                this.router.navigate(['/pages/NominaBecarios/Nominas-Activas']); // Navegar solo después de la confirmación
              });
            } catch (error) {
              Swal.fire({
                title: 'Error',
                text: 'Ocurrió un error al enviar la nómina.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
              });
            }
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

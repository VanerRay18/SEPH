import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LicenciasService } from 'src/app/services/licencias-service/licencias.service';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { ImageToBaseService } from './../../../../services/image-to-base.service';
import { BusquedaserlService } from 'src/app/services/busquedaserl.service';
import { PermisosUserService } from 'src/app/services/permisos-user.service';
import { LicMedica } from 'src/app/shared/interfaces/utils';
@Component({
  selector: 'ingreso-licencias',
  templateUrl: './ingreso-licencias.component.html',
  styleUrls: ['./ingreso-licencias.component.css']
})
export class IngresoLicenciasComponent implements OnInit{

  insertarLic!: FormGroup;
  headers = ['No. de Licencia', 'Desde', 'Hasta', 'Días', 'No. de oficio', 'Acciones'];
  displayedColumns = ['folio', 'desde', 'hasta', 'rango_fechas','oficio'];
  data = [];
  showCard: any = false;
  table:any = true;
  srl_emp: any;
  activeTab: string = 'licencias';
  currentDate!: string;
  fecha_ingreso: any;
  eliminar: boolean = false;
  agregar: boolean = false;
  modificar: boolean = false;

  tabs = [
    { id: 'licencias', title: 'Licencias Médicas', icon: 'fas fa-file-medical' },
    { id: 'accidentes', title: 'Accidentes de Trabajo', icon: 'fas fa-exclamation-triangle' },
    { id: 'acuerdos', title: 'Acuerdos Presidenciales', icon: 'fas fa-handshake' }
  ];

  constructor(
    private LicenciasService: LicenciasService,
    private fb: FormBuilder,
    private ImageToBaseService: ImageToBaseService,
    private BusquedaserlService: BusquedaserlService,
    private PermisosUserService: PermisosUserService
  ) {
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
    //this.fetchData(); // Si tienes un endpoint real, descomenta esto
  }


  ngOnInit() {

    this.PermisosUserService.getPermisosSpring(this.PermisosUserService.getPermisos().Licencias).subscribe((response: ApiResponse) => {
      this.eliminar = response.data.eliminar
      this.modificar = response.data.editar
      this.agregar = response.data.agregar
    });

    this.BusquedaserlService.srlEmp$.subscribe(value => {
      this.fecha_ingreso = value.fecha_ingreso
      this.showCard = value.mostrar;
      if (value.mostrar == true) {
        this.srl_emp = value.srl_emp;
        this.buscar(this.srl_emp);
      }

    });
    this.HOLA()
  }

  HOLA() {
    this.insertarLic = this.fb.group({
      folio: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_termino: ['', Validators.required],
      formato: ['0', Validators.required]
    });
  }

  getCurrentDate(fecha_ingreso: any): { date: string; fecha_ingreso: any } {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();

    return {
      date: `${day}/${month}/${year}`, // Fecha actual en formato dd/mm/yyyy
      fecha_ingreso: fecha_ingreso // Devuelve `fecha_ingreso`
    };
  }


  // Método para buscar con los términos ingresados
  buscar(srl_emp: any) {
    this.srl_emp = srl_emp;

    this.currentDate = this.getCurrentDate(this.fecha_ingreso).date; // Usa `getCurrentDate` para formatear la fecha
    console.log(this.srl_emp)
    this.LicenciasService.getLicencias(srl_emp).subscribe((response: ApiResponse) => {
      console.log("Respuesta de la API:", response);
      this.table = true;

      // if (response.data && response.data.fecha_ingreso) {
      //   this.fecha_ingreso = response.data.fecha_ingreso; // Guarda `fecha_ingreso` en el componente
      //   this.currentDate = this.getCurrentDate(this.fecha_ingreso).date; // Usa `getCurrentDate` para formatear la fecha
      // }
      // Asegúrate de que `licencias` existe en `response.data` antes de usar `map`
    if (response.data && response.data.licencias) {
      this.data = response.data.licencias.map((item: LicMedica) => ({
        ...item,
        desde:this.formatDate(item.desde),
        hasta:this.formatDate(item.hasta),
        rango_fechas: `${item.total_days}  ${item.accidente === 1 ? '-' : ''}`
      }));
    } else {
      this.data = []; // Inicializa como un array vacío si `licencias` no está en `data`
    }

      this.table = true;
    },
      (error) => {
        this.table = false; // Manejo del estado de la tabla en caso de error
      });
  }

  formatDate(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`; // Formato día/mes/año
  }

  onSumit(): void {
    if (this.insertarLic.valid) {
      const userId = localStorage.getItem('userId')!
      const fechaInicio = new Date(this.insertarLic.value.fecha_inicio);
      const fechaTermino = new Date(this.insertarLic.value.fecha_termino);
      const data = {
        folio: this.insertarLic.value.folio,
        fecha_inicio: fechaInicio.toISOString(), // Mantener en formato ISO para el envío
        fecha_termino: fechaTermino.toISOString(),
        formato: parseInt(this.insertarLic.value.formato, 10),
        "accidente": 0

      };

      // Mostrar alerta de confirmación
      Swal.fire({
        title: 'Confirmar',
        html: `¿Está seguro de que desea agregar la siguiente licencia?<br><br>` +
          `Folio: ${data.folio}<br>` +
          `Fecha de Inicio: ${fechaInicio.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })}<br>` +
          `Fecha de Término: ${fechaTermino.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })}<br>` +
          `Formato: ${data.formato === 0 ? 'Físico' : ''}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, agregar',
        cancelButtonText: 'No, cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          // El usuario confirmó, proceder a enviar los datos
          this.LicenciasService.addLicencia(data, userId, this.srl_emp).subscribe(
            response => {
              this.buscar(this.srl_emp);
              this.HOLA();
              Swal.fire({
                title: '¡Éxito!',
                text: 'Licencia agregada correctamente.',
                icon: 'success',
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true
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
    } else {

      Swal.fire({
        title: 'Advertencia',
        text: 'Por favor, completa todos los campos requeridos.',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
    }
  }

  setActiveTab(tabId: string) {
    this.activeTab = tabId; // Cambia la pestaña activa
  }

  search() {
    Swal.fire({
      title: "Folio de licencia médica",
      input: "text",
      inputAttributes: {
        autocapitalize: "off"
      },
      showCancelButton: true,
      confirmButtonText: "Buscar",
    }).then((result) => {
      if (result.isConfirmed) {
        this.LicenciasService.SearchLic(result.value).subscribe(
          response => {
            if (response.data.message) {
              Swal.fire({
                title: response.data.message,
                icon: "success"
              });
            } else {
              Swal.fire({
                title: "Licencia encontrada",
                html: `
                  <div style="text-align: left; margin-left:30px">
                    <strong>Folio:</strong> ${response.data.folio} <br>
                    <strong>RFC:</strong> ${response.data.rfc} <br>
                    <strong>Nombre:</strong> ${response.data.nombre.trim()} <br>
                    <strong>Fecha de captura:</strong> ${new Date(response.data.fechaCaptura).toLocaleDateString()} <br>
                    <strong>Válida desde:</strong> ${new Date(response.data.desde).toLocaleDateString()} <br>
                    <strong>Hasta:</strong> ${new Date(response.data.hasta).toLocaleDateString()} <br>
                    <strong>Total de días:</strong> ${response.data.total_dias}
                  </div>
                `,
                icon: "warning"
              });
            }
          });
      }
    });
  }

  trash() {
    Swal.fire({
      title: "Ingrese el folio a eliminar",
      input: "text",
      inputAttributes: {
        autocapitalize: "off"
      },
      showCancelButton: true,
      confirmButtonText: "Buscar",
    }).then((hola) => {
      if (hola.isConfirmed) {
        Swal.fire({
          title: "¿Estas seguro? Se eliminara la licencia: " + hola.value,
          showCancelButton: true,
          icon: "warning",
          confirmButtonText: "Eliminar",
          iconColor: '#dc3545',
          confirmButtonColor: '#dc3545'
        }).then((result) => {
          if (result.isConfirmed) {
            const userId = localStorage.getItem('userId')!;
            this.LicenciasService.softdeletedByOficio(hola.value, userId).subscribe(
              response => {

                if (response.success == false) {
                  Swal.fire({
                    title: response.message!,
                    icon: "error"
                  });
                } else {
                  Swal.fire(
                    '¡Eliminada!',
                    'La licencia ha sido eliminada correctamente.',
                    'success'
                  );
                  this.buscar(this.srl_emp);
                }
              });
          }
        });

      }
    });
  }

  onEdit(data: any) {
    //AAGP790513HH4
    Swal.fire({
      title: 'Editar Registro',
      html: `
      <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;" for="folio">Folio</label>
        <input id="folioId" class="swal2-input" value="${data.folio}" style="padding: 0px; font-size: 16px;">
      </div>

      <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;" for="fecha_inicio">Fecha Inicio</label>
        <input id="fecha_inicioId" type="date" class="swal2-input" value="${data.desde}" style="padding: 0px; font-size: 16px;">
      </div>

      <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;" for="fecha_termino">Fecha Término</label>
        <input id="fecha_terminoId" type="date" class="swal2-input" value="${data.hasta}" style="padding: 0px; font-size: 16px;">
      </div>

      <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;" for="formato">Formato</label>
        <div style="display: flex; align-items: center; margin-top: 10px; margin-left:33px;">
          <input class="form-check-input" type="radio" name="formato" id="formatoFisico" value="0" ${data.formato === 0 ? 'checked' : ''} style="margin-right: 5px;">
          <label class="form-check-label" for="formatoFisico">Físico</label>
        </div>
        <div style="display: flex; align-items: center; margin-top: 10px; margin-left:33px;">
          <input class="form-check-input" type="radio" name="formato" id="formatoEmail" value="1" ${data.formato === 1 ? 'checked' : ''} style="margin-right: 5px;">
          <label class="form-check-label" for="formatoEmail">Email</label>
        </div>
      </div>`,

      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const folio = (document.getElementById('folioId') as HTMLInputElement).value;
        const fecha_inicio = ((document.getElementById('fecha_inicioId') as HTMLInputElement).value) + 'T00:00:00';
        const fecha_termino = ((document.getElementById('fecha_terminoId') as HTMLInputElement).value) + 'T00:00:00';
        const formato = parseInt((document.querySelector('input[name="formato"]:checked') as HTMLInputElement).value);
        const accidente = 0;
        // Validación de campos
        if (!folio || !fecha_inicio || !fecha_termino) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }

        return {
          folio,
          fecha_inicio,
          fecha_termino,
          formato,
          accidente
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const dataEditada = result.value;
        // Envío de los datos editados al backend
        this.guardarCambios(dataEditada, data.id);
      }
    });
  }

  guardarCambios(data: any, licenciaId: any) {
    const userId = localStorage.getItem('userId')!;

    this.LicenciasService.updateLic(data, licenciaId, userId).subscribe(
      response => {
        this.buscar(this.srl_emp);
        this.HOLA();  // Si este método actualiza la tabla
        Swal.fire({
          title: '¡Éxito!',
          text: 'Se editó la licencia correctamente.',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true
        });
      },
      error => {
        Swal.fire({
          title: 'Error',
          text: error.error.message,
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
      }
    );
  }

  onDelete(licenciaId: any) {
    const userId = localStorage.getItem('userId')!; // Asegúrate de obtener el userId correcto
    Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      iconColor: '#dc3545',
      confirmButtonColor: '#dc3545'
    }).then((result) => {
      if (result.isConfirmed) {
        // Llama al servicio para eliminar el registro
        this.LicenciasService.softDeleteLic(licenciaId.id, userId).subscribe(
          response => {
            this.buscar(this.srl_emp); // Refresca los datos después de eliminar
            Swal.fire(
              '¡Eliminada!',
              'La licencia ha sido eliminada correctamente.',
              'success'
            );
          },
          error => {
            Swal.fire(
              'Error',
              'No se pudo eliminar la licencia.',
              'error'
            );
          }
        );
      }
    });
  }
  reload() {
    this.buscar(this.srl_emp)
  }

  submitOficios() {
    let idsArray: number[] = []; // Array donde se guardarán los ids

    // Llamar al servicio para obtener las licencias nuevamente usando srl_emp
    this.LicenciasService.getLicencias(this.srl_emp).subscribe((response: ApiResponse) => {
      // Verifica si la propiedad licencias existe en la respuesta y si tiene elementos
      if (response.data && response.data.licencias && response.data.licencias.length > 0) {
        // Verifica si alguna licencia tiene las observaciones "SIN SUELDO" o "MEDIO SUELDO"
        const canSendToOficio = response.data.licencias.some((item: LicMedica) =>
          item.observaciones === "SIN SUELDO" || item.observaciones === "MEDIO SUELDO"
        );

        if (!canSendToOficio) {
          Swal.fire({
            title: 'No se puede enviar a oficio',
            text: 'La licencia debe tener la observación "SIN SUELDO" o "MEDIO SUELDO" para poder enviar a oficio.',
            icon: 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#dc3545'
          });
          return; // Detener la ejecución si no cumple la condición
        }

        // Si cumple la condición, continuar con el procesamiento de los IDs
        response.data.licencias.forEach((item: LicMedica) => {
          if (item.nueva === "1") {
            idsArray.push(item.id); // Agrega item.id al array si nueva es "1"
          }
        });

        const licenciasid = {
          licenciasId: idsArray
        };

        const userId = localStorage.getItem('userId')!; // Asegúrate de obtener el userId correcto
        Swal.fire({
          title: '¿Está seguro de crear el oficio?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, estoy seguro',
          cancelButtonText: 'Cancelar',
          iconColor: '#dc3545',
          confirmButtonColor: '#dc3545'
        }).then((result) => {
          if (result.isConfirmed) {
            // Llama al servicio para crear un oficio
            this.LicenciasService.patchLicenciasOficio(licenciasid, userId, this.srl_emp).subscribe(
              (response: { data: { oficio: string } }) => { // Asegúrate de definir el tipo de respuesta
                const oficio = response.data.oficio; // Accede al 'oficio' dentro de 'data'

                if (oficio) {
                  this.buscar(this.srl_emp);
                  this.onPdf(oficio); // Llama a onPdf con el oficio
                }
              },
              error => {
                Swal.fire(
                  'Error',
                  error.error.message,
                  'error'
                );
              }
            );
          }
        });

      } else {
        Swal.fire({
          title: 'Error',
          text: 'No se encontraron licencias válidas para el usuario.',
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#dc3545'
        });
      }
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


  historicopdf() {
    Swal.fire({
      title: '¿Qué histórico desea ver?',
      html: `
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
         <input type="radio" id="completo" name="historico" value="completo" style="margin-right: 5px;">
         <label for="completo">Completo</label>

      </div>
      <div style="display: flex; align-items: center;">
        <input type="radio" id="anterior" name="historico" value="anterior" style="margin-right: 5px;">
        <label for="anterior">Año anterior</label>
      </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'small-swal', // Clase personalizada para ajustar el tamaño
        title: 'small-swal-title' // Clase para el título
      },
      width: '450px', // Ajustar el ancho
      padding: '1em', // Ajustar el padding
      preConfirm: () => {
        const selectedValue = (document.querySelector('input[name="historico"]:checked') as HTMLInputElement)?.value;
        if (!selectedValue) {
          Swal.showValidationMessage('Por favor, seleccione una opción');
          return false;
        }
        return selectedValue;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const opcionSeleccionada = result.value;
        // Mostrar un spinner mientras se cargan los datos
        Swal.fire({
          title: 'Generando PDF...',
          html: 'Por favor, espere mientras se genera el reporte.',
          didOpen: () => {
            Swal.showLoading(); // Mostrar el spinner de carga
          },
          allowOutsideClick: false, // Evitar que el usuario cierre la alerta
          showConfirmButton: false // No mostrar botón de confirmación
        });

        if (opcionSeleccionada === 'completo') {
          this.LicenciasService.getHistorico(this.srl_emp).subscribe(async response => {
            const data = response.data;
            const licencias = data.licencias;
            const licenciasPorPeriodo = licencias.reduce((acc: any, licencia: { periodo: any }) => {
              (acc[licencia.periodo] = acc[licencia.periodo] || []).push(licencia);
              return acc;
            }, {});
            const totalDiasSumados = licencias.reduce((acc: number, licencia: { total_dias: number }) => {
              return acc + (licencia.total_dias || 0); // Asegúrate de sumar solo números
            }, 0);
            const today = new Date();
            const formattedDate = today.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
            const imageBase64 = await this.ImageToBaseService.convertImageToBase64('assets/IHE_LOGO.png');
            const content: any[] = [
              {
                columns: [
                  {
                    image: imageBase64,
                    alignment: 'right',
                    width: 210,
                    height: 50
                  },
                  {
                    text: `Pachuca HGO. ${formattedDate}.`,
                    alignment: 'right',
                    style: 'subheader'
                  }
                ]
              },
              {
                text: 'Reporte de Licencias Médicas/Accidentes de Trabajo',
                style: 'header',
                alignment: 'center',
                color: '#621132',
                margin: [40, 20, 0, 10]
              },
              {
                text: `\nNombre: ${data.nombre.trim()}\nR.F.C. ${data.rfc}\nFecha de ingreso: ${data.fecha_ingreso}`,
                style: 'subheader',
                margin: [0, 20, 0, 20]
              },
              {
                text: `Total de días de licencias: ${response.message}`,
                alignment: 'right',
                style: 'subheader',
                bold: true,
                margin: [0, 20, 0, 20]
              }
            ];

            // Para cada periodo, agregar un bloque de contenido con una tabla de licencias
            Object.keys(licenciasPorPeriodo).forEach(periodo => {
              const licencias = licenciasPorPeriodo[periodo] || []; // Asignar un arreglo vacío si no hay licencias
              const totalDias = licencias.reduce((acc: any, licencia: { total_days: any; }) => {
                return acc + (licencia.total_days || 0); // Asegúrate de que total_dias tenga un valor
              }, 0);
              content.push(
                { text: `Periodo: ${periodo}`, style: 'subheader', margin: [0, 20, 0, 10] },
                {
                  table: {
                    headerRows: 1,
                    widths: ['auto', '*', 'auto', 'auto', '*'],
                    body: [
                      // Cabeceras de la tabla
                      [
                        { text: 'Folio', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                        { text: 'Periodo de la Licencia', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                        { text: 'Días', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                        { text: 'Oficio', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                        { text: 'Fecha de captura', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                      ],
                      // Agregar cada licencia correspondiente a este periodo
                      ...licenciasPorPeriodo[periodo].map((licencia: { folio: any, desde: any, hasta: any, total_days: any, oficio: any, fechaCaptura: any, apartir: any }) => [
                        { text: licencia.folio, alignment: 'center' },
                        { text: `${licencia.desde} - ${licencia.hasta}`, alignment: 'center' },
                        { text: licencia.total_days, alignment: 'center' },
                        { text: licencia.oficio, alignment: 'center' },
                        { text: licencia.fechaCaptura, alignment: 'center' },
                      ])
                    ]
                  },
                  alignment: 'center',
                  margin: [0, 10, 0, 20]
                },
                {
                  text: `Total de días del periodo: ${totalDias}`,
                  alignment: 'right',
                  bold: true,
                  margin: [0, 20, 0, 20]
                }
              );
            });

            const documentDefinition = {
              content: content,
              styles: {
                header: {
                  fontSize: 20,
                  bold: true,
                },
                subheader: {
                  fontSize: 14,
                  bold: true
                }
              }
            };

            pdfMake.createPdf(documentDefinition).open();
            Swal.close();
          },
            error => {
              Swal.fire({
                title: 'No exite historico ',
                text: error.error.message,
                icon: 'error',
                confirmButtonText: 'OK'
              });  // Manejo de error

            });
        } else if (opcionSeleccionada === 'anterior') {
          this.LicenciasService.getHistoricoAnte(this.srl_emp).subscribe(async response => {
            const data = response.data;
            const licencias = data.licencias;
            const totalDias = licencias.reduce((acc: any, licencia: { total_dias: any; }) => {
              return acc + (licencia.total_dias || 0); // Asegúrate de que total_dias tenga un valor
            }, 0);
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
                      width: 210, // Ajustar el ancho
                      height: 50, // Ajustar la altura
                    },
                    {
                      text: `Pachuca HGO. ${formattedDate}.`,
                      alignment: 'right',
                      style: 'subheader'
                    }
                  ]
                },
                {
                  text: 'Reporte de Licencias Médicas/Accidentes de Trabajo del periodo anterior',
                  style: 'header',
                  alignment: 'center',
                  color: '#621132',
                  margin: [40, 20, 0, 10]
                },
                {
                  text: `\nNombre: ${data.nombre.trim()}\nR.F.C. ${data.rfc}\nFecha de ingreso: ${data.fecha_ingreso}`,
                  style: 'subheader',
                  margin: [0, 20, 0, 0]
                },
                { text: `Periodo: ${response.message}`, style: 'subheader', margin: [0, 20, 0, 10] },
                {
                  table: {
                    headerRows: 1,
                    widths: ['auto', '*', 'auto', 'auto', '*'],
                    body: [
                      // Cabeceras de la tabla
                      [
                        { text: 'Folio', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                        { text: 'Periodo de la Licencia', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                        { text: 'Días', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                        { text: 'Oficio', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                        { text: 'Fecha de captura', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                      ],
                      // Agregar cada licencia correspondiente a este periodo
                      ...licencias.map((licencia: { foliolic: any, desde: any, hasta: any, total_dias: any, oficio: any, fechaCaptura: any, apartir: any }) => [
                        { text: licencia.foliolic, alignment: 'center' },
                        { text: `${licencia.desde} - ${licencia.hasta}`, alignment: 'center' },
                        { text: licencia.total_dias, alignment: 'center' },
                        { text: licencia.oficio, alignment: 'center' },
                        { text: licencia.fechaCaptura, alignment: 'center' },
                      ])
                    ]
                  },
                  margin: [0, 10, 0, 30]
                },
                {
                  text: `Total de días del periodo: ${totalDias}`,
                  alignment: 'right',
                  bold: true,
                  margin: [0, 20, 0, 20]
                }

              ],
              styles: {
                header: {
                  fontSize: 20,
                  bold: true,
                },
                subheader: {
                  fontSize: 14,
                  bold: true
                }
              }
            };
            // Generar y descargar el PDF
            pdfMake.createPdf(documentDefinition).open();
            Swal.close();
          },
            error => {
              Swal.fire({
                title: 'No exite historico Anterior',
                text: error.error.message,
                icon: 'error',
                confirmButtonText: 'OK'
              });
            });
        }
      }
    });
  }

}


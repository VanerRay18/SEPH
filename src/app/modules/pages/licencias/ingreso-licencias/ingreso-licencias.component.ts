import { Component, Input, OnInit } from '@angular/core';
import { TablesComponent } from 'src/app/shared/componentes/tables/tables.component';
import { LicenciasService } from 'src/app/services/licencias-service/licencias.service';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { Employee } from 'src/app/shared/interfaces/usuario.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { ImageToBaseService } from './../../../../services/image-to-base.service';
import { content } from 'html2canvas/dist/types/css/property-descriptors/content';
import { LicMedica } from 'src/app/shared/interfaces/utils';
@Component({
  selector: 'ingreso-licencias',
  templateUrl: './ingreso-licencias.component.html',
  styleUrls: ['./ingreso-licencias.component.css']
})
export class IngresoLicenciasComponent implements OnInit {

  insertarLic!: FormGroup;
  headers = ['No. de Licencia', 'Desde', 'Hasta', 'Días', 'Status de licencia', 'No. de oficio', 'Acciones'];
  displayedColumns = ['folio', 'desde', 'hasta', 'rango_fechas', 'observaciones', 'oficio'];
  data = [];
  showCard: boolean = false;


  rfcSearchTerm: string = '';
  nombreSearchTerm: string = '';

  // Aquí es donde se almacenarán los datos que lleguen del backend
  items: { rfc: string; nombre: string; srl_emp: number }[] = [];

  // Sugerencias para dropdown
  rfcSuggestions: { rfc: string; nombre: string; srl_emp: number }[] = [];
  nombreSuggestions: { rfc: string; nombre: string; srl_emp: number }[] = [];

  activeTab: string = 'licencias'; // Pestaña activa por defecto

  tabs = [
    { id: 'licencias', title: 'Licencias Médicas', icon: 'fas fa-file-medical' },
    { id: 'accidentes', title: 'Accidentes de Trabajo', icon: 'fas fa-exclamation-triangle' },
    { id: 'acuerdos', title: 'Acuerdos Precedenciales', icon: 'fas fa-handshake' }
  ];
 srl_emp: any = ""; 
  constructor(
    private LicenciasService: LicenciasService,
    private fb: FormBuilder,
    private ImageToBaseService: ImageToBaseService
  ) {
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
    //this.fetchData(); // Si tienes un endpoint real, descomenta esto
  }
  ngOnInit() {

    // Obtener datos del servicio cuando se inicializa el componente
    this.LicenciasService.getUsers().subscribe((response: { data: Employee[] }) => {
      this.items = response.data.map((user: Employee) => ({
        rfc: user.rfc,
        nombre: user.nombre,
        srl_emp: user.srl_emp
      }));
    });
    this.HOLA()
  }

  HOLA() {
    this.insertarLic = this.fb.group({
      folio: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_termino: ['', Validators.required],
      formato: ['', Validators.required]
    });
  }
  // Filtrar RFC al escribir
  filterRFC() {
    if (this.rfcSearchTerm.length >= 3) { // Verificar si hay al menos 3 caracteres
      this.rfcSuggestions = this.items.filter(item =>
        item.rfc.toLowerCase().includes(this.rfcSearchTerm.toLowerCase())
      );
    } else {
      this.rfcSuggestions = []; // Limpiar las sugerencias si no hay suficientes caracteres
    }
    this.nombreSuggestions = [];
  }

  // Filtrar Nombre al escribir
  filterNombre() {
    if (this.nombreSearchTerm.length >= 4) { // Verificar si hay al menos 4 caracteres
      this.nombreSuggestions = this.items.filter(item =>
        item.nombre.toLowerCase().includes(this.nombreSearchTerm.toLowerCase())
      );
    } else {
      this.nombreSuggestions = []; // Limpiar las sugerencias si no hay suficientes caracteres
    }
    this.rfcSuggestions = [];
  }

  // Seleccionar un RFC y completar el Nombre
  selectRFC(item: { rfc: string; nombre: string; srl_emp: number }) {
    this.rfcSearchTerm = item.rfc;
    this.nombreSearchTerm = item.nombre;
    this.rfcSuggestions = [];
    this.nombreSuggestions = [];
    this.srl_emp = item.srl_emp
  }

  // Seleccionar un Nombre y completar el RFC
  selectNombre(item: { rfc: string; nombre: string; srl_emp: number }) {
    this.nombreSearchTerm = item.nombre;
    this.rfcSearchTerm = item.rfc;
    this.srl_emp = item.srl_emp


    this.rfcSuggestions = [];
    this.nombreSuggestions = [];
  }

  // Método para buscar con los términos ingresados
  buscar(srl_emp: any) {
    this.showCard = true;
    this.srl_emp = srl_emp;
    console.log('Buscando por RFC:', this.rfcSearchTerm, 'y Nombre:', this.nombreSearchTerm, 'y srl_emp:', this.srl_emp);

    this.LicenciasService.getLicencias(srl_emp).subscribe((response: ApiResponse) => {
      this.data = response.data.map((item: LicMedica) => ({
        ...item,
        rango_fechas: `${item.total_dias} -   ${item.accidente == 1? '':item.sumaDias}`
      })); // Aquí concatenas las fechas

    }
    );
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
              console.log('Licencia agregada con éxito', response);
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
              console.log(error)
              Swal.fire({
                title: 'Error',
                text: error.error.message,
                icon: 'error',
                confirmButtonText: 'Aceptar'
              });
            }
          );
        } else {
          console.log('El usuario canceló la operación');
        }
      });
    } else {
      console.error('El formulario no es válido');
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
        console.log(result.value)
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
      title: "Ingrese la licencia a eliminar",
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
                console.log(response)
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
  // Método para editar un registro
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
        console.log(dataEditada)
        console.log('Datos editados:', dataEditada);

        // Envío de los datos editados al backend
        this.guardarCambios(dataEditada, data.id);
      }
    });
  }

  guardarCambios(data: any, licenciaId: any) {
    const userId = localStorage.getItem('userId')!;

    this.LicenciasService.updateLic(data, licenciaId, userId).subscribe(
      response => {
        console.log('Se editó la licencia correctamente', response);
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
        console.error('Error al editar la licencia', error);
        Swal.fire({
          title: 'Error',
          text: error.error.message,
          icon: 'error',
          confirmButtonText: 'Aceptar'
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
            console.log('Licencia eliminada correctamente', response);
            this.buscar(this.srl_emp); // Refresca los datos después de eliminar
            Swal.fire(
              '¡Eliminada!',
              'La licencia ha sido eliminada correctamente.',
              'success'
            );
          },
          error => {
            console.error('Error al eliminar la licencia', error);
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

  sumitOficios() {
    let idsArray: number[] = []; // Array donde se guardarán los ids
    console.log(this.data)
    this.data.forEach((data: { id: number, nueva: string }) => {
      if (data.nueva === "1") {
        idsArray.push(data.id); // Agrega data.id al array si nueva es 1
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
            console.log('Respuesta del servicio:', response);
            const oficio = response.data.oficio; // Accede al 'oficio' dentro de 'data'

            if (oficio) {
              this.onPdf(oficio); // Llama a onPdf con el oficio
            } else {
              console.error('No se recibió el número de oficio en la respuesta');
            }
            // Swal.fire(
            //   '¡Oficio creado!',
            //   'Se creo un oficio correctamente.',
            //   'success'
            // );
          },
          error => {
            console.error('Error al eliminar la licencia', error);
            Swal.fire(
              'Error',
              error.error,
              'error'
            );
          }
        );
      }
    });
  }




  onPdf(oficio: any) {
    console.log(oficio);
    this.LicenciasService.getLicenciasOficioPdf(oficio).subscribe(async response => {
      const data = response.data;
      const claves = data.claves;
      const licencias = data.licencias;
      const today = new Date();
      const formattedDate = today.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

      // Convertir la imagen a base64
      const imageBase64 = await this.ImageToBaseService.convertImageToBase64('assets/logo_gobhidalgo.png');

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
                text: `Pachuca HGO. ${formattedDate}.\nOficio Num: ${data.oficio}.`,
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
                // Llena la tabla con los datos de 'claves'
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
              widths: ['auto', 'auto', '*', '*', 'auto'], // Ajuste de anchos de columnas
              body: [
                // Cabeceras de la tabla
                [
                  { text: 'Folio', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Días', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Periodo de la Licencia', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Observaciones', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'A partir de', bold: true, fillColor: '#eeeeee', alignment: 'center' }
                ],
                // Llena la tabla con los datos de 'licencias'
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
        <label for="completo">Completo</label>
        <input type="radio" id="completo" name="historico" value="completo" style="margin-left: 5px;">
      </div>
      <div style="display: flex; align-items: center;">
        <label for="anterior">Año anterior</label>
        <input type="radio" id="anterior" name="historico" value="anterior" style="margin-left: 5px;">
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
        if (opcionSeleccionada === 'completo') {
          console.log('Opción seleccionada: Completo');
          this.LicenciasService.getHistorico(this.srl_emp).subscribe(async response => {
            const data = response.data;
            const licencias = data.licencias;
            const licenciasPorPeriodo = licencias.reduce((acc: any, licencia: { periodo: any }) => {
              (acc[licencia.periodo] = acc[licencia.periodo] || []).push(licencia);
              return acc;
            }, {});
            const today = new Date();
            const formattedDate = today.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
            const imageBase64 = await this.ImageToBaseService.convertImageToBase64('assets/logo_gobhidalgo.png');
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
              }
            ];

            // Para cada periodo, agregar un bloque de contenido con una tabla de licencias
            Object.keys(licenciasPorPeriodo).forEach(periodo => {
              const licencias = licenciasPorPeriodo[periodo] || []; // Asignar un arreglo vacío si no hay licencias
              const totalDias = licencias.reduce((acc: any, licencia: { total_dias: any; }) => {
                return acc + (licencia.total_dias || 0); // Asegúrate de que total_dias tenga un valor
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
                      ...licenciasPorPeriodo[periodo].map((licencia: { foliolic: any, desde: any, hasta: any, total_dias: any, oficio: any, fechaCaptura: any, apartir: any }) => [
                        { text: licencia.foliolic, alignment: 'center' },
                        { text: `${licencia.desde} - ${licencia.hasta}`, alignment: 'center' },
                        { text: licencia.total_dias, alignment: 'center' },
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
          },
            error => {
              console.error('Error al obtener el histórico:', error);  // Manejo de error
            });
        } else if (opcionSeleccionada === 'anterior') {
          console.log('Opción seleccionada: Año anterior');
          this.LicenciasService.getHistoricoAnte(this.srl_emp).subscribe(async response => {
            const data = response.data;
            const licencias = data.licencias;
            const totalDias = licencias.reduce((acc: any, licencia: { total_dias: any; }) => {
              return acc + (licencia.total_dias || 0); // Asegúrate de que total_dias tenga un valor
            }, 0);
            const today = new Date();
            const formattedDate = today.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
            const imageBase64 = await this.ImageToBaseService.convertImageToBase64('assets/logo_gobhidalgo.png');
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
          },
            error => {
              console.error('Error al obtener el histórico:', error);  // Manejo de error
            });
        }
      }
    });
  }


}




// Método para eliminar un registro
// onDelete(row: any) {
//   console.log('Deleting row', row);
//   this.LicenciasService.deleteLicencia(row.folio).subscribe(() => {
//     // Eliminar el registro del arreglo de datos localmente
//     this.data = this.data.filter(item => item.folio !== row.folio);
//   });
// }


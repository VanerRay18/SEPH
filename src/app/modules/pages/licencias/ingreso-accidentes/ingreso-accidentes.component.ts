import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LicenciasService } from 'src/app/services/licencias-service/licencias.service';
import { BusquedaserlService } from 'src/app/services/busquedaserl.service';
import { ApiResponse } from 'src/app/models/ApiResponse';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { PermisosUserService } from 'src/app/services/permisos-user.service';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { ImageToBaseService } from './../../../../services/image-to-base.service';
@Component({
  selector: 'ingreso-accidentes',
  templateUrl: './ingreso-accidentes.component.html',
  styleUrls: ['./ingreso-accidentes.component.css']
})
export class IngresoAccidentesComponent {
  insertarLics!: FormGroup;
  headers = ['No. de Licencia', 'Desde', 'Hasta', 'Días', 'Acciones'];
  displayedColumns = ['folio', 'desde', 'hasta', 'total_dias'];
  data = [];
  headers2 = ['Desde', 'Hasta', 'Días', 'Acciones'];
  displayedColumns2 = ['desde', 'hasta', 'total_dias'];
  data2 = [];
  table: any = false;
  srl_emp: any;
  eliminar: boolean = false;
  agregar: boolean = false;
  modificar: boolean = false;
  arrayUserRecibido: any;
  showCard: any = false;


  tabs = [
    { id: 'licencias', title: 'Licencias Médicas', icon: 'fas fa-file-medical' },
    { id: 'accidentes', title: 'Accidentes de Trabajo', icon: 'fas fa-exclamation-triangle' },
    { id: 'acuerdos', title: 'Acuerdos Precedenciales', icon: 'fas fa-handshake' }
  ];

  constructor(
    private fb: FormBuilder,
    private LicenciasService: LicenciasService,
    private BusquedaserlService: BusquedaserlService,
    private PermisosUserService: PermisosUserService,
    private ImageToBaseService: ImageToBaseService
  ) {
    //this.fetchData(); // Si tienes un endpoint real, descomenta esto
  }
  ngOnInit() {
    this.PermisosUserService.getPermisosSpring(this.PermisosUserService.getPermisos().Licencias).subscribe((response: ApiResponse) => {
      this.eliminar = response.data.eliminar
      this.modificar = response.data.editar
      this.agregar = response.data.agregar
    });

    // this.modificar = this.PermisosUserService.getPermisos().Licencias.editar;
    // this.eliminar = this.PermisosUserService.getPermisos().Licencias.editar;
    // this.agregar = this.PermisosUserService.getPermisos().Licencias.editar;


    this.BusquedaserlService.srlEmp$.subscribe(value => {
      if (value.mostrar == true) {
        this.srl_emp = value.srl_emp;

        console.log(this.srl_emp)
        this.buscar(this.srl_emp);
        this.buscar2(this.srl_emp);
      }
    });
    this.HOLA();
  }
  recibirArrayUser(event: any) {
    this.arrayUserRecibido = event;

    const card = this.arrayUserRecibido.mostrar;
    // console.log(this.arrayUserRecibido)
    this.showCard = card
    if (card == true) {
      this.srl_emp = this.arrayUserRecibido.srl_emp;

      console.log(this.srl_emp)
      this.buscar(this.srl_emp);
      this.buscar2(this.srl_emp);
    }

  }

  buscar(srl_emp: any) {
    this.LicenciasService.getAccidentes(srl_emp).subscribe((response: ApiResponse) => {
      this.table = true
      this.data = response.data;
    },
      (error) => {
        this.table = false;
      });
  }

  buscar2(srl_emp: any) {
    this.LicenciasService.getAccidentes2(srl_emp).subscribe((response: ApiResponse) => {
      this.table = true
      this.data2 = response.data;
    },
      (error) => {
        this.table = false;
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

            `,

      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const folio = (document.getElementById('folioId') as HTMLInputElement).value;
        const fecha_inicio = ((document.getElementById('fecha_inicioId') as HTMLInputElement).value) + 'T00:00:00';
        const fecha_termino = ((document.getElementById('fecha_terminoId') as HTMLInputElement).value) + 'T00:00:00';
        const accidente = 1;
        const formato = 1;
        // Validación de campos
        if (!fecha_inicio || !fecha_termino) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }

        return {
          folio,
          fecha_inicio,
          fecha_termino,
          accidente,
          formato
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const dataEditada = result.value;
        this.guardarCambios(dataEditada, data.id, data.rfc);
      }
    });
  }

  guardarCambios(data: any, licenciaId: any, rfc: any) {
    const userId = localStorage.getItem('userId')!;

    this.LicenciasService.updateLic(data, licenciaId, userId, rfc).subscribe(
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
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    );
  }

  onEdit2(data2: any) {
    //AAGP790513HH4
    Swal.fire({
      title: 'Editar Registro',
      html: `

            <div style="display: flex; flex-direction: column; text-align: left;">
              <label style="margin-left:33px;" for="fecha_inicio">Fecha Inicio</label>
              <input id="fecha_inicioId" type="date" class="swal2-input" value="${data2.desde}" style="padding: 0px; font-size: 16px;">
            </div>

            <div style="display: flex; flex-direction: column; text-align: left;">
              <label style="margin-left:33px;" for="fecha_termino">Fecha Término</label>
              <input id="fecha_terminoId" type="date" class="swal2-input" value="${data2.hasta}" style="padding: 0px; font-size: 16px;">
            </div>

            `,

      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const folio = 0;
        const fecha_inicio = ((document.getElementById('fecha_inicioId') as HTMLInputElement).value) + 'T00:00:00';
        const fecha_termino = ((document.getElementById('fecha_terminoId') as HTMLInputElement).value) + 'T00:00:00';
        const accidente = 1;
        const formato = 1;
        // Validación de campos
        if (!fecha_inicio || !fecha_termino) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }

        return {
          folio,
          fecha_inicio,
          fecha_termino,
          accidente,
          formato
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const dataEditada = result.value;
        console.log(dataEditada)
        this.guardarCambios2(dataEditada, data2.id, data2.rfc);
      }
    });
  }

  guardarCambios2(data2: any, licenciaId: any, rfc:any) {
    const userId = localStorage.getItem('userId')!;

    this.LicenciasService.updateLic(data2, licenciaId, userId, rfc).subscribe(
      response => {
        this.buscar2(this.srl_emp);
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
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    );
  }

  onDelete(licenciaId: any) {
    const userId = localStorage.getItem('userId')!; // Asegúrate de obtener el userId correcto
    this.buscar2(this.srl_emp);
    this.buscar(this.srl_emp);
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

  onPdf(accidente: any) {
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
          pageOrientation: 'landscape',
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

  HOLA() {
    this.insertarLics = this.fb.group({
      fecha_inicio: ['', Validators.required],
      fecha_termino: ['', Validators.required]
    });
  }

  onSumit() {
    if (this.insertarLics.valid) {
      const userId = localStorage.getItem('userId')!
      const fechaInicio = new Date(this.insertarLics.value.fecha_inicio);
      const fechaTermino = new Date(this.insertarLics.value.fecha_termino);
      const data = {
        folio: 0,
        fecha_inicio: fechaInicio.toISOString(), // Mantener en formato ISO para el envío
        fecha_termino: fechaTermino.toISOString(),
        accidente: 1,
        formato: 1
      };

      // Mostrar alerta de confirmación
      Swal.fire({
        html: `¿Está seguro de que desea agregar el siguiente Accidente?<br><br>` +
          `Fecha de Inicio: ${fechaInicio.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })}<br>` +
          `Fecha de Término: ${fechaTermino.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })}<br>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, agregar',
        cancelButtonText: 'No, cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          // El usuario confirmó, proceder a enviar los datos
          console.log(data)
          this.LicenciasService.addLicencia(data, userId, this.srl_emp).subscribe(
            response => {
              this.buscar(this.srl_emp)
              this.buscar2(this.srl_emp);
              this.HOLA();
              Swal.fire({
                title: '¡Éxito!',
                text: 'Accidente agregado correctamente.',
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
}

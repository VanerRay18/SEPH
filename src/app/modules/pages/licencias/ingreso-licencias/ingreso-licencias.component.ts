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
import { distinctUntilChanged } from 'rxjs';
@Component({
  selector: 'ingreso-licencias',
  templateUrl: './ingreso-licencias.component.html',
  styleUrls: ['./ingreso-licencias.component.css']
})
export class IngresoLicenciasComponent implements OnInit {
  eliminar: boolean = false;
  agregar: boolean = false;
  modificar: boolean = false;

  bola: boolean = false;
  insertarLic!: FormGroup;
  headers = ['No. de Licencia', 'Desde', 'Hasta', 'Días', 'Fecha de captura', 'Fecha de formato fisico', 'No. de oficio'];
  displayedColumns = ['folio', 'desde', 'hasta', 'rango_fechas', 'fechaCaptura', 'fechaFisica', 'oficio'];
  data = [];
  dataQR: any;
  showCard: any = false;
  table: any = true;
  srl_emp: any;
  activeTab: string = 'licencias';
  currentDate!: string;
  fecha_ingreso: any;
  diasRegistrados: number = 0;
  Total_lic: any | null;
  isReadyToSend: boolean = false; // Variable para cambiar el color del botón
  @Input() arrayUser: any;

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
      if (this.modificar == true || this.eliminar == true)
        this.headers.push('Acciones');
    });

    this.HOLA()
    this.verificarLicencias();
  }

  arrayUserRecibido: any;

  recibirArrayUser(event: any) {
    this.arrayUserRecibido = event;

    const card = this.arrayUserRecibido.mostrar;
    // console.log(this.arrayUserRecibido)
    this.showCard = card
    if (card == true) {
      this.buscar(this.arrayUserRecibido.srl_emp);
      this.HOLA()
      this.verificarLicencias();
    }

  }
   getQr() {
    Swal.fire({
      title: "Escanee el código QR de la licencia médica",
      input: "text",
      inputAttributes: {
        autocapitalize: "off"
      },
      showCancelButton: true,
      confirmButtonText: "Buscar"
    }).then((result) => {
      if (result.isConfirmed) {
        this.LicenciasService.searchByQR(result.value).subscribe({
          next: (response) => {
            if (response.success === true) {
              this.dataQR = response.data;

              this.insertarLic.patchValue({
                folio: this.dataQR.serie || '',
                fecha_inicio: this.dataQR.inicio_licencia || '',
                fecha_termino: this.dataQR.fin_licencia || '',
                formato: '0'
              });
                const nombreCompleto = this.arrayUserRecibido.nombre?.toUpperCase() || '';

                const inicialNombre = this.dataQR.nombre_oculto?.[0]?.toUpperCase() || '';
                const inicialPaterno = this.dataQR.apellido_paterno_oculto?.[0]?.toUpperCase() || '';
                const inicialMaterno = this.dataQR.apellido_materno_oculto?.[0]?.toUpperCase() || '';

                const inicialesNombreCompleto = nombreCompleto
                  .split(" ")
                  .map((word: string) => word[0])
                  .join(" ");

                const coincideIniciales =
                  inicialesNombreCompleto.includes(inicialNombre) &&
                  inicialesNombreCompleto.includes(inicialPaterno) &&
                  inicialesNombreCompleto.includes(inicialMaterno);

                Swal.fire({
                  title: 'Licencia médica autorizada',
                  html: `
                    <table style="width:100%; text-align:left; font-size:14px">
                      ${!coincideIniciales
                        ? `<tr><td colspan="2" style="color:red; font-weight:bold; text-align:center">⚠️ Advertencia: las iniciales del nombre no coinciden</td></tr>`
                        : ''}
                      <tr><th>Serie:</th><td>${this.dataQR.serie}</td></tr>
                      <tr><th>CURP o RFC:</th><td>${this.dataQR.curp_o_rfc}</td></tr>
                      <tr><th>Nombre:</th><td>${this.dataQR.nombre_oculto}</td></tr>
                      <tr><th>Apellido paterno:</th><td>${this.dataQR.apellido_paterno_oculto}</td></tr>
                      <tr><th>Apellido materno:</th><td>${this.dataQR.apellido_materno_oculto}</td></tr>
                      <tr><th>ID Motivo LM:</th><td>${this.dataQR.id_motivo_lm}</td></tr>
                      <tr><th>Registro licencia:</th><td>${this.dataQR.registro_licencia}</td></tr>
                      <tr><th>Inicio licencia:</th><td>${this.dataQR.inicio_licencia}</td></tr>
                      <tr><th>Fin licencia:</th><td>${this.dataQR.fin_licencia}</td></tr>
                      <tr><th>Días otorgados:</th><td>${this.dataQR.dias_otorgados_numero}</td></tr>
                    </table>
                  `,
                  icon: 'success',
                  confirmButtonText: 'Aceptar',
                  width: '600px'
                });
            } else {
              Swal.fire({
                title: 'Licencia no autorizada',
                text: response.message || 'No se pudo validar la licencia médica.',
                icon: 'error',
                confirmButtonText: 'OK'
              });
            }
          },
          error: (err) => {
            Swal.fire({
              title: 'Error al buscar licencia médica',
              text: err?.error?.message || 'Ocurrió un error inesperado.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        });
      }
    });
  }

HOLA() {
  const hoy = new Date().toISOString().split('T')[0]; // yyyy-MM-dd

  this.insertarLic = this.fb.group({
    folio: ['', Validators.required],
    fecha_inicio: ['', Validators.required],
    fecha_termino: ['', Validators.required],
    fecha_caprura:[hoy, Validators.required],
    formato: ['0', Validators.required]
  });

  this.insertarLic.get('fecha_inicio')?.valueChanges.subscribe(() => this.calcularDias());
  this.insertarLic.get('fecha_termino')?.valueChanges.subscribe(() => this.calcularDias());
}

  calcularDias() {
    const fechaInicio = new Date(this.insertarLic.get('fecha_inicio')?.value);
    const fechaTermino = new Date(this.insertarLic.get('fecha_termino')?.value);

    if (fechaInicio && fechaTermino) {
      const diferenciaEnTiempo = fechaTermino.getTime() - fechaInicio.getTime();
      this.diasRegistrados = diferenciaEnTiempo / (1000 * 3600 * 24) + 1;
    } else {
      this.diasRegistrados = 0;
    }
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
    this.Total_lic = 0;
    this.currentDate = this.getCurrentDate(this.fecha_ingreso).date; // Usa `getCurrentDate` para formatear la fecha
    this.LicenciasService.getLicencias(srl_emp).subscribe((response: ApiResponse) => {
      this.table = true;


      // if (response.data && response.data.fecha_ingreso) {
      //   this.fecha_ingreso = response.data.fecha_ingreso; // Guarda `fecha_ingreso` en el componente
      //   this.currentDate = this.getCurrentDate(this.fecha_ingreso).date; // Usa `getCurrentDate` para formatear la fecha
      // }
      // Asegúrate de que `licencias` existe en `response.data` antes de usar `map`
      if (response.data && response.data.licencias) {
        this.Total_lic = response.message || 0;
        this.data = response.data.licencias.map((item: LicMedica) => ({
          ...item,
          fechaCaptura: this.formatDate(item.fechaCaptura),
          fechaFisica: item.fechaFisica == null ? "" : this.formatDate(item.fechaFisica),
          desde: this.formatDate(item.desde),
          hasta: this.formatDate(item.hasta),
          rango_fechas: `${item.total_days}  ${item.accidente === 1 ? '-' : ''}`
        }));
        this.bola = false;
        this.data.forEach(response => {
          if (!this.bola) {
            this.bola = (Number(response['observaciones']) >= 1 && Number(response['nueva']) === 1);
          }

        });
      }
      else {
        this.Total_lic = 0;
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
      const fechaCaptura = new Date(this.insertarLic.value.fecha_caprura);

      const data = {
        folio: this.insertarLic.value.folio,
        fecha_inicio: fechaInicio.toISOString(), // Mantener en formato ISO para el envío
        fecha_termino: fechaTermino.toISOString(),
        fecha_captura:fechaCaptura.toISOString(),
        formato: parseInt(this.insertarLic.value.formato, 10),
        "accidente": 0

      };
      // Convertir las fechas a formato 'YYYY-MM-DD' para usar en formatDate
      const formattedFechaInicio = this.formatDate(fechaInicio.toISOString().split('T')[0]);
      const formattedFechaTermino = this.formatDate(fechaTermino.toISOString().split('T')[0]);

      // Mostrar alerta de confirmación
      Swal.fire({
        title: 'Confirmar',
        html: `¿Está seguro de que desea agregar la siguiente licencia?<br><br>` +
          `Folio: ${data.folio}<br>` +
          `Fecha de Inicio: ${formattedFechaInicio}<br>` +
          `Fecha de Término:${formattedFechaTermino}<br>` +
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
              this.verificarLicencias();
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
        this.LicenciasService.SearchLic(result.value).subscribe(response => {
          const data = response.data;

          if (!data || (Array.isArray(data) && data.length === 0)) {
            Swal.fire({
              title: "No se encontraron licencias",
              icon: "warning"
            });
            return;
          }

          // Si es una sola licencia, mostrarla directamente
          if (!Array.isArray(data)) {
            this.mostrarDetallesLicencia(data);
            return;
          }


          // Si hay varias licencias, mostrar selector
          let opciones = Array.isArray(data) ? data.map((lic: any, index: number) => ({
            text: `Folio: ${lic.folio} Fecha: ${lic.desde}-${lic.hasta}`,
            value: index
          })) : [];

          Swal.fire({
            title: "Selecciona una licencia",
            input: "select",
            inputOptions: opciones.reduce((acc: Record<string, string>, lic) => {
              acc[String(lic.value)] = lic.text; // Convertimos el índice a string
              return acc;
            }, {}),
            showCancelButton: true,
            confirmButtonText: "Ver detalles"
          }).then((selection) => {
            if (selection.isConfirmed && Array.isArray(data) && Number(selection.value) >= 0 && Number(selection.value) < data.length) {
              this.mostrarDetallesLicencia(data[Number(selection.value)]); // Convertimos el valor seleccionado a número
            }
          });
        });
      }
    });
  }

  mostrarDetallesLicencia(licencia: any) {
    Swal.fire({
      title: "Detalles de Licencia",
      html: `
        <div style="text-align: left; margin-left:30px">
          <div><strong>Folio:</strong> ${licencia.folio}</div>
          <div><strong>RFC:</strong> ${licencia.rfc}</div>
          <div><strong>Nombre:</strong> ${licencia.nombre.trim()}</div>
          <div><strong>Fecha de captura:</strong> ${this.formatDate(licencia.fechaCaptura)}</div>
          <div><strong>Desde:</strong> ${this.formatDate(licencia.desde)}</div>
          <div><strong>Hasta:</strong> ${this.formatDate(licencia.hasta)}</div>
          <div><strong>Total de días:</strong> ${licencia.total_dias}</div>
          <div><strong>Formato:</strong> ${licencia.formato === 0 ? 'Físico' : 'Email'}</div>
        </div>
      `,
      showConfirmButton:this.modificar,
      showCancelButton: true,
      showDenyButton: this.eliminar,
      confirmButtonText: "Editar",
      denyButtonText: "Eliminar",
      cancelButtonText: "Cerrar",
    }).then(editResult => {
      if (editResult.isConfirmed  && this.modificar) {
        this.onEdit2(licencia);
      } else if (editResult.isDenied && this.eliminar) {


        this.onDelete(licencia); // Llama a la función de eliminación
      }
    });
  }


onEdit2(data: any) {
  console.log(data);
  Swal.fire({
    title: 'Editar Registro',
    html: `
      <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;" for="rfc">RFC:</label>
        <input id="rfc" class="swal2-input" value="${data.rfc || ''}" style="padding: 0px; font-size: 16px;">
      </div>

      <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;" for="folio">Folio</label>
        <input id="folioId" class="swal2-input" value="${data.folio || ''}" style="padding: 0px; font-size: 16px;">
      </div>

      <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;" for="fecha_inicio">Fecha Inicio</label>
        <input id="fecha_inicioId" type="date" class="swal2-input" value="${data.desde || ''}" style="padding: 0px; font-size: 16px;">
      </div>

      <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;" for="fecha_termino">Fecha Término</label>
        <input id="fecha_terminoId" type="date" class="swal2-input" value="${data.hasta || ''}" style="padding: 0px; font-size: 16px;">
      </div>

      <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;" for="fecha_captura">Fecha Captura</label>
        <input id="fecha_capturaId" type="date" class="swal2-input" value="${data.fechaCaptura || ''}" style="padding: 0px; font-size: 16px;">
      </div>

      <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;">Oficio</label>
        <div style="display: flex; align-items: center; gap: 5px; margin-left:33px;">
          <input id="num_oficio" maxlength="7" class="swal2-input" style="width: 100px; padding: 0px; font-size: 16px;" placeholder="1234567" value="${data.num_oficio || ''}">
          <span>/</span>
          <input id="anio_oficio" maxlength="4" class="swal2-input" style="width: 80px; padding: 0px; font-size: 16px;" placeholder="2025" value="${data.anio_oficio || ''}">
        </div>
      </div>

      <!-- Grupo de Descuento -->
      <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;">Descuento</label>
        <div style="display: flex; align-items: center; margin-top: 10px; margin-left:33px;">
          <input class="form-check-input" type="radio" name="descuento2" id="medioSueldo" value="1" ${data.descuento === 1 ? 'checked' : ''} style="margin-right: 5px;">
          <label class="form-check-label" for="medioSueldo">MEDIO SUELDO</label>
        </div>
        <div style="display: flex; align-items: center; margin-top: 10px; margin-left:33px;">
          <input class="form-check-input" type="radio" name="descuento2" id="sinSueldo" value="2" ${data.descuento === 2 ? 'checked' : ''} style="margin-right: 5px;">
          <label class="form-check-label" for="sinSueldo">SIN SUELDO</label>
        </div>
      </div>

      <!-- Grupo de Formato -->
      <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;">Formato</label>
        <div style="display: flex; align-items: center; margin-top: 10px; margin-left:33px;">
          <input class="form-check-input" type="radio" name="formato2" id="formatoFisico" value="0" ${data.formato === 0 ? 'checked' : ''} style="margin-right: 5px;">
          <label class="form-check-label" for="formatoFisico">FÍSICO</label>
        </div>
        <div style="display: flex; align-items: center; margin-top: 10px; margin-left:33px;">
          <input class="form-check-input" type="radio" name="formato2" id="formatoEmail" value="1" ${data.formato === 1 ? 'checked' : ''} style="margin-right: 5px;">
          <label class="form-check-label" for="formatoEmail">EMAIL</label>
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    preConfirm: () => {
      const rfc = (document.getElementById('rfc') as HTMLInputElement)?.value.trim();
      const folio = (document.getElementById('folioId') as HTMLInputElement)?.value.trim();
      const fecha_inicio = (document.getElementById('fecha_inicioId') as HTMLInputElement)?.value;
      const fecha_termino = (document.getElementById('fecha_terminoId') as HTMLInputElement)?.value;
      const fecha_captura = (document.getElementById('fecha_capturaId') as HTMLInputElement)?.value;
      const numero_oficio = (document.getElementById('num_oficio') as HTMLInputElement)?.value.trim();
      const anio = (document.getElementById('anio_oficio') as HTMLInputElement)?.value.trim();
      const formatoInput = document.querySelector('input[name="formato2"]:checked') as HTMLInputElement;
      const tipo_descuento = document.querySelector('input[name="descuento2"]:checked') as HTMLInputElement;

      if (!rfc || !folio || !fecha_inicio || !fecha_termino || !fecha_captura) {
        Swal.showValidationMessage('Todos los campos deben estar correctamente cargados');
        return false;
      }
      return {
        rfc,
        folio,
        fecha_inicio: fecha_inicio + 'T00:00:00',
        fecha_termino: fecha_termino + 'T00:00:00',
        fecha_captura: fecha_captura + 'T00:00:00',
        numero_oficio,
        anio,
        formato: parseInt(formatoInput.value),
        tipo_descuento: !tipo_descuento ?"":parseInt(tipo_descuento.value) ,
        accidente: 0

      };
    }
  }).then(result => {
  if (result.isConfirmed) {
    const dataEditada = result.value;
    console.log('guardar');
    console.log(dataEditada);
    this.guardarCambios2(dataEditada, data.id, dataEditada.rfc);
  }
});
}



  guardarCambios2(data: any, licenciaId: any, rfc: any) {
    const userId = localStorage.getItem('userId')!;
    console.log(data)
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
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true
        });
      }
    );
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
        <input id="fecha_inicioId" type="date" class="swal2-input" value="${this.formatDate(data.desde)}" style="padding: 0px; font-size: 16px;">
      </div>

      <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;" for="fecha_termino">Fecha Término</label>
        <input id="fecha_terminoId" type="date" class="swal2-input" value="${this.formatDate(data.hasta)}" style="padding: 0px; font-size: 16px;">
      </div>

<div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;" for="formato">Formato</label>
        <div style="display: flex; align-items: center; margin-top: 10px; margin-left:33px;">
          <input class="form-check-input" type="radio" name="formato1" id="formatoFisico1" value="0" ${data.formato === 0 ? 'checked' : ''} style="margin-right: 5px;">
          <label class="form-check-label" for="formatoFisico1">Físico</label>
        </div>
        <div style="display: flex; align-items: center; margin-top: 10px; margin-left:33px;">
          <input class="form-check-input" type="radio" name="formato1" id="formatoEmail1" value="1" ${data.formato === 1 ? 'checked' : ''} style="margin-right: 5px;">
          <label class="form-check-label" for="formatoEmail1">Email</label>
        </div>
      </div>`,

      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const folio = (document.getElementById('folioId') as HTMLInputElement).value;
        const fecha_inicio = ((document.getElementById('fecha_inicioId') as HTMLInputElement).value) + 'T00:00:00';
        const fecha_termino = ((document.getElementById('fecha_terminoId') as HTMLInputElement).value) + 'T00:00:00';
        const formato = parseInt((document.querySelector('input[name="formato1"]:checked') as HTMLInputElement).value);
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
              error.error.message,
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

  verificarLicencias() {
    this.isReadyToSend = false;

    this.LicenciasService.getHistoricoAnte(this.srl_emp).subscribe((response: ApiResponse) => {

      if (response.data && response.data.licencias && response.data.licencias.length > 0) {
        const canSendToOficio = response.data.licencias.some((item: LicMedica) => {

          //console.log('observaciones:', item.observaciones, 'nueva:', item.nueva);

          return (item.observaciones === 2 || item.observaciones === 1) && item.nueva === "1" && item.color === "black";
        });

        this.isReadyToSend = canSendToOficio;

      } else {
        this.isReadyToSend = false;
      }
    });
  }


  submitOficiosAnte() {
    let licenciasid: any[] = []; // Array donde se guardarán los ids


    // Llamar al servicio para obtener las licencias nuevamente usando srl_emp
    this.LicenciasService.getHistoricoAnte(this.srl_emp).subscribe((response: ApiResponse) => {
      // Verifica si la propiedad licencias existe en la respuesta y si tiene elementos
      if (response.data && response.data.licencias && response.data.licencias.length > 0) {
        const nuevasLicencias = response.data.licencias.filter((item: LicMedica) => item.nueva === "1");

        const hayLicenciasValidas = nuevasLicencias.some((item: LicMedica) =>
          [0, 1, 2].includes(+item.observaciones)
        );

        if (!hayLicenciasValidas) {
          Swal.fire({
            title: 'No se puede enviar a oficio',
            text: 'Debe haber al menos una licencia nueva con observación válida: "SIN SUELDO", "MEDIO SUELDO" o "SUELDO ÍNTEGRO".',
            icon: 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#dc3545'
          });
          return;
        }

        const licenciasMedioSueldoEnviadas = response.data.licencias.some((item: LicMedica) =>
          item.nueva !== "1" && [0, 1].includes(+item.observaciones)
        );

        Swal.fire({
          title: 'Selecciona el tipo de licencia a enviar a oficio:',
          input: 'radio',
          inputOptions: {
            '01': 'Medio sueldo',
            '2': 'Sin sueldo',
            'todos': 'Ambos'
          },
          inputValidator: (value) => {
            if (!value) return 'Debes seleccionar una opción.';
            return null;
          },
          confirmButtonText: 'Continuar',
          showCancelButton: true,
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#dc3545',
          icon: 'question'
        }).then((result) => {
          if (result.isConfirmed) {
            const seleccion = result.value;

            // Validación: no permitir enviar solo "sin sueldo" si no se han enviado antes las otras
            if (seleccion === '2' && !licenciasMedioSueldoEnviadas) {
              Swal.fire({
                title: 'No permitido',
                text: 'Primero debe enviar licencias de Medio sueldo / Sueldo íntegro antes de enviar licencias Sin sueldo.',
                icon: 'error',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#dc3545'
              });
              return;
            }

            let observacionesPermitidas: number[] = [];
            if (seleccion === '01') {
              observacionesPermitidas = [0, 1];
            } else if (seleccion === '2') {
              observacionesPermitidas = [2];
            } else if (seleccion === 'todos') {
              observacionesPermitidas = [0, 1, 2];
            }

            licenciasid = nuevasLicencias
              .filter((item: LicMedica) => observacionesPermitidas.includes(+item.observaciones))
              .map((item: LicMedica) => ({
                licenciaId: item.id,
                apartir: item.apartir === "" ? "--" : item.apartir,
                observaciones: item.observaciones
              }));

            if (licenciasid.length === 0) {
              Swal.fire({
                title: 'Sin licencias válidas',
                text: 'No se encontraron licencias nuevas con las observaciones seleccionadas.',
                icon: 'info',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#dc3545'
              });
              return;
            }

            const userId = localStorage.getItem('userId')!;
            Swal.fire({
              title: '¿Está seguro de crear el oficio?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Sí, estoy seguro',
              cancelButtonText: 'Cancelar',
              iconColor: '#dc3545',
              confirmButtonColor: '#dc3545'
            }).then((res) => {
              if (res.isConfirmed) {
                this.LicenciasService.patchLicenciasOficio(licenciasid, userId, this.srl_emp).subscribe(
                  (res: { data: { oficio: { id: number } } }) => {
                    const oficioId = res.data.oficio.id;
                    if (oficioId) {
                      this.buscar(this.srl_emp);
                      this.onPdf(oficioId);
                    }
                  },
                  error => {
                    Swal.fire('Error', error.error.message, 'error');
                  }
                );
              }
            });
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

  submitOficios() {
    let licenciasid: any[] = [];

    this.LicenciasService.getLicencias(this.srl_emp).subscribe((response: ApiResponse) => {
      if (response.data && response.data.licencias && response.data.licencias.length > 0) {
        const nuevasLicencias = response.data.licencias.filter((item: LicMedica) => item.nueva === "1");

        const hayLicenciasValidas = nuevasLicencias.some((item: LicMedica) =>
          [0, 1, 2].includes(+item.observaciones)
        );

        if (!hayLicenciasValidas) {
          Swal.fire({
            title: 'No se puede enviar a oficio',
            text: 'Debe haber al menos una licencia nueva con observación válida: "SIN SUELDO", "MEDIO SUELDO" o "SUELDO ÍNTEGRO".',
            icon: 'error',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#dc3545'
          });
          return;
        }

        const licenciasMedioSueldoEnviadas = response.data.licencias.some((item: LicMedica) =>
          item.nueva !== "1" && [0, 1].includes(+item.observaciones)
        );

        Swal.fire({
          title: 'Selecciona el tipo de licencia a enviar a oficio:',
          input: 'radio',
          inputOptions: {
            '01': 'Medio sueldo',
            '2': 'Sin sueldo',
            'todos': 'Ambos'
          },
          inputValidator: (value) => {
            if (!value) return 'Debes seleccionar una opción.';
            return null;
          },
          confirmButtonText: 'Continuar',
          showCancelButton: true,
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#dc3545',
          icon: 'question'
        }).then((result) => {
          if (result.isConfirmed) {
            const seleccion = result.value;

            // Validación: no permitir enviar solo "sin sueldo" si no se han enviado antes las otras
            if (seleccion === '2' && !licenciasMedioSueldoEnviadas) {
              Swal.fire({
                title: 'No permitido',
                text: 'Primero debe enviar licencias de Medio sueldo / Sueldo íntegro antes de enviar licencias Sin sueldo.',
                icon: 'error',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#dc3545'
              });
              return;
            }

            let observacionesPermitidas: number[] = [];
            if (seleccion === '01') {
              observacionesPermitidas = [0, 1];
            } else if (seleccion === '2') {
              observacionesPermitidas = [2];
            } else if (seleccion === 'todos') {
              observacionesPermitidas = [0, 1, 2];
            }

            licenciasid = nuevasLicencias
              .filter((item: LicMedica) => observacionesPermitidas.includes(+item.observaciones))
              .map((item: LicMedica) => ({
                licenciaId: item.id,
                apartir: item.apartir === "" ? "--" : item.apartir,
                observaciones: item.observaciones
              }));

            if (licenciasid.length === 0) {
              Swal.fire({
                title: 'Sin licencias válidas',
                text: 'No se encontraron licencias nuevas con las observaciones seleccionadas.',
                icon: 'info',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#dc3545'
              });
              return;
            }

            const userId = localStorage.getItem('userId')!;
            Swal.fire({
              title: '¿Está seguro de crear el oficio?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Sí, estoy seguro',
              cancelButtonText: 'Cancelar',
              iconColor: '#dc3545',
              confirmButtonColor: '#dc3545'
            }).then((res) => {
              if (res.isConfirmed) {
                this.LicenciasService.patchLicenciasOficio(licenciasid, userId, this.srl_emp).subscribe(
                  (res: { data: { oficio: { id: number } } }) => {
                    const oficioId = res.data.oficio.id;
                    if (oficioId) {
                      this.buscar(this.srl_emp);
                      this.onPdf(oficioId);
                    }
                  },
                  error => {
                    Swal.fire('Error', error.error.message, 'error');
                  }
                );
              }
            });
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





  onPdf(oficioId: any) {
    console.log('Generando PDF para el oficio con ID:', oficioId);
    //   console.log(oficioId);
    this.LicenciasService.getLicenciasOficioPdf(oficioId).subscribe(async response => {
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
            text: '\nM.T.I  Alberto Noble Gómez\nDirector de Atención y Aclaración de Nómina\nPresente:',
            style: 'subheader',
            margin: [0, 20, 0, 20]
          },
          {
            text: `Con fundamento en el Artículo 111, de la Ley Federal de los Trabajadores al Servicio del Estado y Artículo 52, Fracción I del Reglamento de las Condiciones Generales de Trabajo del personal de la Secretaría del ramo, por este conducto solicito a Usted, gire instrucciones a quien corresponda a efecto de que la (el) C. ${data.nombre.trim()} R.F.C. ${data.rfc} fecha de ingreso ${data.fecha_ingreso}, quien labora en el CT con clave(s) presupuestal(es) siguientes:`,
            margin: [0, 20, 0, 20],
            alignment: 'justify'
          },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*'],
              body: [
                // Agregar una fila de cabecera si 'claves' no está vacío
                [{ text: 'PLAZA', alignment: 'center', bold: true, fillColor: '#eeeeee' }, { text: 'CT', alignment: 'center', bold: true, fillColor: '#eeeeee' }],
                ...claves.map((clave: { PLAZA: any; CT: any; }) => [
                  { text: clave.PLAZA, alignment: 'center', bold: true },
                  { text: clave.CT, alignment: 'center', bold: true }
                ])
              ]
            },
            margin: [0, 10, 0, 20]
          },
          {
            text: 'Reintegre al Estado el sueldo no devengado, de conformidad con la(s) licencia(s) médica(s) que se mencionan a continuación:',
            margin: [0, 20, 0, 10],
            alignment: 'justify'
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
            margin: [0, 20, 0, 60],
            alignment: 'center'
          },
          {
            text: 'ING. José Gabriel Castro Bautista\nDirector de Nómina y Control de Plazas',
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
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <input type="radio" id="anterior" name="historico" value="anterior" style="margin-right: 5px;">
                <label for="anterior">Año anterior</label>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <input type="radio" id="accidentes" name="historico" value="accidentes" style="margin-right: 5px;">
                <label for="accidentes">Histórico de Accidentes</label>
            </div>
            <div style="display: flex; align-items: center;">
                <input type="radio" id="actual" name="historico" value="actual" style="margin-right: 5px;">
                <label for="actual">Histórico Actual</label>
            </div>
        `,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'small-swal',
        title: 'small-swal-title'
      },
      width: '450px',
      padding: '1em',
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

        // Mostrar spinner de carga
        Swal.fire({
          title: 'Generando PDF...',
          html: 'Por favor, espere mientras se genera el reporte.',
          didOpen: () => {
            Swal.showLoading();
          },
          allowOutsideClick: false,
          showConfirmButton: false
        });

        // Lógica para la generación del PDF según la opción seleccionada
        switch (opcionSeleccionada) {
          case 'completo':
            this.generarHistoricoCompleto();
            break;
          case 'anterior':
            this.generarHistoricoAnterior();
            break;
          case 'accidentes':
            this.generarHistoricoAccidentes();
            break;
          case 'actual':
            this.generarHistoricoActual();
            break;
        }
      }
    });
  }

  generarHistoricoActual() {
    this.LicenciasService.getLicencias(this.srl_emp).subscribe(async response => {
      const data = response.data;
      const licencias = data.licencias;
      const totalDias = licencias.reduce((acc: any, licencia: { total_days: any; }) => {
        return acc + (licencia.total_days || 0); // Asegúrate de que total_dias tenga un valor
      }, 0);
      const periodos = [...new Set(licencias.map((licencia: any) => licencia.periodo))].join(", ");
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
              },
              {
                text: `Pachuca HGO. ${formattedDate}.`,
                alignment: 'right',
                style: 'subheader'
              }
            ]
          },
          {
            text: 'Reporte de Licencias Médicas del periodo actual',
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
          { text: `Periodo: ${periodos}`, style: 'subheader', margin: [0, 20, 0, 10] },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*', 'auto', 'auto', '*', 'auto'],
              body: [
                // Cabeceras de la tabla
                [
                  { text: 'Folio', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Periodo de la Licencia', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Días', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Oficio', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Fecha de captura', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Fecha de impresion', bold: true, fillColor: '#eeeeee', alignment: 'center' }
                ],
                // Agregar cada licencia correspondiente a este periodo
                ...licencias.map((licencia: { folio: any, desde: any, hasta: any, total_days: any, oficio: any, fechaCaptura: any, color: string, accidente: number, impresion: any }) => {
                  return [
                    { text: licencia.folio, alignment: 'center', color: licencia.color },
                    { text: `${licencia.desde} - ${licencia.hasta}`, alignment: 'center', color: licencia.color },
                    { text: licencia.total_days, alignment: 'center', color: licencia.color },
                    { text: licencia.oficio, alignment: 'center', color: licencia.color },
                    { text: licencia.fechaCaptura, alignment: 'center', color: licencia.color },
                    { text: licencia.impresion, alignment: 'center', color: licencia.color }
                  ];
                })
              ]
            },
            margin: [0, 10, 0, 30]
          },
          {
            text: `Total de días del periodo: ${response.message}`,
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
          title: 'No exite historico Actual',
          text: error.error.message,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      });
  }

  generarHistoricoCompleto() {
    this.LicenciasService.getHistorico(this.srl_emp).subscribe(async response => {
      const data = response.data;
      const licencias = data.licencias;
      const licenciasPorPeriodo = licencias.reduce((acc: any, licencia: { periodo: any }) => {
        (acc[licencia.periodo] = acc[licencia.periodo] || []).push(licencia);
        return acc;
      }, {});
      const totalDiasSumados = licencias.reduce((acc: number, licencia: { total_days: number }) => {
        return acc + (licencia.total_days || 0); // Asegúrate de sumar solo números
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
              width: 170,
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
          text: `Total de días de licencias: ${totalDiasSumados}`,
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
              widths: ['*', '*', 'auto', 'auto', 'auto', 'auto'],
              body: [
                // Cabeceras de la tabla
                [
                  { text: 'Folio', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Periodo de la Licencia', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Días', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Oficio', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Fecha de captura', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Fecha de impresion', bold: true, fillColor: '#eeeeee', alignment: 'center' }
                ],
                // Agregar cada licencia correspondiente a este periodo
                ...licencias.map((licencia: { folio: any, desde: any, hasta: any, total_days: any, oficio: any, fechaCaptura: any, color: string, accidente: number, impresion: any }) => {
                  return [
                    { text: licencia.folio, alignment: 'center', color: licencia.color },
                    { text: `${licencia.desde} - ${licencia.hasta}`, alignment: 'center', color: licencia.color },
                    { text: licencia.total_days, alignment: 'center', color: licencia.color },
                    { text: licencia.oficio, alignment: 'center', color: licencia.color },
                    { text: licencia.fechaCaptura, alignment: 'center', color: licencia.color },
                    { text: licencia.impresion, alignment: 'center', color: licencia.color }
                  ];
                })
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
  }

  generarHistoricoAnterior() {
    this.LicenciasService.getHistoricoAnte(this.srl_emp).subscribe(async response => {
      const data = response.data;
      const licencias = data.licencias;
      const totalDias = licencias.reduce((acc: any, licencia: { total_days: any; }) => {
        return acc + (licencia.total_days || 0); // Asegúrate de que total_dias tenga un valor
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
                width: 170, // Ajustar el ancho
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
            text: 'Reporte de Licencias Médicas del periodo anterior',
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
              widths: ['*', '*', 'auto', 'auto', '*', 'auto'],
              body: [
                // Cabeceras de la tabla
                [
                  { text: 'Folio', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Periodo de la Licencia', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Días', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Oficio', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Fecha de captura', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Fecha de impresion', bold: true, fillColor: '#eeeeee', alignment: 'center' }
                ],
                // Agregar cada licencia correspondiente a este periodo
                ...licencias.map((licencia: { folio: any, desde: any, hasta: any, total_days: any, oficio: any, fechaCaptura: any, color: string, accidente: number, impresion: any }) => {
                  return [
                    { text: licencia.folio, alignment: 'center', color: licencia.color },
                    { text: `${licencia.desde} - ${licencia.hasta}`, alignment: 'center', color: licencia.color },
                    { text: licencia.total_days, alignment: 'center', color: licencia.color },
                    { text: licencia.oficio, alignment: 'center', color: licencia.color },
                    { text: licencia.fechaCaptura, alignment: 'center', color: licencia.color },
                    { text: licencia.impresion, alignment: 'center', color: licencia.color },
                  ];
                })
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

  generarHistoricoAccidentes() {
    this.LicenciasService.getHistoricoAccidentes(this.srl_emp).subscribe(async response => {
      const data = response.data;
      const licencias = data.licencias;
      const licenciasPorPeriodo = licencias.reduce((acc: any, licencia: { aux: any }) => {
        (acc[licencia.aux] = acc[licencia.aux] || []).push(licencia);
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
              width: 170,
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
          text: 'Historico de Accidentes de trabajo ',
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
          text: `Total de días de licencias: ${totalDiasSumados}`,
          alignment: 'right',
          style: 'subheader',
          bold: true,
          margin: [0, 20, 0, 20]
        }
      ];

      // Para cada periodo, agregar un bloque de contenido con una tabla de licencias
      Object.keys(licenciasPorPeriodo).forEach(aux => {
        const licencias = licenciasPorPeriodo[aux] || []; // Asignar un arreglo vacío si no hay licencias
        const periodoTexto = licencias.length > 0 ? licencias[0].periodo : aux;
        const totalDias = licencias.reduce((acc: any, licencia: { total_dias: any; }) => {
          return acc + (licencia.total_dias || 0); // Asegúrate de que total_dias tenga un valor
        }, 0);
        content.push(
          { text: `Periodo del accidente: ${periodoTexto}`, style: 'subheader', margin: [0, 20, 0, 10] },
          {
            table: {
              headerRows: 1,
              widths: ['*', '*', 'auto', 'auto', '*', 'auto'],
              body: [
                // Cabeceras de la tabla
                [
                  { text: 'Folio', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Periodo de la Licencia', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Días', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Oficio', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Fecha de captura', bold: true, fillColor: '#eeeeee', alignment: 'center' },
                  { text: 'Fecha de impresion', bold: true, fillColor: '#eeeeee', alignment: 'center' }
                ],
                // Agregar cada licencia correspondiente a este periodo
                ...licenciasPorPeriodo[aux].map((licencia: { folio: any, desde: any, hasta: any, total_dias: any, oficio: any, fechaCaptura: any, apartir: any, impresion: any }) => [
                  { text: licencia.folio, alignment: 'center' },
                  { text: `${licencia.desde} - ${licencia.hasta}`, alignment: 'center' },
                  { text: licencia.total_dias, alignment: 'center' },
                  { text: licencia.oficio, alignment: 'center' },
                  { text: licencia.fechaCaptura, alignment: 'center' },
                  { text: licencia.impresion, alignment: 'center' }
                ])
              ]
            },
            alignment: 'center',
            margin: [0, 10, 0, 20]
          },
          {
            text: `Total de días de las licencias dentro del accidente: ${totalDias}`,
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
          title: 'No exite historico de accidentes',
          text: error.error.message,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      });
  }






}


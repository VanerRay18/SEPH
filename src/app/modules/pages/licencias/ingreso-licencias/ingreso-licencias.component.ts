import { Component, OnInit } from '@angular/core';
import { TablesComponent } from 'src/app/shared/componentes/tables/tables.component';
import { LicenciasService } from 'src/app/services/licencias-service/licencias.service';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { Employee } from 'src/app/shared/interfaces/usuario.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'ingreso-licencias',
  templateUrl: './ingreso-licencias.component.html',
  styleUrls: ['./ingreso-licencias.component.css']
})
export class IngresoLicenciasComponent implements OnInit {

  insertarLic!: FormGroup;
  headers = ['No. de Licencia', 'Desde', 'Hasta', 'Días', 'Status de licencia', 'No. de oficio', 'Acciones'];
  displayedColumns = ['folio', 'desde', 'hasta', 'total_dias', 'status', 'oficio'];
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
    private fb: FormBuilder
  ) {
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

  HOLA(){
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

    this.srl_emp = srl_emp;
    console.log('Buscando por RFC:', this.rfcSearchTerm, 'y Nombre:', this.nombreSearchTerm);

    this.LicenciasService.getLicencias(srl_emp).subscribe((response: ApiResponse) => {
      this.data = response.data; // Asegúrate de mapear correctamente los datos
      console.log(response)
      this.showCard = true;
    },
      (error) => {
        console.error('Error al buscar licencias:', error);
        this.showCard = false; // Oculta la tarjeta en caso de error
      }
    );
  }

  onSumit():void{
    if (this.insertarLic.valid) {
      const userId=localStorage.getItem('userId')!
      const fechaInicio = new Date(this.insertarLic.value.fecha_inicio);
      const fechaTermino = new Date(this.insertarLic.value.fecha_termino);
      const data = {
        folio: this.insertarLic.value.folio,
        fecha_inicio: fechaInicio.toISOString(), // Mantener en formato ISO para el envío
        fecha_termino: fechaTermino.toISOString(),
        formato: parseInt(this.insertarLic.value.formato, 10)
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
              showConfirmButton: false, // No muestra el botón
              timer: 1500, // Duración en milisegundos (2000 ms = 2 segundos)
              timerProgressBar: true // Muestra una barra de progreso del temporizador (opcional)
            });
          },
          error => {
            console.error('Error al agregar la licencia', error);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo agregar la licencia.',
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

  // Método para editar un registro
  onEdit(data: any) {
    console.log('Editar:', data);


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
      const fecha_inicio = ((document.getElementById('fecha_inicioId') as HTMLInputElement).value)+'T00:00:00';
      const fecha_termino = ((document.getElementById('fecha_terminoId') as HTMLInputElement).value)+'T00:00:00';
      const formato = parseInt((document.querySelector('input[name="formato"]:checked') as HTMLInputElement).value);

        // Validación de campos
        if (!folio || !fecha_inicio || !fecha_termino) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }

        return {
          folio,
          fecha_inicio,
          fecha_termino,
          formato
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const dataEditada = result.value;
        console.log(dataEditada)
        console.log('Datos editados:', dataEditada);

        // Envío de los datos editados al backend
        this.guardarCambios(dataEditada);
      }
    });
  }

  guardarCambios(data: any) {
    const userId = localStorage.getItem('userId')!;

const licenciaId = "66253";
    this.LicenciasService.updateLic(data,licenciaId, userId).subscribe(
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
          text: 'No se pudo editar la licencia.',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    );
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


import { Component, Input } from '@angular/core';
import { LicenciasService } from 'src/app/services/licencias-service/licencias.service';
import { Employee } from 'src/app/shared/interfaces/usuario.model';
import { ApiResponse } from 'src/app/models/ApiResponse';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'ingreso-accidentes',
  templateUrl: './ingreso-accidentes.component.html',
  styleUrls: ['./ingreso-accidentes.component.css']
})
export class IngresoAccidentesComponent{
  insertarLics!: FormGroup;
  headers = ['No. de Licencia', 'Desde', 'Hasta', 'Días', 'No. de oficio', 'Acciones'];
  displayedColumns = ['folio', 'desde', 'hasta', 'total_dias','oficio'];
  data = [];


  rfcSearchTerm: string = '';
  nombreSearchTerm: string = '';

  // Aquí es donde se almacenarán los datos que lleguen del backend
  items: { rfc: string; nombre: string ; srl_emp:number}[] = [];

  // Sugerencias para dropdown
  rfcSuggestions: { rfc: string; nombre: string; srl_emp:number }[] = [];
  nombreSuggestions: { rfc: string; nombre: string ; srl_emp:number}[] = [];

  activeTab: string = 'licencias'; // Pestaña activa por defecto

  tabs = [
    { id: 'licencias', title: 'Licencias Médicas', icon: 'fas fa-file-medical' },
    { id: 'accidentes', title: 'Accidentes de Trabajo', icon: 'fas fa-exclamation-triangle' },
    { id: 'acuerdos', title: 'Acuerdos Precedenciales', icon: 'fas fa-handshake' }
  ];
  @Input() srl_emp: any = ""; 
  constructor(
    private fb: FormBuilder,
    private LicenciasService: LicenciasService
  ) {
    //this.fetchData(); // Si tienes un endpoint real, descomenta esto
  }
  ngOnInit() {
    this.buscar(this.srl_emp)

    this.HOLA();

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
selectRFC(item: { rfc: string; nombre: string; srl_emp:number}) {
  this.rfcSearchTerm = item.rfc;
  this.nombreSearchTerm = item.nombre;
  this.rfcSuggestions = [];
  this.nombreSuggestions = [];
  this.srl_emp = item.srl_emp
}

// Seleccionar un Nombre y completar el RFC
selectNombre(item: { rfc: string; nombre: string ; srl_emp:number}) {
  this.nombreSearchTerm = item.nombre;
  this.rfcSearchTerm = item.rfc;
  this.srl_emp = item.srl_emp


  this.rfcSuggestions = [];
  this.nombreSuggestions = [];
}

// Método para buscar con los términos ingresados
buscar(srl_emp:any) {
  console.log('Buscando por RFC:', this.rfcSearchTerm, 'y Nombre:', this.nombreSearchTerm);

  this.LicenciasService.getAccidentes(srl_emp).subscribe((response: ApiResponse) => {
    this.data = response.data; // Asegúrate de mapear correctamente los datos
    console.log(response)
  });
}


  setActiveTab(tabId: string) {
    this.activeTab = tabId; // Cambia la pestaña activa
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
            const fecha_inicio = ((document.getElementById('fecha_inicioId') as HTMLInputElement).value)+'T00:00:00';
            const fecha_termino = ((document.getElementById('fecha_terminoId') as HTMLInputElement).value)+'T00:00:00';
            const formato = parseInt((document.querySelector('input[name="formato"]:checked') as HTMLInputElement).value);
            const accidente = 1;
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
              this.guardarCambios(dataEditada,data.id);
            }
          });
        }
        guardarCambios(data: any,licenciaId:any) {
          const userId = localStorage.getItem('userId')!;
      
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

        HOLA(){
          this.insertarLics = this.fb.group({
            folio: ['', Validators.required],
            fecha_inicio: ['', Validators.required],
            fecha_termino: ['', Validators.required],
            formato: ['', Validators.required]
          });
        }
    // Método para eliminar un registro
    // onDelete(row: any) {
    //   console.log('Deleting row', row);
    //   this.LicenciasService.deleteLicencia(row.folio).subscribe(() => {
    //     // Eliminar el registro del arreglo de datos localmente
    //     this.data = this.data.filter(item => item.folio !== row.folio);
    //   });
    // }


    onSumit(){
      if (this.insertarLics.valid) {
        const userId=localStorage.getItem('userId')!
        const fechaInicio = new Date(this.insertarLics.value.fecha_inicio);
        const fechaTermino = new Date(this.insertarLics.value.fecha_termino);
        const data = {
          folio: this.insertarLics.value.folio,
          fecha_inicio: fechaInicio.toISOString(), // Mantener en formato ISO para el envío
          fecha_termino: fechaTermino.toISOString(),
          formato: parseInt(this.insertarLics.value.formato, 10),
          "accidente":1
  
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
}

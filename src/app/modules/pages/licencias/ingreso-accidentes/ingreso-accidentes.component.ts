import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LicenciasService } from 'src/app/services/licencias-service/licencias.service';
import { BusquedaserlService } from 'src/app/services/busquedaserl.service';
import { ApiResponse } from 'src/app/models/ApiResponse';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { PermisosUserService } from 'src/app/services/permisos-user.service';
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
  table:any = true;
  srl_emp: any; 
  eliminar:boolean = false;
  agregar:boolean = false;
  modificar:boolean = false;
  activeTab: string = 'licencias'; // Pestaña activa por defecto

  tabs = [
    { id: 'licencias', title: 'Licencias Médicas', icon: 'fas fa-file-medical' },
    { id: 'accidentes', title: 'Accidentes de Trabajo', icon: 'fas fa-exclamation-triangle' },
    { id: 'acuerdos', title: 'Acuerdos Precedenciales', icon: 'fas fa-handshake' }
  ];
 
  constructor(
    private fb: FormBuilder,
    private LicenciasService: LicenciasService,
    private BusquedaserlService: BusquedaserlService,
    private PermisosUserService:PermisosUserService
  ) {
    //this.fetchData(); // Si tienes un endpoint real, descomenta esto
  }
  ngOnInit() {
    this.modificar = this.PermisosUserService.edit();
    this.agregar = this.PermisosUserService.add();
    this.eliminar = this.PermisosUserService.deleted();
    this.BusquedaserlService.srlEmp$.subscribe(value => {
      if(value.mostrar == true){
        this.srl_emp = value.srl_emp;
        this.buscar(this.srl_emp);}
    });
    this.HOLA();
  }

buscar(srl_emp:any) {
  this.LicenciasService.getAccidentes(srl_emp).subscribe((response: ApiResponse) => {
    this.table=true
    this.data = response.data;
  },
  (error) => {
    this.table = false; 
  });
}


  setActiveTab(tabId: string) {
    this.activeTab = tabId; // Cambia la pestaña activa
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
              this.guardarCambios(dataEditada,data.id);
            }
          });
  }

  guardarCambios(data: any,licenciaId:any) {
          const userId = localStorage.getItem('userId')!;
      
          this.LicenciasService.updateLic(data,licenciaId, userId).subscribe(
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

  HOLA(){
          this.insertarLics = this.fb.group({
            folio: ['', Validators.required],
            fecha_inicio: ['', Validators.required],
            fecha_termino: ['', Validators.required],
            formato: ['', Validators.required]
          });
  }

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
              this.buscar(this.srl_emp)
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
}

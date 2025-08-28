import { TercerosService } from './../../../../services/terceros.service';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ApiResponse } from 'src/app/models/ApiResponse';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { FileTransferService } from 'src/app/services/file-transfer.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RegistroTabla } from 'src/app/shared/interfaces/utils';
import { HttpHeaders } from '@angular/common/http';
import { PhpTercerosService } from 'src/app/services/php-terceros.service';

@Component({
  selector: 'app-create-layout-forte',
  templateUrl: './create-layout-forte.component.html',
  styleUrls: ['./create-layout-forte.component.css']
})
export class CreateLayoutForteComponent {
  searchTerm: string = '';
  headers = ['RFC', 'Nombre', 'Num Documento', 'Tipo', 'Importe', 'Concepto desc.', 'Quincena aplicacion', ''];
  displayedColumns = ['rfc', 'nombre', 'documento', 'tipo', 'importe', 'concepto', 'desde'];
  data: any[] = [];
  crearlayout: any;
  isLoading = false;
  terceroId: any;
  selectedFile: File | null = null;
  info: any;
  added: any;
  ilimitado: any;
  arrayUserRecibido: any;
  datosLayout: FormGroup;

  constructor(
    private router: Router,
    private TercerosService: TercerosService,
    private cdr: ChangeDetectorRef,
    private fileTransferService: FileTransferService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private php: PhpTercerosService,
  ) {
    this.datosLayout = this.fb.group({
      nombre: [''],
      apellido1: [''],
      apellido2: [''],
      rfc: [''],
      srl_emp: [''],
      quincena: [''],
      porcentaje: ['1'] // Valor por defecto
    });
  }
  async ngOnInit(): Promise<void> {
    this.terceroId = this.route.snapshot.paramMap.get('id');
    this.fetchData();
    this.isLoading = false;
  }


  fetchData() {
    this.TercerosService.getInformationById(this.terceroId).subscribe((response: ApiResponse) => {
      this.info = response.data;
      this.ilimitado = response.data.ilimitado;
      this.added = response.data.added;

      if (this.added === true) {
        this.crearlayout = 1;
      } else {
        this.crearlayout = 0;
      }

      //  console.log('Información recibida:', this.info);
    },
      (error) => {
        // console.error('Error al obtener los datos:', error);
        console.error('Ocurrio un error', error);
      });

    this.TercerosService.getLayout(this.terceroId).subscribe((response: ApiResponse) => {
      this.data = response.data;
      console.log('Datos del layout recibidos:', this.data);
    },
      (error) => {
        // console.error('Error al obtener los datos:', error);
        console.error('Ocurrio un error', error);
      });



  }

  recibirArrayUser(event: any) {
    this.arrayUserRecibido = event;
    // console.log('Array recibido:', this.arrayUserRecibido);
    const nombreCompleto: string = event.nombre || '';
    const partes = nombreCompleto.trim().split(' ');

    const nombre = partes[2] || '';
    const apellido1 = partes[0] || '';
    const apellido2 = partes[1] || ''; // si tiene más, puedes unirlos si quieres

    this.datosLayout.patchValue({
      nombre: nombre,
      apellido1: apellido1,
      apellido2: apellido2,
      rfc: event.rfc || '',
      srl_emp: event.srl_emp || ''
    });
  }

  guardar() {
    const datosForm = this.datosLayout.value;
    const nombre = `${datosForm.nombre} ${datosForm.apellido1} ${datosForm.apellido2}`;
    const rfc = `${datosForm.rfc}`;
    const monto_descuento = 36;

    const servicio = 'get_validar_docente';
    let headers = new HttpHeaders;

    headers = new HttpHeaders({ 'terceroId': this.terceroId, 'rfc': rfc, 'nombre': nombre, 'monto_descuento': monto_descuento, 'servicio': servicio });


    this.php.validadorUser(headers).subscribe((response: ApiResponse) => {
      console.log('Respuesta del servidor:', response);
      if (response.data.procede_aplicar_descuento_tercero === 'true') {
        Swal.fire('Éxito', 'Registro agregado correctamente.', 'success');
        this.data.push(datosForm); // agrega a la tabla
        this.data = [...this.data]; // forza detección de cambios si es necesario
        this.datosLayout.reset();
      } else {
        // Crear lista HTML
        const erroresHtml = response.data.errores
          .map((error: string) => `<li>${error}</li>`)
          .join('');

        Swal.fire({
          icon: 'error',
          title: 'Error',
          html: `<ul style="text-align: left;">${erroresHtml}</ul>`
        });
      }
    }, (error) => {
      console.error('Error al obtener los datos:', error);
      Swal.fire('Error', 'Ocurrió un error al procesar la solicitud.', 'error');
    });

    this.data = [...this.data]; // forza detección de cambios si es necesario

    // Opcional: limpia el formulario
    this.datosLayout.reset();


    console.log('Nuevo registro agregado:', datosForm);
  }

  onDelete(licenciaId: any) {

  }

  saveLayout(): void {
    if (this.data.length === 0) {
      Swal.fire('Advertencia', 'No hay datos para guardar.', 'warning');
      return;
    }
    console.log('Datos a guardar:', this.data);
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas guardar los datos del layout?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Guardando datos',
          html: 'Por favor, espere mientras se guardan los datos.',
          didOpen: () => {
            Swal.showLoading();
          },
          allowOutsideClick: false,
          showConfirmButton: false
        });
        this.TercerosService.createLayout(this.data, this.terceroId).subscribe({
          next: (response: ApiResponse) => {
            Swal.close();
            Swal.fire('Éxito', 'Datos guardados correctamente.', 'success');
            this.data = []; // Limpiar la tabla después de guardar
          },
          error: (error: any) => {
            console.error('Error al guardar los datos:', error);
            Swal.fire('Error', 'No se pudieron guardar los datos.', 'error');
          }
        });
      }
    });
  }

  continueNomina(): void {
    this.router.navigate(['/pages/Terceros/Reporte-Validacion']);
    this.fetchData();
  }




  DescargarLayout(): void {
    if (!this.terceroId) {
      Swal.fire('Error', 'ID de tercero no disponible.', 'error');
      return;
    }

  }
}

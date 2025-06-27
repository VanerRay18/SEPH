import { TercerosService } from './../../../../services/terceros.service';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ApiResponse } from 'src/app/models/ApiResponse';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { FileTransferService } from 'src/app/services/file-transfer.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RegistroTabla } from 'src/app/shared/interfaces/utils';

@Component({
  selector: 'app-crear-layout',
  templateUrl: './crear-layout.component.html',
  styleUrls: ['./crear-layout.component.css']
})
export class CrearLayoutComponent {
searchTerm: string = '';
  headers = ['RFC','Nombre','Num Documento','Tipo','Importe','Concepto desc.', 'Quincena aplicacion', ''];
  displayedColumns = ['rfc','nombre','documento','tipo','importe','concepto', 'desde'];
  data: [] = [];
  crearlayout:any;
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
    private fb: FormBuilder
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
    // this.nominaId = await this.loadNominaId();

    this.fileTransferService.currentIdTercero$.subscribe((id) => {
      this.terceroId = id;
      // console.log('ID recibido:', this.terceroId);
      // Aquí puedes llamar a un servicio o usar el ID como necesites
    });

    this.fetchData();
    this.isLoading = false;
  }


  fetchData() {
  this.TercerosService.getInformationById(this.terceroId).subscribe((response: ApiResponse) => {
    this.info = response.data;
    this.ilimitado = response.data.ilimitado;
    this.added = response.data.added;

    if(this.added === true){
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

    const nuevoRegistro = {
      nombre: `${datosForm.nombre} ${datosForm.apellido1} ${datosForm.apellido2}`,
      documento: "000000",
      tipo: "2",
      concepto: datosForm.porcentaje,
      desde: datosForm.quincena,
      srl_emp: datosForm.srl_emp,
      descuento: this.datosLayout.value.porcentaje === '5L' ? '1' : '2'
    };

    this.TercerosService.createLayout(nuevoRegistro, this.terceroId).subscribe({
      next: (response: ApiResponse) => {
        Swal.fire('Éxito', 'Datos guardados correctamente.', 'success');
        this.data = []; // Limpiar la tabla después de guardar
        this.fetchData();
      },
      error: (error: any) => {
        console.error('Error al guardar los datos:', error.error.message);
        Swal.fire( "NO SE PUDO GUARDAR EL REGISTRO:", error.error.message, 'error');
      }
    });

   // this.data.push(nuevoRegistro); // agrega a la tabla
    this.data = [...this.data]; // forza detección de cambios si es necesario

    // Opcional: limpia el formulario
    this.datosLayout.reset({ porcentaje: '1' });


    console.log('Nuevo registro agregado:', nuevoRegistro);
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

  // Evento cuando el usuario selecciona el archivo
onFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.selectedFile = input.files[0];
    this.sentLayout(); // Envía el archivo después de seleccionarlo
  }
}

async sentLayout(): Promise<void> {
  if (!this.selectedFile) return;

  this.fileTransferService.setFile(this.selectedFile);

  Swal.fire({
    title: 'Procesando los layouts',
    html: 'Por favor, espere mientras se procesan los layouts.',
    didOpen: () => {
      Swal.showLoading();
    },
    allowOutsideClick: false,
    showConfirmButton: false
  });

  const file = this.selectedFile;

  try {
    this.TercerosService.SentLayout(file).subscribe({
      next: (response: ApiResponse) => {
        this.data = response.data;
        // console.log(this.data)
        Swal.close();
        Swal.fire('Éxito', 'Archivo enviado correctamente.', 'success');
        this.selectedFile = null; // Limpiar para el próximo uso
      },
      error: (error: any) => {
        console.error('Error al enviar el archivo:', error);
        Swal.fire('Error', 'No se pudo enviar el archivo.', 'error');
      }
    });
  } catch (error) {
    console.error('Error inesperado:', error);
    Swal.fire('Error', 'Ha ocurrido un error inesperado.', 'error');
  }
}


  // Función para convertir a número, manejando cadenas vacías o no válidas





}

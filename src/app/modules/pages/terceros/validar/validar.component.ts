import { TercerosService } from './../../../../services/terceros.service';
import { ChangeDetectorRef, Component } from '@angular/core';
import { ApiResponse } from 'src/app/models/ApiResponse';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { FileTransferService } from 'src/app/services/file-transfer.service';

@Component({
  selector: 'app-validar',
  templateUrl: './validar.component.html',
  styleUrls: ['./validar.component.css']
})
export class ValidarComponent {
  searchTerm: string = '';
  headers = ['Ramo','Pagaduria','RFC', 'Nombre','Tipo', 'Plazo','Periodo', 'Concepto desc.', 'Importe','Num. Doc.', 'Quincena aplicacion', 'Fecha de documento','Tipo de registro'];
  displayedColumns = ['ramo','pagaduria','RFC', 'nombre', 'tipo_orden', 'plazo', 'periodo','concepto', 'importe','num_doc','quincena_aplicacion','fecha_documento', 'tipo_registro'];
  data = [] ;
  crearlayout:any;
  isLoading = false;
  terceroId: any;
  selectedFile: File | null = null;
  info: any;
  added: any;
  ilimitado: any;

  constructor(
    private router: Router,
    private TercerosService: TercerosService,
    private cdr: ChangeDetectorRef,
    private fileTransferService: FileTransferService,
  ) {
    // Registrar las fuentes necesarias
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


  // async loadNominaId() {
  //   const nominaId = await this.NominaBecService.getNominaId();
  //   return nominaId
  // }

  onContinueNomina() {
    this.continueNomina();  // Primero ejecuta la lógica de continuar la nómina

    this.fetchData();
  }

  fetchData() {
  this.data;
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

import { ChangeDetectorRef, Component } from '@angular/core';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { NominaBecService } from 'src/app/services/nomina-bec.service';
import { NominaA, Resumen } from 'src/app/shared/interfaces/utils';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Anexo06 } from 'src/app/shared/interfaces/utils';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Anexo05 } from 'src/app/shared/interfaces/utils';

@Component({
  selector: 'app-validar',
  templateUrl: './validar.component.html',
  styleUrls: ['./validar.component.css']
})
export class ValidarComponent {
  searchTerm: string = '';
  headers = ['RFC', 'Nombre', 'Num. Doc.', 'Tipo', 'Importe', 'Concepto desc.','Quincena desde'];
  displayedColumns = ['nombre', 'curp', 'importTotal', 'retentionTotal', 'liquidTotal','concepto','quin_desde'];
  data = [];
  nominaId: any;
  crearlayout:any;
  status = localStorage.getItem('status')!;
  data2: NominaA | null = null;
  isButtonDisabled: boolean = false;
  isButtonDisabled2: boolean = false;
  isLoading = true;
  nominaSpecial: any;
  resumen: Resumen = {
    clabes: 0,
    plazas: 0,
    deducciones: '',
    personas: 0,
    percepciones: '',
    liquido: ''
  };


  constructor(
    private router: Router,
    private NominaBecService: NominaBecService,
    private cdr: ChangeDetectorRef
  ) {
    // Registrar las fuentes necesarias
  }
  async ngOnInit(): Promise<void> {
    this.nominaId = await this.loadNominaId();
    this.fetchData();
    this.isLoading = true;
    this.crearlayout = 0 ;
  }


  async loadNominaId() {
    const nominaId = await this.NominaBecService.getNominaId();
    return nominaId
  }

  onContinueNomina() {
    this.continueNomina();  // Primero ejecuta la lógica de continuar la nómina

    this.fetchData();
  }

  fetchData() {

    this.NominaBecService.getNomina().subscribe((response: ApiResponse) => {
      this.data2 = response.data;
    },
      (error) => {
        console.error('Error al obtener los datos:', error);
      });

    this.NominaBecService.getInformationCalculation(this.nominaId).subscribe((response: ApiResponse) => {
      this.data = response.data; // Aquí concatenas las fechas
      this.isLoading = this.data.length === 0;
    },
      (error) => {
        console.error('Error al obtener los datos:', error);
      });

    this.NominaBecService.getResumeExel(this.nominaId).subscribe((response: ApiResponse) => {
      this.resumen = response.data; // Aquí concatenas las fechas

    },
      (error) => {
        console.error('Error al obtener los datos:', error);
      });

  }


  saveNomina(): void {

      Swal.fire({
        title: 'Confirmar',
        html: `¿Está seguro de que los calculos de la nomina estan correctos?<br><br>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'No, cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          // Mostrar spinner de carga
          Swal.fire({
            title: 'Guardando la nomina...',
            html: 'Por favor, espere mientras se guarda la nomina.',
            didOpen: () => {
              Swal.showLoading();
            },
            allowOutsideClick: false,
            showConfirmButton: false
          });
          // El usuario confirmó, proceder a enviar los datos
          this.NominaBecService.saveNomina(this.data).subscribe(
            response => {
              this.fetchData();
              Swal.fire({
                title: 'Nomina Guardada',
                text: 'Se guardo la Nomina correctamente',
                icon: 'success',
                confirmButtonText: 'Aceptar'
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

  }

  continueNomina(): void {
    this.router.navigate(['/pages/Terceros/Reporte-Validacion']);
    this.fetchData();
  }

  async generateAnexos(): Promise<void> {
    Swal.fire({
      title: 'Generando los Anexos..',
      html: 'Por favor, espere mientras se genera el Excel de los anexos.',
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
      showConfirmButton: false
    });

    try {

    } catch (error) {

    }
  }

  // Función para convertir a número, manejando cadenas vacías o no válidas






}

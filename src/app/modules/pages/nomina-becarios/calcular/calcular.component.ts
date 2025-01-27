import { ChangeDetectorRef, Component } from '@angular/core';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { NominaBecService } from 'src/app/services/nomina-bec.service';
import { NominaA } from 'src/app/shared/interfaces/utils';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { OnChanges, SimpleChanges } from '@angular/core';


@Component({
  selector: 'app-calcular',
  templateUrl: './calcular.component.html',
  styleUrls: ['./calcular.component.css']
})
export class CalcularComponent {
  searchTerm: string = '';
  headers = ['Nombre', 'CURP', 'Percepciones', 'Deducciones', 'Total', 'Detalles', ''];
  displayedColumns = ['nombre', 'curp', 'importTotal', 'retentionTotal', 'liquidTotal'];
  data = [];
  nominaId:any;
  status = localStorage.getItem('status')!;
  data2: NominaA | null = null;
  isButtonDisabled: boolean = false;
  isButtonDisabled2: boolean = false;

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

  }


  async loadNominaId() {
    const nominaId = await this.NominaBecService.getNominaId();
  }

  onContinueNomina() {
    this.continueNomina();  // Primero ejecuta la lógica de continuar la nómina

    // Si continueNomina() es síncrona
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
    },
      (error) => {
        console.error('Error al obtener los datos:', error);
      });


  }

  showDetails(row: any) {

    const detalles = row.detalles;

    let tableHtml = `
      <table class="table table-bordered">
        <thead>
          <tr>
            <th>Pago</th>
            <th>Tipo</th>
            <th>Plaza</th>
            <th>Quincenas</th>
            <th>Total</th>
            <th>Retención</th>
            <th>Líquido</th>
          </tr>
        </thead>
        <tbody>
          ${detalles.map((item: any) => `
            <tr>
              <td>${item.pago || 'N/A'}</td>
              <td>${item.type || 'N/A'}</td>
              <td>${item.plaza || 'N/A'}</td>
              <td>${item.quincenas || 'N/A'}</td>
              <td>${item.import || 'N/A'}</td>
              <td>${item.retention || 'N/A'}</td>
              <td>${item.liquid || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;

    Swal.fire({
      title: 'Detalles del Pago',
      html: tableHtml,
      width: '1000px',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#3085d6',
      backdrop: true,
    });
  }

  saveNomina(): void {

    if (this.data2?.status == 1) {
      this.isButtonDisabled = true;

    } else {
      this.isButtonDisabled = false;

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
  }

  continueNomina(): void{
    this.router.navigate(['/pages/NominaBecarios/Nominas-Pagar']);
    this.fetchData();
  }


}

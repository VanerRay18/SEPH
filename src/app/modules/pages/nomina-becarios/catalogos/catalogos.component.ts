import { Component } from '@angular/core';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { NominaBecService } from 'src/app/services/nomina-bec.service';
import { NominaA } from 'src/app/shared/interfaces/utils';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-catalogos',
  templateUrl: './catalogos.component.html',
  styleUrls: ['./catalogos.component.css']
})
export class CatalogosComponent {

  searchTerm: string = '';
  headers = ['Sustitutos', '48', '01', 'Liquido', 'Tipo','Acciones'];
  displayedColumns = ['category', 'import', 'retention', 'liquid', 'type'];
  data = [];
  nominaId:any;
  data2: NominaA | null = null;
  modificar: boolean = false;


  constructor(

    private NominaBecService: NominaBecService,

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

  fetchData() {

    this.NominaBecService.getNomina().subscribe((response: ApiResponse) => {
      this.data2 = response.data;

    },
      (error) => {
        console.error('Error al obtener los datos:', error);
      });

    this.NominaBecService.getCatalogos().subscribe((response: ApiResponse) => {
      this.data = response.data; // Aquí concatenas las fechas
    },
      (error) => {
        console.error('Error al obtener los datos:', error);
      });


  }

  onEdit(data: any) {
      //AAGP790513HH4
      Swal.fire({
        title: 'Editar Sustituto',
        html: `
        <div style="display: flex; flex-direction: column; text-align: left;">
          <label style="margin-left:33px;" for="folio">Sustituto:</label>
          <input id="folioId" class="swal2-input" value="${data.category}" style="padding: 0px; font-size: 16px;">
        </div>

         <div style="display: flex; flex-direction: column; text-align: left;">
          <label style="margin-left:33px;" for="folio">Cantidad del motivo 48: </label>
          <input id="folioId" class="swal2-input" value="${data.import}" style="padding: 0px; font-size: 16px;">
        </div>

         <div style="display: flex; flex-direction: column; text-align: left;">
          <label style="margin-left:33px;" for="folio">Cantidad del motivo 01: </label>
          <input id="folioId" class="swal2-input" value="${data.retention}" style="padding: 0px; font-size: 16px;">
        </div>

         <div style="display: flex; flex-direction: column; text-align: left;">
          <label style="margin-left:33px;" for="folio">Liquido: </label>
          <input id="folioId" class="swal2-input" value="${data.liquid}" style="padding: 0px; font-size: 16px;">
        </div>

         <div style="display: flex; flex-direction: column; text-align: left;">
          <label style="margin-left:33px;" for="folio">Tipo: </label>
          <input id="folioId" class="swal2-input" value="${data.type}" style="padding: 0px; font-size: 16px;">
        </div>
     `,

        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const folio = (document.getElementById('folioId') as HTMLInputElement).value;
          const fecha_inicio = ((document.getElementById('fecha_inicioId') as HTMLInputElement).value) + 'T00:00:00';
          const fecha_termino = ((document.getElementById('fecha_terminoId') as HTMLInputElement).value) + 'T00:00:00';
          const formato = parseInt((document.querySelector('input[name="formato"]:checked') as HTMLInputElement).value);
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
          this.guardarCambios(dataEditada, data.id);
        }
      });
    }

    guardarCambios(data: any, licenciaId: any) {
        const userId = localStorage.getItem('userId')!;

        this.NominaBecService.NewCatalogos(data).subscribe(
          response => {
            this.fetchData();
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


}

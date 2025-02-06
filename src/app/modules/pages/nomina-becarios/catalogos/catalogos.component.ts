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
  headers = ['Categoria', 'PD', 'Concepto', 'Importe', 'Tipo','Acciones'];
  displayedColumns = ['category', 'pd', 'concept', 'importe', 'type'];
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

  newSutitute() {
    //AAGP790513HH4
    Swal.fire({
      title: 'Agregar Sustituto', // 🔹 Cambio de título
      html: `
      <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;" for="category">Sustituto:</label>
        <input id="category" class="swal2-input" placeholder="Ingresa el sustituto" style="padding: 0px; font-size: 16px;">
      </div>

      <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;" for="importt">Cantidad del motivo 48:</label>
        <input id="importt" class="swal2-input" placeholder="Ingresa cantidad" style="padding: 0px; font-size: 16px;">
      </div>

      <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;" for="retention">Cantidad del motivo 01:</label>
        <input id="retention" class="swal2-input" placeholder="Ingresa cantidad" style="padding: 0px; font-size: 16px;">
      </div>

      <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;" for="liquid">Líquido:</label>
        <input id="liquid" class="swal2-input" placeholder="Ingresa valor" style="padding: 0px; font-size: 16px;">
      </div>

      <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;" for="type">Tipo:</label>
        <input id="type" class="swal2-input" placeholder="Ingresa tipo" style="padding: 0px; font-size: 16px;">
      </div>
      `,

      showCancelButton: true,
      confirmButtonText: 'Agregar', // 🔹 Cambio de botón
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const category = (document.getElementById('category') as HTMLInputElement).value;
        const importe = (document.getElementById('importt') as HTMLInputElement).value;
        const retention = (document.getElementById('retention') as HTMLInputElement).value;
        const liquid = (document.getElementById('liquid') as HTMLInputElement).value;
        const type = (document.getElementById('type') as HTMLInputElement).value;

        if (!category || !importe || !retention || !liquid || !type) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }

        return {
          category,
          importe,
          retention,
          liquid,
          type
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const data = result.value;
        // Llamar al método para guardar el nuevo sustituto
        this.saveNew(data);
      }
    });
  }

  saveNew(data: any) {

    this.NominaBecService.NewCatalogos(data).subscribe(
      response => {
        this.fetchData();
        Swal.fire({
          title: '¡Éxito!',
          text: 'Se editó el sustituto correctamente.',
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

  onEdit(data: any) {
      //AAGP790513HH4
      Swal.fire({
        title: 'Editar Sustituto',
        html: `
        <div style="display: flex; flex-direction: column; text-align: left;">
          <label style="margin-left:33px;" for="category">Sustituto:</label>
          <input id="category" class="swal2-input" value="${data.category}" style="padding: 0px; font-size: 16px;">
        </div>

         <div style="display: flex; flex-direction: column; text-align: left;">
          <label style="margin-left:33px;" for="importt">Cantidad del motivo 48: </label>
          <input id="importt" class="swal2-input" value="${data.import}" style="padding: 0px; font-size: 16px;">
        </div>

         <div style="display: flex; flex-direction: column; text-align: left;">
          <label style="margin-left:33px;" for="retention">Cantidad del motivo 01: </label>
          <input id="retention" class="swal2-input" value="${data.retention}" style="padding: 0px; font-size: 16px;">
        </div>

         <div style="display: flex; flex-direction: column; text-align: left;">
          <label style="margin-left:33px;" for="liquid">Liquido: </label>
          <input id="liquid" class="swal2-input" value="${data.liquid}" style="padding: 0px; font-size: 16px;">
        </div>

         <div style="display: flex; flex-direction: column; text-align: left;">
          <label style="margin-left:33px;" for="type">Tipo: </label>
          <input id="type" class="swal2-input" value="${data.type}" style="padding: 0px; font-size: 16px;">
        </div>
     `,

        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const category = (document.getElementById('category') as HTMLInputElement).value;
          const importe = (document.getElementById('importt') as HTMLInputElement).value;
          const retention = (document.getElementById('retention') as HTMLInputElement).value;
          const liquid = (document.getElementById('liquid') as HTMLInputElement).value;
          const type = (document.getElementById('type') as HTMLInputElement).value;
          if (!category || !importe || !retention || !liquid || !type) {
            Swal.showValidationMessage('Todos los campos son obligatorios');
            return false;
          }

          return {
            category,
            importe,
            retention,
            liquid,
            type
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

    guardarCambios(data: any, catalogoId: any) {

        this.NominaBecService.editCatalogos(data, catalogoId).subscribe(
          response => {
            this.fetchData();
            Swal.fire({
              title: '¡Éxito!',
              text: 'Se editó el sustituto correctamente.',
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

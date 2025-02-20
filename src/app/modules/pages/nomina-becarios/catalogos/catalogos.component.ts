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
  headers = ['Categoria', 'PD', 'Concepto', 'Importe', 'Tipo','Quincena incio', 'Quincena fin','Acciones'];
  displayedColumns = ['category', 'pd', 'concept', 'importe', 'type','quinini', 'quinfin'];
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
        <label style="margin-left:33px;" for="category">Categoria:</label>
        <input id="category" class="swal2-input" placeholder="Ingresa el nombre de la categoria" style="padding: 0px; font-size: 16px;">
      </div>

      <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;" for="pd">Ingresa el pd: </label>
        <input id="pd" class="swal2-input" placeholder="Escriba 'p' si es percepcion o 'd' si es deduccion" style="padding: 0px; font-size: 16px;">
      </div>

      <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;" for="concept">Clave del concepto: </label>
        <input id="concept" class="swal2-input" placeholder="Ingresa la clave del concepto" style="padding: 0px; font-size: 16px;">
      </div>

      <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;" for="importe">Importe:</label>
        <input id="importe" class="swal2-input" placeholder="Ingresa valor del concepto" style="padding: 0px; font-size: 16px;">
      </div>

      <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;" for="type">Tipo:</label>
        <input id="type" class="swal2-input" placeholder="Ingresa tipo" style="padding: 0px; font-size: 16px;">
      </div>

        <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;" for="quinini">Quincena Inicio:</label>
        <input id="quinini" class="swal2-input" placeholder="Ingresa la quinciena en la inicia" style="padding: 0px; font-size: 16px;">
      </div>

      <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;" for="quinfin">Quincena Fin:</label>
        <input id="quinfin" class="swal2-input" placeholder="Ingresa la quinciena en la termina" style="padding: 0px; font-size: 16px;">
      </div>
      `,

      showCancelButton: true,
      confirmButtonText: 'Agregar', // 🔹 Cambio de botón
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const category = (document.getElementById('category') as HTMLInputElement).value;
        const importe = (document.getElementById('importe') as HTMLInputElement).value;
        const pd = (document.getElementById('pd') as HTMLInputElement).value;
        const concepto = (document.getElementById('concept') as HTMLInputElement).value;
        const type = (document.getElementById('type') as HTMLInputElement).value;
        const quinini = (document.getElementById('quinini') as HTMLInputElement).value;
        const quinfin = (document.getElementById('quinfin') as HTMLInputElement).value;

        if (!category || !importe || !pd || !concepto || !type || !quinini || !quinfin) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }

        return {
          category,
          importe,
          pd,
          concepto,
          type,
          quinini,
          quinfin
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
    // console.log(data)
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
          <label style="margin-left:33px;" for="category">Categoria:</label>
          <input id="category" class="swal2-input" value="${data.category}" style="padding: 0px; font-size: 16px;">
        </div>

         <div style="display: flex; flex-direction: column; text-align: left;">
            <label style="margin-left:33px;" for="pd">Ingresa el pd: </label>
          <input id="pd" class="swal2-input" value="${data.pd}" style="padding: 0px; font-size: 16px;">
        </div>

         <div style="display: flex; flex-direction: column; text-align: left;">
          <label style="margin-left:33px;" for="concept">Clave del concepto: </label>
          <input id="concept" class="swal2-input" value="${data.concept}" style="padding: 0px; font-size: 16px;">
        </div>

         <div style="display: flex; flex-direction: column; text-align: left;">
          <label style="margin-left:33px;" for="importe">Importe: </label>
          <input id="importe" class="swal2-input" value="${data.importe}" style="padding: 0px; font-size: 16px;">
        </div>

         <div style="display: flex; flex-direction: column; text-align: left;">
          <label style="margin-left:33px;" for="type">Tipo: </label>
          <input id="type" class="swal2-input" value="${data.type}" style="padding: 0px; font-size: 16px;">
        </div>

           <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;" for="quinini">Quincena Inicio:</label>
        <input id="quinini" class="swal2-input" value="${data.quinini}" style="padding: 0px; font-size: 16px;">
      </div>

      <div style="display: flex; flex-direction: column; text-align: left;">
        <label style="margin-left:33px;" for="quinfin">Quincena Fin:</label>
        <input id="quinfin" class="swal2-input" value="${data.quinfin}" style="padding: 0px; font-size: 16px;">
      </div>
     `,

        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
          const category = (document.getElementById('category') as HTMLInputElement).value;
          const importe = (document.getElementById('importe') as HTMLInputElement).value;
          const pd = (document.getElementById('pd') as HTMLInputElement).value;
          const concepto = (document.getElementById('concept') as HTMLInputElement).value;
          const type = (document.getElementById('type') as HTMLInputElement).value;
          const quinini = (document.getElementById('quinini') as HTMLInputElement).value;
          const quinfin = (document.getElementById('quinfin') as HTMLInputElement).value;
          if (!category || !importe || !pd || !concepto || !type || !quinini || !quinfin) {
            Swal.showValidationMessage('Todos los campos son obligatorios');
            return false;
          }

          return {
            category,
            importe,
            pd,
            concepto,
            type,
            quinini,
            quinfin
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

      onDelete(catalogoId: any) {
        // console.log(catalogoId.id)
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
              this.NominaBecService.DeleteCatalog(catalogoId.id).subscribe(
                response => {
                  this.fetchData()
                  Swal.fire(
                    '¡Eliminada!',
                    'La categoria ha sido eliminada correctamente.',
                    'success'
                  );
                },
                error => {
                  Swal.fire(
                    'Error',
                    'No se pudo eliminar la categoria.',
                    'error'
                  );
                }
              );
            }
          });
        }


}

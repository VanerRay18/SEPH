import { Component } from '@angular/core';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { NominaBecService } from 'src/app/services/nomina-bec.service';
import { NominaA } from 'src/app/shared/interfaces/utils';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-becarios-r',
  templateUrl: './becarios-r.component.html',
  styleUrls: ['./becarios-r.component.css']
})
export class BecariosRComponent {
  searchTerm: string = '';
  headers = ['Nombre Completo', 'CURP', 'RFC', 'Clabe interbancaria', 'Plazas'];
  displayedColumns = ['nomemp', 'curp', 'rfc', 'CLABE'];
  data = [];
  nominaId: any;
  data2: NominaA | null = null;
  isLoading = true;


  constructor(

    private NominaBecService: NominaBecService,

  ) {
    // Registrar las fuentes necesarias
  }
  async ngOnInit(): Promise<void> {
    this.nominaId = await this.loadNominaId();
    this.fetchData();
    this.isLoading = true;
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

    this.NominaBecService.getBecarios().subscribe((response: ApiResponse) => {
      this.data = response.data; // Aquí concatenas las fechas
      this.isLoading = this.data.length === 0;
    },
      (error) => {
        console.error('Error al obtener los datos:', error);
      });


  }

  showDetails(srl_emp: any) {

    this.NominaBecService.getPlazaBecarios(srl_emp.SRL_EMP).subscribe((response) => {
      let items = response.data.map((item: any) => ({
        plaza: item.plaza,
        MOTIV: item.MOTIV,
        status: item.MOTIV === "22" ? "Activa" : item.MOTIV === "30" ? "Inactiva" : "Desconocido"
      }));


      let tableHtml = `
        <table class="table table-bordered">
          <thead>
            <tr>
              <th>Plazas</th>
              <th>Movimento</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item: any) => `
              <tr>
                <td>${item.plaza || 'N/A'}</td>
                <td>${item.MOTIV || 'N/A'}</td>
                <td>${item.status || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>`;

      Swal.fire({
        title: 'Plazas del becario',
        html: tableHtml,
        width: '600px',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#3085d6',
        backdrop: true,
      });
    });
  }

}

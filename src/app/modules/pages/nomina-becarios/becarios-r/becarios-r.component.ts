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
  headers = ['Nombre Completo', 'CURP', 'RFC', 'Plazas', 'Clabe interbancaria'];
  displayedColumns = ['nombre', 'curp', 'srl_emp', 'qna_opera', 'liquidTotal'];
  data = [];
  nominaId:any;
  data2: NominaA | null = null;


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

    this.NominaBecService.getInformationCalculation(this.nominaId).subscribe((response: ApiResponse) => {
      this.data = response.data; // Aquí concatenas las fechas
    },
      (error) => {
        console.error('Error al obtener los datos:', error);
      });


  }

}

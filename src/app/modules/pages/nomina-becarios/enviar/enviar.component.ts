import { Component } from '@angular/core';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { NominaBecService } from 'src/app/services/nomina-bec.service';

@Component({
  selector: 'app-enviar',
  templateUrl: './enviar.component.html',
  styleUrls: ['./enviar.component.css']
})
export class EnviarComponent {

  data = [];
  idNomina: any;

  constructor(
    private NominaBecService: NominaBecService
  ) {
    // Registrar las fuentes necesarias
  }


  ngOnInit(): void {
    this.fetchData();
  }


  fetchData() {
    this.NominaBecService.getInformationCalculation(this.idNomina).subscribe((response: ApiResponse) => {
      this.data = response.data; // Aquí concatenas las fechas
    },
      (error) => {
        console.error('Error al obtener los datos:', error);
      });
  }

}

import { Component, OnInit } from '@angular/core';
import { LicenciasService } from 'src/app/services/licencias-service/licencias.service';

@Component({
  selector: 'buscar-licencias',
  templateUrl: './buscar-licencias.component.html',
  styleUrls: ['./buscar-licencias.component.css']
})
export class BuscarLicenciasComponent implements OnInit {
  
  licencias: any[] = [];
  acuerdos: any[] = [];
  rfc: string = '';  // RFC ingresado por el usuario
  error: string | null = null;

  constructor(private licenciasService: LicenciasService) { }

  ngOnInit(): void {}

  // Método para buscar licencias y acuerdos basados en el RFC
  buscarLicenciasYAcuerdos(): void {
    this.error = null;
    
    // Obtener licencias médicas
    this.licenciasService.getLicencias(this.rfc).subscribe(
      (data) => {
        this.licencias = data;
        this.obtenerAcuerdos();
      },
      (err) => {
        this.error = 'Error obteniendo licencias: ' + err.message;
      }
    );
  }

  // Método para obtener acuerdos presidenciales
  obtenerAcuerdos(): void {
    this.licenciasService.getAcuerdosPresidenciales(this.rfc).subscribe(
      (data) => {
        this.acuerdos = data;
        this.compararFechas();
      },
      (err) => {
        this.error = 'Error obteniendo acuerdos: ' + err.message;
      }
    );
  }

  // Método para comparar fechas entre licencias y acuerdos
  compararFechas(): void {
    for (const acuerdo of this.acuerdos) {
      for (const licencia of this.licencias) {
        if (licencia.desde >= acuerdo.fec_ini && licencia.desde <= acuerdo.fec_fin) {
          console.log('Licencia válida entre acuerdo:', licencia, acuerdo);
          // Aquí podrías implementar lógica para actualizar el estado en la base de datos si es necesario
        }
      }
    }
  }
}
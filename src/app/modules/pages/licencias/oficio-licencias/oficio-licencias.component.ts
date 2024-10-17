import { Component } from '@angular/core';
import { LicenciasService } from 'src/app/services/licencias-service/licencias.service';
import { ApiResponse } from 'src/app/models/ApiResponse';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Oficio } from 'src/app/shared/interfaces/utils';
@Component({
  selector: 'app-oficio-licencias',
  templateUrl: './oficio-licencias.component.html',
  styleUrls: ['./oficio-licencias.component.css']
})
export class OficioLicenciasComponent {
  searchTerm: string = '';
  headers = ['No. de Oficio', 'Nombre', 'Rango de fechas', 'Total de oficios', 'Generar PDF'];
  displayedColumns = ['oficio', 'nombre', 'rango_fechas' , 'total_folios'];
  data = [];

  constructor(
    private LicenciasService: LicenciasService
  ) {
    // Registrar las fuentes necesarias
    (pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
  }

  ngOnInit(): void {
    this.fetchData();
  }



  fetchData() {
    this.LicenciasService.getLicenciasOficio().subscribe((response: ApiResponse) => {
      this.data = response.data.map((item: Oficio) => ({
        ...item,
        rango_fechas: `${item.fecha_primera_licencia} al ${item.fecha_ultima_licencia}`
      })); // Aquí concatenas las fechas
    },
    (error) => {
      console.error('Error al obtener los datos:', error);
    });
  }

 }

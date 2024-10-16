import { LicenciasService } from 'src/app/services/licencias-service/licencias.service';
import { Component, OnInit } from '@angular/core';
import { PdfService } from 'src/app/services/pdf-service.service';
import { ApiResponse } from 'src/app/models/ApiResponse';


@Component({
  selector: 'app-archivo-licencias',
  templateUrl: './archivo-licencias.component.html',
  styleUrls: ['./archivo-licencias.component.css']
})
export class ArchivoLicenciasComponent implements OnInit{
  searchTerm: string = '';
  headers = ['No.', 'Nombre', 'RFC', 'FI_PS', 'Nombraminetos definitivos', 'Licencias Medicas', 'Licencias Especiales'];
  displayedColumns = ['no', 'nombre', 'rfc', ' ', ' ', 'folio',' '];
  data: any [] = [];

  constructor(
    private pdfService: PdfService,
    private LicenciasService :LicenciasService
  ) {}


  ngOnInit(): void {
 this.fetchData();
  }



  fetchData() {
    this.LicenciasService.getLicenciasArchivo().subscribe((response: ApiResponse) =>
      { if (response && response.data && Array.isArray(response.data)) {
      // Asignar el número autoincrementable a cada fila
      this.data = response.data.map((item, index) => ({
        ...item,
        no: index + 1 // Añadir el número de fila autoincremental (inicia en 1)
      }));
      console.log(this.data); // Verificar la data con el campo 'no' agregado
    } else {
      console.error('La respuesta no contiene un array de datos.');
    }
  },
      (error) => {
        console.error('Error al obtener los datos:', error);
      }
    );
  }



  generatePdfLicencias() {
    this.pdfService.generatePdfFromElement('contentToPrint', 'licencias_medicas');
  }

  generatePdfFormato() {
    this.pdfService.generatePdfFromElement('contentToPrintFormato', 'formato_archivo');
  }

}

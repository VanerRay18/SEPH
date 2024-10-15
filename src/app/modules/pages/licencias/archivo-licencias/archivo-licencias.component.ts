import { Component } from '@angular/core';
import { PdfService } from 'src/app/services/pdf-service.service';

@Component({
  selector: 'app-archivo-licencias',
  templateUrl: './archivo-licencias.component.html',
  styleUrls: ['./archivo-licencias.component.css']
})
export class ArchivoLicenciasComponent {
  searchTerm: string = '';
  headers = ['No.', 'Nombre', 'RFC', 'FI_PS', 'Nombraminetos definitivos', 'Licencias Medicas', 'Licencias Especiales'];
  displayedColumns = ['folio', 'desde', 'hasta', 'total_dias', 'status', 'oficio'];
  data = [];

  constructor(private pdfService: PdfService) {}

  generatePdfLicencias() {
    this.pdfService.generatePdfFromElement('contentToPrint', 'licencias_medicas');
  }

  generatePdfFormato() {
    this.pdfService.generatePdfFromElement('contentToPrintFormato', 'formato_archivo');
  }

}

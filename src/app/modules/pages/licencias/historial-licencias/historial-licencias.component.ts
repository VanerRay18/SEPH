import { Component,  OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { HistorialLicenciasService } from 'src/app/services/licencias-service/historial-licencias.service'; 

@Component({
  selector: 'historial-licencias',
  templateUrl: './historial-licencias.component.html',
  styleUrls: ['./historial-licencias.component.css']
})
export class HistorialLicenciasComponent implements OnInit{
  
  historial: any[] = [];
  rfc: string = ''; // RFC proporcionado

  constructor(private historialService: HistorialLicenciasService) { }

  ngOnInit(): void {
    // Llamar al servicio para obtener el historial
    this.obtenerHistorial();
  }

  obtenerHistorial(): void {
    this.historialService.getHistorialPersonal(this.rfc).subscribe(response => {
      this.historial = response.historial;
    });
  }

  generarPDF(): void {
    const DATA = document.getElementById('historialPDF'); // Elemento HTML que contiene el historial
    if (DATA) {
      html2canvas(DATA).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('historial_licencias.pdf');
      });
    }
  }
}

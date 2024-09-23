import { Component } from '@angular/core';
import { HistorialService } from 'src/app/services/licencias-service/historial.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css']
})
export class HistorialComponent {
  rfc: string = '';
  tipo: string = 'licencias'; // Tipo actual de historial
  historial: any[] = [];
  nuevoRegistro: any = {};

  constructor(private historialService: HistorialService) {}

  mostrarHistorial(): void {
    if (this.rfc) {
      this.historialService.getHistorial(this.rfc, this.tipo).subscribe((data) => {
        if (!data.error) {
          this.historial = data[this.tipo]; // Datos específicos del tipo
        } else {
          Swal.fire('', data.error, 'error');
        }
      });
    } else {
      Swal.fire('', 'Necesitas seleccionar un RFC', 'warning');
    }
  }

  guardarRegistro(): void {
    if (this.rfc && this.camposValidos()) {
      const data = { rfc: this.rfc, ...this.nuevoRegistro };
      this.historialService.setRegistro(this.tipo, data).subscribe((data) => {
        if (!data.error) {
          Swal.fire('', `El ${this.tipo} se guardó exitosamente`, 'success');
          this.mostrarHistorial();
          this.nuevoRegistro = {}; // Limpiar el formulario
        } else {
          Swal.fire('', data.error, 'error');
        }
      });
    } else {
      Swal.fire('', 'Todos los campos son obligatorios', 'warning');
    }
  }

  camposValidos(): boolean {
    if (this.tipo === 'licencias') {
      return this.nuevoRegistro.folio && this.nuevoRegistro.fecha_inicio && this.nuevoRegistro.fecha_termino;
    }
    if (this.tipo === 'accidentes') {
      return this.nuevoRegistro.fecha_inicio && this.nuevoRegistro.fecha_termino;
    }
    return false; // Para futuros casos, agregar más validaciones aquí
  }
}
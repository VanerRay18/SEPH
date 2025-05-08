import { Component } from '@angular/core';
import { Persona } from 'src/app/shared/interfaces/utils';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-registros-personas',
  templateUrl: './registros-personas.component.html',
  styleUrls: ['./registros-personas.component.css']
})
export class RegistrosPersonasComponent {
  tabs = [
    { id: 'Personas', title: 'Personas', icon: 'fa-solid fa-person' },
    { id: 'Terceros', title: 'Terceros', icon: 'fa-solid fa-building' }
  ];
  personas = [
    { nombre: 'Juan Perez Sanchez', usado: 80, liquido: 100 },
    { nombre: 'Juan Perez Sanchez', usado: 90, liquido: 100 },
    { nombre: 'Juan Perez Sanchez', usado: 10, liquido: 100 },
    { nombre: 'Juan Perez Sanchez', usado: 75, liquido: 100 },
    { nombre: 'Juan Perez Sanchez', usado: 95, liquido: 100 },
    { nombre: 'Juan Perez Sanchez', usado: 100, liquido: 100 },
    { nombre: 'Juan Perez Sanchez', usado: 45, liquido: 100 },
    { nombre: 'Juan Perez Sanchez', usado: 88, liquido: 100 },
    { nombre: 'Juan Perez Sanchez', usado: 66, liquido: 100 },
  ];


  activeTab: string = 'Personas';

    constructor(

    ) {

    }

    get restante() {
      return (persona: any) => persona.liquido - persona.usado;
    }

  setActiveTab(tabId: string) {
    this.activeTab = tabId; // Cambia la pestaña activa
  }

  mostrarDetalle(persona: any) {
    const restante = persona.liquido - persona.usado;
    const porcentaje = ((persona.usado / persona.liquido) * 100).toFixed(0);

    Swal.fire({
      title: `<h2 style="font-weight: bold; margin-bottom: 20px;">${persona.nombre}</h2>`,
      html: `
        <div style="text-align: center;">
          <!-- Barra principal -->
          <div style="display: flex; justify-content: space-around; margin-bottom: 10px; font-size: 12px;">
            <div>Usado</div>
            <div>Líquido</div>
            <div>Restante</div>
          </div>
          <div style="display: flex; justify-content: space-around; margin-bottom: 20px; font-weight: bold;">
            <div>${persona.usado}</div>
            <div>${persona.liquido}</div>
            <div>${restante}</div>
          </div>
          <div style="height: 20px; background: #ddd; border-radius: 10px; overflow: hidden; margin-bottom: 20px;">
            <div style="width: ${porcentaje}%; background: #621132; height: 100%;"></div>
          </div>

          <!-- Tabla de terceros -->
          <div style="text-align: left;">
            <p style="margin: 10px 0;"><strong>Terceros a los que está inscrito</strong> &nbsp;&nbsp;&nbsp;&nbsp; <strong style="float: right;">Total: 5</strong></p>
            ${this.generarTercerosHTML()}
          </div>
        </div>
      `,
      width: 700,
      showConfirmButton: false,
      showCloseButton: true,
      customClass: {
        popup: 'swal-wide'
      }
    });
  }

  generarTercerosHTML(): string {
    const terceros = [
      { nombre: 'ISSTE', deuda: 200000, abonado: 40000, quincena: '2Q 05/08', abonos: 1 },
      { nombre: 'ISSTE', deuda: 200000, abonado: 120000, quincena: '2Q 05/08', abonos: 3 },
      { nombre: 'ISSTE', deuda: 200000, abonado: 160000, quincena: '2Q 05/08', abonos: 4 },
      { nombre: 'ISSTE', deuda: 200000, abonado: 60000, quincena: '2Q 05/08', abonos: 1 },
      { nombre: 'ISSTE', deuda: 200000, abonado: 40000, quincena: '2Q 05/08', abonos: 1 }
    ];

    return terceros.map(t => {
      const porcentaje = ((t.abonado / t.deuda) * 100).toFixed(0);
      const color =
        +porcentaje > 80 ? '#0FA958' :
        +porcentaje > 50 ? '#FF6C11' : '#DC3E3E';


      return `
        <div style="margin-bottom: 15px;">
          <strong>${t.nombre}</strong><br>
          <small>Quincena de término: ${t.quincena}</small>
          <div style="height: 10px; background: #ddd; border-radius: 5px; overflow: hidden; margin: 4px 0;">
            <div style="width: ${porcentaje}%; background: ${color}; height: 100%;"></div>
          </div>
          <div style="font-size: 12px;">
            Total de la deuda: <strong>$${t.deuda.toLocaleString()}</strong> &nbsp;&nbsp;
            Abonado: <strong style="color: green;">$${t.abonado.toLocaleString()}</strong> &nbsp;&nbsp;
            <span style="float: right;">Abonos: ${t.abonos}</span>
          </div>
        </div>
      `;
    }).join('');
  }

}

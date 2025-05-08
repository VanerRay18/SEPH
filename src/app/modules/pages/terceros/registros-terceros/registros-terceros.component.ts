import { Component } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registros-terceros',
  templateUrl: './registros-terceros.component.html',
  styleUrls: ['./registros-terceros.component.css']
})
export class RegistrosTercerosComponent {
  tabs = [
    { id: 'Personas', title: 'Personas', icon: 'fa-solid fa-person' },
    { id: 'Terceros', title: 'Terceros', icon: 'fa-solid fa-building' }
  ];
  personas = [
    { nombre: 'ISSSTE', usado: 800, liquido: 1000 },
    { nombre: 'FORTE', usado: 900, liquido: 1000 },
    { nombre: 'FAMSA', usado: 100, liquido: 1000 },
    { nombre: 'CAJA DE AHORRO', usado: 750, liquido: 1000 },
    { nombre: 'SNTE', usado: 950, liquido: 1000 },
    { nombre: 'FOVISSSTE', usado: 1000, liquido: 1000 },
    { nombre: 'PRESTAMO NOMINA', usado: 450, liquido: 1000 },
    { nombre: 'AUTOSNTE', usado: 880, liquido: 1000 },
    { nombre: 'SUBURBIA', usado: 660, liquido: 1000 },
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

  mostrarDetalleTercero(nombreTercero: string) {
    const tercero = this.personas.find(p => p.nombre === nombreTercero);
    if (!tercero) return;

    const porcentajeTotal = ((tercero.usado / tercero.liquido) * 100).toFixed(0);
    const registrados = tercero.usado;

    // Datos simulados de personas asociadas
    const personasAsociadas = [
      {
        nombre: 'Juan Perez Sanchez',
        quincena: '200508',
        deuda: 2000,
        abonado: 400
      },
      {
        nombre: 'Maria Gomez Ramirez',
        quincena: '200509',
        deuda: 3000,
        abonado: 1000
      },
      {
        nombre: 'Luis Hernandez Torres',
        quincena: '200510',
        deuda: 1500,
        abonado: 750
      }
    ];

    const total = personasAsociadas.length;

    Swal.fire({
      title: `<div style="font-size: 24px; font-weight: bold;">${nombreTercero}</div>`,
      html: `
        <div style="text-align: center;">
          <!-- Barra total -->
          <div style="margin: 10px 0; height: 10px; background: #eee; border-radius: 5px; overflow: hidden; width: 60%; margin-left: auto; margin-right: auto;">
            <div style="width: ${porcentajeTotal}%; background: #621132; height: 100%;"></div>
          </div>
          <div style="font-size: 13px; margin-bottom: 20px;">Personas registradas: ${registrados}</div>

          <!-- Título -->
          <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 10px;">
            <div style="text-align: left;">Personas registradas en el tercero</div>
            <div>Total: ${total}</div>
          </div>

          <!-- Lista -->
          <div style="text-align: left;">
            ${personasAsociadas.map(p => {
              const porcentaje = ((p.abonado / p.deuda) * 100).toFixed(0);
              return `
                <div style="margin-bottom: 15px;">
                  <div style="font-weight: bold;">${p.nombre}</div>
                  <div style="height: 8px; background: #eee; border-radius: 4px; overflow: hidden; margin: 3px 0;">
                    <div style="width: ${porcentaje}%; background: #621132; height: 100%;"></div>
                  </div>
                  <div style="font-size: 12px;">
                    Quincena de término: ${p.quincena} &nbsp;&nbsp;
                    Total de la deuda: $${p.deuda.toFixed(2)} &nbsp;&nbsp;
                    Abonado: $${p.abonado.toFixed(2)} &nbsp;&nbsp;
                    ${porcentaje}%
                  </div>
                </div>
              `;
            }).join('')}
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

}

import { Terceros } from './../../../../shared/interfaces/utils';
import { Component } from '@angular/core';
import { PhpTercerosService } from 'src/app/services/php-terceros.service';
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
  // personas = [
  //   { nombre: 'Juan Perez Sanchez', usado: 80, liquido: 100 },
  //   { nombre: 'Juan Perez Sanchez', usado: 90, liquido: 100 },
  //   { nombre: 'Juan Perez Sanchez', usado: 10, liquido: 100 },
  //   { nombre: 'Juan Perez Sanchez', usado: 75, liquido: 100 },
  //   { nombre: 'Juan Perez Sanchez', usado: 95, liquido: 100 },
  //   { nombre: 'Juan Perez Sanchez', usado: 100, liquido: 100 },
  //   { nombre: 'Juan Perez Sanchez', usado: 45, liquido: 100 },
  //   { nombre: 'Juan Perez Sanchez', usado: 88, liquido: 100 },
  //   { nombre: 'Juan Perez Sanchez', usado: 66, liquido: 100 },
  // ];
  personas: Persona[] = [];
  servicio: any;
  activeTab: string = 'Personas';
  page: number = 0;
  size: number = 14;
  total: number = 0;
  isLoading: boolean = true;
  terceros: any[] = [];

  constructor(
    private phpTercerosService: PhpTercerosService
  ) {

  }

  ngOnInit(): void {
    this.fetchData(this.page, this.size);
  }

  cambiarPagina(pagina: number) {
    this.page = pagina;
    this.fetchData(this.page, this.size);
  }

  fetchData(page: number, size: number) {
    this.isLoading = true;
    this.servicio = 'get_pagos_terceros';
    this.phpTercerosService.getPeople(this.servicio, page, size).subscribe((response: any) => {
      if (response && response.data) {
        console.log('Personas fetched successfully:', response);
        this.isLoading = false;
        this.personas = response.data.map((persona: any) => ({
          nombre: persona.nombre,
          usado: persona.quincena_deducciones_terceros,
          liquido: persona.quincena_total_bruto,
          restante: persona.quincena_restante,
          tercero: persona.historico_terceros || [] // Asegúrate de que 'tercero' esté definido
        }));
         console.log('Personas:', this.personas);
        this.total = response.total_docentes ; // Asegúrate de que 'total' esté definido
        console.log('Total de personas:', this.total);
      } else {
        this.isLoading = false;
        console.error('No data found in response');
      }
    }, error => {
      this.isLoading = false;
      console.error('Error fetching personas:', error);
    });
  }

  get restante() {
    return (persona: any) => persona.liquido - persona.usado;
  }

  setActiveTab(tabId: string) {
    this.activeTab = tabId; // Cambia la pestaña activa
  }

  mostrarDetalle(persona: any) {
    const restante = persona.restante;
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
            ${this.generarTercerosHTML(persona)}
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

  generarTercerosHTML(persona: any): string {
    console.log('Persona:', persona);
    const terceros = persona.tercero || [];
    console.log('Terceros:', terceros);

    return terceros.map((t: {
      cantidad_pagos_pendientes: any;
      cantidad_pagos_totales: any;
      cantidad_pagos_realizados: any;
      quincena_final: any; total_tercero: number; deuda: number; name: any; quincena: any; cantidad_pagos: { toLocaleString: () => any; quincena_final: any; };
}) => {
      const porcentaje = ((t.total_tercero / t.deuda) * 100).toFixed(0);
      const color =
        +porcentaje > 80 ? '#0FA958' :
          +porcentaje > 50 ? '#FF6C11' : '#DC3E3E';


      return `
        <div style="margin-bottom: 15px;">
          <strong>${t.name}</strong><br>
          <small>Quincena de término: ${t.quincena_final}</small>
          <div style="height: 10px; background: #ddd; border-radius: 5px; overflow: hidden; margin: 4px 0;">
            <div style="width: ${porcentaje}%; background: ${color}; height: 100%;"></div>
          </div>
          <div style="font-size: 12px;">
            Total de pagos a realizar: <strong>${t.cantidad_pagos_totales}</strong> &nbsp;&nbsp;
            Total de pagos pendientes: <strong>${t.cantidad_pagos_pendientes}</strong> &nbsp;&nbsp;
            Abonado: <strong style="color: green;">$${t.total_tercero}</strong> &nbsp;&nbsp;
            <span style="float: right;">Abonos: ${t.cantidad_pagos_realizados}</span>
          </div>
        </div>
      `;
    }).join('');
  }

}

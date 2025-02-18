

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { NominaBecService } from 'src/app/services/nomina-bec.service';
import { NominaA } from 'src/app/shared/interfaces/utils';
import { NominaP } from 'src/app/shared/interfaces/utils';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pagar',
  templateUrl: './pagar.component.html',
  styleUrls: ['./pagar.component.css']
})
export class PagarComponent {
searchTerm: string = '';
  headers = ['Nombre', 'RFC','CURP', 'Clave', 'Total', 'Pago por transferencia'];
  displayedColumns = ['nombre', 'RFC','curp','clabeBanco', 'importTotal'];
  data = [];
  data2: NominaA | null = null;
  status = 2;
  clabes: any[] = [];
  nominaId :any;
  isLoading = true;
  changePay: Array<{ clabe: number; srl_emp: string; nominaId: any }> = []; // Array para almacenar los cambios

  constructor(
    private NominaBecService: NominaBecService,
    private router: Router,
  ) {
    // Registrar las fuentes necesarias
  }

  async ngOnInit(): Promise<void> {
    this.nominaId = await this.loadNominaId();
    this.fetchData();
    this.isLoading =true;
  }

  async loadNominaId() {
    const nominaId = await this.NominaBecService.getNominaId();
    return nominaId
  }


  fetchData() {
    this.NominaBecService.getNomina().subscribe((response: ApiResponse) => {
      this.data2 = response.data;
      this.NominaBecService.getClaves(this.nominaId).subscribe((response: ApiResponse) => {
        this.data = response.data.map((item: NominaP) => ({
          ...item,
          activo: item.clabe ? 1 : 0,        // Pago por transferencia activo si clabe es true
        }));
        this.isLoading = this.data.length === 0;
      },
        (error) => {
          console.error('Error al obtener los datos:', error);
        });
    },
      (error) => {
        console.error('Error al obtener los datos:', error);
      });

  }


  saveNomina(event:any): void {
            console.log(this.status, this.nominaId)
            this.NominaBecService.changeStatus(this.nominaId,this.status).subscribe(
              response => {
               console.log('Se cambio el status');
               this.fetchData();
              },
              error => {
                Swal.fire({
                  title: 'Error',
                  text: error.error.message,
                  icon: 'error',
                  confirmButtonText: 'Aceptar'
                });
              }
            );
            this.saveChanges();

      }


    continueNomina(): void{
      this.router.navigate(['/pages/NominaBecarios/Nominas-Revision']);
      this.fetchData();
    }

    toggleCheckbox(row: any): void {

      // Alternar el estado del checkbox
      row.activo = row.clabe

    }

    saveChanges(): void {
      this.NominaBecService.changeClave(this.clabes).subscribe(
        (response) => {
          this.fetchData();
          console.log('Respuesta del backend:', response);
          Swal.fire({
            title: 'Éxito',
            text: 'Los cambios se han guardado correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
          });

          // Limpiar el array `changePay` después de guardar los cambios
          this.changePay = [];
        },
        (error) => {
          console.error('Error al guardar los cambios:', error);
          Swal.fire({
            title: 'Error',
            text: 'No se pudieron guardar los cambios. Inténtelo nuevamente.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        }
      );
    }
}

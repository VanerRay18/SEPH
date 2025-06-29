import { Component } from '@angular/core';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { TercerosService } from './../../../../services/terceros.service';
import { NominaA } from 'src/app/shared/interfaces/utils';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { PermisosUserService } from 'src/app/services/permisos-user.service';
import { FileTransferService } from 'src/app/services/file-transfer.service';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-descuentos',
  templateUrl: './descuentos.component.html',
  styleUrls: ['./descuentos.component.css']
})
export class DescuentosComponent {
searchTerm: string = '';
  data: NominaA | null = null;
  zipFiles: File | null = null; // Nuevo arreglo para los archivos ZIP
  nominaId: any;
  crearlayout:any;
  eliminar: boolean = false;
  agregar: boolean = false;
  modificar: boolean = false;
  autorizar: boolean = false;
  files: File[] = [];
  status = 1;
  users: any;
  ilimitado: string = 'false';
  file: File[] = [];
  layoutCorregido = [];
  info: any[] = [];
  institucionales: any[] = [];
  noInstitucionales: any[] = [];
  terceroTotalId : any;


  constructor(
    private router: Router,
    private TercerosService: TercerosService,
    private PermisosUserService: PermisosUserService,
    private FileTransferService: FileTransferService,
  ) {
    // Registrar las fuentes necesarias
  }

  async ngOnInit():  Promise<void>  {

    // this.nominaId = await this.loadNominaId();
    this.fetchData();
    this.PermisosUserService.getPermisosSpring(this.PermisosUserService.getPermisos().NominasB).subscribe((response: ApiResponse) => {
      this.eliminar = response.data.eliminar
      this.modificar = response.data.editar
      this.agregar = response.data.agregar
      this.autorizar = response.data.autorizar
    });

    this.crearlayout = 0 ;
    // console.log(this.data?.status)

  }


  // async loadNominaId() {
  //   const nominaId = await this.NominaBecService.getNominaId();
  //   return nominaId
  // }

  fetchData() {
    const userId = localStorage.getItem('userId')!;
    this.TercerosService.getInformation(userId).subscribe(
      (response: ApiResponse) => {
        // console.log('Datos obtenidos:', response.data);
        this.info = response.data;
        this.institucionales = this.info.filter(t => t.ilimitado);
        this.noInstitucionales = this.info.filter(t => !t.ilimitado);
      },
      (error) => {
        console.error('Ocurrió un error', error);
      }
    );
  }

  verDetalle(id: number, added: boolean): void {
    this.FileTransferService.setIdTercero(id);
    console.log('ID del tercero seleccionado:', id);
    if (added === true) {
      this.router.navigate(['/pages/Terceros/Crear-Layout']);
    } else {
    this.router.navigate(['/pages/Terceros/Validar']);
    }
  }


  startNomina(): void {
    let status = this.status;
    switch (status) {
      case 0:
        this.router.navigate(['/pages/Terceros/Crear-Layout']);
        break;

      case 1:
        this.router.navigate(['/pages/Terceros/Validar']);
        break;

      case 2:
        this.router.navigate(['/pages/Terceros/Reporte-Validacion']);
        break;

      case 3:
        Swal.fire({
          title: 'Error',
          text: `El tercero ya a sido finalizado`,
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        break;

      default:
        break;

    }


  }

}

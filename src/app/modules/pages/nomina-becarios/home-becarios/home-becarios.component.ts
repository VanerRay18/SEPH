import { Component } from '@angular/core';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { NominaBecService } from 'src/app/services/nomina-bec.service';
import { NominaA } from 'src/app/shared/interfaces/utils';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { catchError, interval, of, pipe, startWith, Subscription, switchMap } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { NotificacionERP } from 'src/app/shared/interfaces/utils';
import { ChangeDetectorRef, NgZone } from '@angular/core';
import { PermisosUserService } from 'src/app/services/permisos-user.service';

@Component({
  selector: 'app-home-becarios',
  templateUrl: './home-becarios.component.html',
  styleUrls: ['./home-becarios.component.css']
})
export class HomeBecariosComponent {
  searchTerm: string = '';
  data: NominaA | null = null;
  showNotifications = false; // Controla la visibilidad de las notificaciones
  notificationCount = 1; // Número de notificaciones no leídas
  notifications: NotificacionERP[] = []; // Inicializamos como un array vacío
  numNoti: any = 0;

  eliminar: boolean = false;
  agregar: boolean = false;
  modificar: boolean = false;
  autorizar: boolean = false;

  // Alternar la visibilidad de las notificaciones
  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }


  constructor(
    private router: Router,
    private NominaBecService: NominaBecService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private PermisosUserService: PermisosUserService
  ) {
    // Registrar las fuentes necesarias
  }

  ngOnInit(): void {
    this.fetchData();

    this.PermisosUserService.getPermisosSpring(this.PermisosUserService.getPermisos().NominasB).subscribe((response: ApiResponse) => {
      this.eliminar = response.data.eliminar
      this.modificar = response.data.editar
      this.agregar = response.data.agregar
      this.autorizar = response.data.autorizar
    });

  }

  fetchData() {
    this.NominaBecService.getNomina().subscribe((response: ApiResponse) => {
      this.data = response.data;
    },
      (error) => {
        console.error('Error al obtener los datos:', error);
      });

    interval(15000)
      .pipe(
        startWith(0),
        switchMap(() => {
          const userId = localStorage.getItem('userId');
          return this.authService.getNotifications(userId).pipe(
            catchError((error) => {
              console.error('Error al obtener notificaciones:', error);
              return of(null); // Retorna un valor vacío para no detener el intervalo
            })
          );
        })
      )
      .subscribe((response) => {
        if (response && response.data) {
          this.notifications = response.data.map((noti: any) => ({
            ...noti,
            timeAgo: this.calculateTimeAgo(noti.fecha),
          }));
          this.numNoti = response.message ?? 0;
          this.cdr.detectChanges();
        }
      });


  }

  calculateTimeAgo(fecha: string): string {
    const diff = Math.floor((Date.now() - new Date(fecha).getTime()) / 1000);
    if (diff < 60) return 'Hace unos segundos';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    return `Hace ${Math.floor(diff / 86400)} días`;
  }

  autorizateN(): void{
    let status = this.data?.status;
    if( status !== 3){
      Swal.fire({
        title: 'Nomina no lista para autorizar',
        text: `Esta nomina aun no se encuetra lista para autorizar`,
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }else{
      this.router.navigate(['/pages/NominaBecarios/Nominas-Revision']);
    }
  }

  startNomina(): void {
    let status = this.data?.status;
    switch (status) {
      case 0:
        Swal.fire({
          title: 'Confirmar',
          html: `¿Está seguro de que desea iniciar la nomina con ${this.data?.becarios} becarios?<br><br>`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, Continuar',
          cancelButtonText: 'No, cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            // El usuario confirmó, proceder a enviar los datos

            this.router.navigate(['/pages/NominaBecarios/Nominas-Calcular']);

          }
        });
        break;

      case 1:
        Swal.fire({
          title: 'Confirmar',
          html: `Tienes una nomina activa que se esta calculando ¿Deseas continuar el proceso actual?<br><br>`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, Continuar',
          cancelButtonText: 'No, cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            // El usuario confirmó, proceder a enviar los datos

            this.router.navigate(['/pages/NominaBecarios/Nominas-Calcular']);

          }
        });
        break;

      case 2:
        Swal.fire({
          title: 'Confirmar',
          html: `Tienes una nomina activa que se esta procesando ¿Deseas continuar el proceso actual?<br><br>`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, Continuar',
          cancelButtonText: 'No, cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            // El usuario confirmó, proceder a enviar los datos

            this.router.navigate(['/pages/NominaBecarios/Nominas-Pagar']);

          }
        });
        break;

      case 3:
        Swal.fire({
          title: 'Confirmar',
          html: `Tienes una nomina activa que se esta en revision ¿Deseas continuar el proceso actual?<br><br>`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, Continuar',
          cancelButtonText: 'No, cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            // El usuario confirmó, proceder a enviar los datos

            this.router.navigate(['/pages/NominaBecarios/Nominas-Revision']);

          }
        });
        break;

      case 4:
        Swal.fire({
          title: 'Confirmar',
          html: `Tienes una nomina activa que se esta apunto de enviar ¿Deseas continuar el proceso actual?<br><br>`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, Continuar',
          cancelButtonText: 'No, cancelar'
        }).then((result) => {
          if (result.isConfirmed) {
            // El usuario confirmó, proceder a enviar los datos

            this.router.navigate(['/pages/NominaBecarios/Nominas-Enviar']);

          }
        });
        break;

      case 5:
        Swal.fire({
          title: 'Error',
          text: `Esta nomina ya ha sido terminada y enviada `,
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
        break;

      default:
        break;
    }


  }
}

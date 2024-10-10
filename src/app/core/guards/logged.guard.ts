import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, RouterStateSnapshot, UrlSegment, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { Module } from 'src/app/shared/interfaces/utils';
import { ApiResponse } from 'src/app/models/ApiResponse';

@Injectable({
  providedIn: 'root'
})
export class LoggedGuard implements CanActivate, CanLoad {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot):
    Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      const token = localStorage.getItem('token'); // Obtener el token del localStorage
      const rolId = localStorage.getItem('rolId'); // Obtener el rolId del localStorage

      if (!token || !rolId) {
        console.error('El token o rolId no están definidos. Verifica el login y el almacenamiento local.');
        this.router.navigate(['/login']);
        return false; // Redirigir si no hay token o rolId
      }

      // Obtener el módulo solicitado
    const requestedModule = route.routeConfig?.path;

    return new Promise<boolean>((resolve, reject) => {
      this.authService.getModulesByRole(rolId).subscribe(
        (response: ApiResponse) => {
          if (response.success) {
            const allowedModules: Module[] = response.data; // Módulos permitidos

            // Verificar si el módulo solicitado está en los módulos permitidos
            const hasAccess = allowedModules.some((module: Module)  => {
              return requestedModule && requestedModule.includes(module.config);
            });

            if (hasAccess) {
              resolve(true); // Permitir el acceso
            } else {
              console.warn('Acceso denegado a la ruta:', requestedModule);
              this.router.navigate(['/login']); // Redirigir si no tiene acceso
              resolve(false);
            }
          } else {
            console.error('Error al obtener los módulos:', response.message);
            this.router.navigate(['/login']);
            resolve(false);
          }
        },
        (error) => {
          console.error('Error en la solicitud:', error);
          this.router.navigate(['/login']);
          resolve(false);
        }
      );
    });
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }
}

import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

interface navItems {
  id: number;
  name: string;
  config: { angularComponentPath: string, externalUrl?: string };
  children: navItems[];
}

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  // menuItems: MenuItem[] = [];
  currentRoute: string = '';
  subs: Subscription[] = [];
  navItems: navItems[] = [];

  constructor(private router: Router,
              private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentRoute = this.router.url;
    this.getCurrentRoute();

    // Aquí cargamos los módulos basados en el servicio de roles
    this.compareRolesAndModules();
  }

  getCurrentRoute() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  // loadMenuBasedOnRoles() {
  //   // Esta función debe obtener los módulos basados en los roles del usuario
  //   const userRoles = this.getUserRoles();
    
  //   // Aquí iría la lógica para cargar módulos específicos según los roles
  //   if (userRoles.includes('admin')) {
  //     this.menuItems = [
  //       { id: 1, name: { en: 'Perfil' }, config: { angularComponentPath: './modules/pages/perfil/perfil.component' }, children: [] },
  //       { id: 2, name: { en: 'Usuarios' }, config: { angularComponentPath: '/users' }, children: [] },
  //       {
  //         id: 3, name: { en: 'Configuración' }, config: { angularComponentPath: '' }, children: [
  //           { id: 4, name: { en: 'Perfil' }, config: { angularComponentPath: '/profile' }, children: [] },
  //           { id: 5, name: { en: 'Preferencias' }, config: { angularComponentPath: '/preferences' }, children: [] }
  //         ]
  //       }
  //     ];
  //   } else if (userRoles.includes('user')) {
  //     this.menuItems = [
  //       { id: 1, name: { en: 'Inicio' }, config: { angularComponentPath: '/user-dashboard' }, children: [] },
  //       { id: 2, name: { en: 'Licencias' }, config: { angularComponentPath: '/licencias' }, children: [] }
  //     ];
  //   } else {
  //     // Menú por defecto
  //     this.menuItems = [
  //       { id: 1, name: { en: 'Inicio' }, config: { angularComponentPath: '/' }, children: [] }
  //     ];
  //   }
  // }

  // getUserRoles() {
  //   // Este método debe obtener los roles del usuario, ya sea desde un servicio o almacenamiento local
  //   return ['user']; // Por ejemplo
  // }

  compareRolesAndModules(): void {
    // Llamadas a los endpoints
    const userCredentials$ = this.authService.GetCredentialsByUser();
    const allRoles$ = this.authService.getRoles();
    const allModules$ = this.authService.getModules();
  
    forkJoin([userCredentials$, allRoles$, allModules$]).subscribe(
      ([userCredentialsResponse, allRolesResponse, allModulesResponse]) => {
        // Extraer los datos de las respuestas
        const userModules = userCredentialsResponse.data.modulos; // Módulos del usuario
        const userRoleId = userCredentialsResponse.data.roleId;   // Rol del usuario
  
        const allRoles = allRolesResponse.data;  // Todos los roles
        const allModules = allModulesResponse.data;  // Todos los módulos
  
        // Verificar si el rol del usuario es válido
        const validRole = allRoles.some((role: any) => role.id === userRoleId);
  
        if (validRole) {
          // Filtrar los módulos que corresponden al rol del usuario
          const validModules = allModules.filter((module: any) => {
            return userModules.includes(module.id) && module.roleId === userRoleId;
          });
  
          // Construir la navegación si hay módulos válidos
          if (validModules.length > 0) {
            this.buildNavigation([userRoleId], validModules);
          } else {
            Swal.fire('error', 'No tienes módulos asignados para este rol.');
          }
        } else {
          Swal.fire('error', 'Rol no válido.');
        }
      },
      (error) => {
        console.error('Error al obtener datos', error);
        Swal.fire('error', 'Error al obtener la información del servidor.');
      }
    );
  }
  
  
  // Función para comparar los roles del usuario con los roles del sistema
  compareRoles(userRoles: any[], allRoles: any[]): any[] {
    return userRoles.filter((userRole) => 
      allRoles.some((role) => role.id === userRole.id)
    );
  }
  
  // Función para comparar los módulos del usuario con los módulos disponibles
  compareModules(userModules: any[], allModules: any[]): any[] {
    return userModules.filter((userModule) => 
      allModules.some((module) => module.id === userModule.id)
    );
  }
  
  buildNavigation(roles: any[], modules: any[]): void {
    // Inicializa el array del menú vacío
    this.navItems = [];
  
    // Iterar sobre los módulos disponibles para el usuario
    modules.forEach((module) => {
      // Verificar si el módulo es válido para los roles actuales
      if (this.isModuleAllowedForRoles(module, roles)) {
        // Construir el item del menú con la ruta correspondiente
        this.navItems.push({ 
          id: module.id,
          name: module.name,
          config: { angularComponentPath: module.config}, // Ruta a la que se redirige
          children: [],
        });
      }
    });
  }
  
  // Función auxiliar para verificar si un módulo está permitido para los roles del usuario
  isModuleAllowedForRoles(module: any, roles: any[]): boolean {
    return roles.some((role) => role.permissions.includes(module.id));
  }
  
  

}
function swalCrmAlert(arg0: string, arg1: string) {
  throw new Error('Function not implemented.');
}


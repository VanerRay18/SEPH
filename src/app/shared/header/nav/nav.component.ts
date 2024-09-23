import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

interface MenuItem {
  id: number;
  name: { en: string, es?: string };
  config: { angularComponentPath: string, externalUrl?: string };
  children: MenuItem[];
}

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  menuItems: MenuItem[] = [];
  currentRoute: string = '';
  subs: Subscription[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.currentRoute = this.router.url;
    this.getCurrentRoute();

    // Aquí cargamos los módulos basados en el servicio de roles
    this.loadMenuBasedOnRoles();
  }

  getCurrentRoute() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  loadMenuBasedOnRoles() {
    // Esta función debe obtener los módulos basados en los roles del usuario
    const userRoles = this.getUserRoles();
    
    // Aquí iría la lógica para cargar módulos específicos según los roles
    if (userRoles.includes('admin')) {
      this.menuItems = [
        { id: 1, name: { en: 'Perfil' }, config: { angularComponentPath: './modules/pages/perfil/perfil.component' }, children: [] },
        { id: 2, name: { en: 'Usuarios' }, config: { angularComponentPath: '/users' }, children: [] },
        {
          id: 3, name: { en: 'Configuración' }, config: { angularComponentPath: '' }, children: [
            { id: 4, name: { en: 'Perfil' }, config: { angularComponentPath: '/profile' }, children: [] },
            { id: 5, name: { en: 'Preferencias' }, config: { angularComponentPath: '/preferences' }, children: [] }
          ]
        }
      ];
    } else if (userRoles.includes('user')) {
      this.menuItems = [
        { id: 1, name: { en: 'Inicio' }, config: { angularComponentPath: '/user-dashboard' }, children: [] },
        { id: 2, name: { en: 'Licencias' }, config: { angularComponentPath: '/licencias' }, children: [] }
      ];
    } else {
      // Menú por defecto
      this.menuItems = [
        { id: 1, name: { en: 'Inicio' }, config: { angularComponentPath: '/' }, children: [] }
      ];
    }
  }

  getUserRoles() {
    // Este método debe obtener los roles del usuario, ya sea desde un servicio o almacenamiento local
    return ['user']; // Por ejemplo
  }
}

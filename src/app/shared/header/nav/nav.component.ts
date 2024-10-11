import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

export class TreeNode {
  moduleId!: number; // ID del módulo
  moduleName!: string; // Nombre del módulo
  description!: string; // Descripción del módulo
  config!: string; // Ruta del módulo
  parentId!: number | null; // ID del módulo padre (si es null, es un nodo padre)
  children: TreeNode[] = []; // Lista de módulos hijos
}


@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  menuItems: TreeNode[] = []; // Almacena los módulos construidos como árbol
  subs: Subscription[] = []; // Lista de suscripciones para limpiar después
  currentRoute: string = ''; // Ruta actual del navegador

  constructor(
    private AuthService: AuthService,
    private router: Router
  ) {}

  // homePath: TreeNode = {
  //   children: [],
  //   id: -1,
  //   name: { en: 'Home', es: 'Página principal' },
  //   parentId: null,
  //   description: {},

  //   config: {
  //     angularComponentPath: '/pages/home',
  //     externalUrl: '',
  //     isAngularPath: true,
  //     quickLink: false,
  //   },
  //   parentName: {},
  //   visible: false,
  // };


  ngOnInit(): void {
    this.currentRoute = this.router.url; // Obtiene la ruta actual al iniciar
    this.getCurrentRoute(); // Escucha los eventos de navegación

    this.getUserModules(); // Llama al servicio para obtener los módulos del usuario
  }

  // Escucha los cambios en la ruta actual del navegador
  getCurrentRoute() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url; // Actualiza la ruta actual
      }
    });
  }

  // Obtiene los módulos del usuario desde la API
  getUserModules() {
    const rolId = localStorage.getItem('rolId');

    if (rolId) {
      this.AuthService.getModulesByRole(rolId).subscribe({
        next: (result) => {
          console.log('Módulos recibidos:', result.data);
          const modules = result.data.map((item: TreeNode) => ({
            id: item.moduleId,
            name: item.moduleName,
            description: item.description,
            config: item.config,
            parentId: item.parentId,
            children: []
          }));

          this.menuItems = this.buildTree(modules); // Construye el árbol de módulos
          console.log('Estructura de menuItems:', this.menuItems);
        },
        error: (error) => console.error('Error al obtener los módulos:', error),
      });
    } else {
      console.error('El rolId no está definido. Verifica el almacenamiento local.');
      // Manejo adicional si es necesario
    }
  }


  // Construye el árbol de navegación a partir de los módulos obtenidos
  buildTree(data: TreeNode[]): TreeNode[] {
    const treeMap = new Map<number, TreeNode>();

    // Crea el mapa de nodos
    data.forEach((item) => {
      treeMap.set(item.moduleId, {
        ...item,
        children: [] // Inicializa el array de hijos
      });
    });

    // Conecta nodos padres con hijos
    data.forEach((item) => {
      if (item.parentId !== null) {
        const parent = treeMap.get(item.parentId);
        if (parent) {
          parent.children.push(treeMap.get(item.moduleId)!);
        }
      }
    });

    // Filtra y devuelve los nodos raíz
    return Array.from(treeMap.values()).filter(node => node.parentId === null);
  }

}

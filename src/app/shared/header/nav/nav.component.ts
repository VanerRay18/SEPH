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
  parentName!: string | null;
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
  ) { }

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
          console.log('Módulos recibidos:', result.data); // Asegúrate de que esto esté mostrando los módulos

          const modules = result.data.map((item: TreeNode) => ({
            id: item.moduleId,
            name: item.moduleName,
            description: item.description,
            config: item.config,
            parentId: item.parentId,
            parentName: item.parentName,
            children: []
          }));

          // Aquí es donde se construye el árbol
          this.menuItems = this.buildTree(modules); // Construye el árbol de módulos
          // console.log('Estructura de menuItems después de buildTree:', this.menuItems);
          // Asegúrate de que se esté asignando correctamente
          // console.log('Estructura de menuItems:', this.menuItems); // Esto debería mostrar la estructura
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
    console.log('Datos pasados a buildTree:', data);
    const treeMap = new Map<number, TreeNode>(); // Mapa para almacenar los nodos

    // Paso 1: Crea el mapa de módulos
    data.forEach((item: TreeNode) => {
      console.log('Módulo:', item);
        // Asegúrate de usar la propiedad correcta (en este caso, `id` en lugar de `moduleId`)
        treeMap.set(item.moduleId, {
            ...item,
            children: [] // Inicializa el array de hijos
        });
        const node = treeMap.get(item.moduleId); // Obtiene el nodo actual
        if (item.parentId !== null) {
            const parent = treeMap.get(item.parentId); // Busca el nodo padre
            if (parent) {
                parent.children.push(node!); // Añade el nodo actual como hijo del padre
            }
        }
    });

    console.log('Contenido de treeMap:', Array.from(treeMap.values()));
    // Paso 2: Asocia los módulos hijos a sus padres
    data.forEach((item: TreeNode) => {

    });

    // Paso 3: Obtiene los nodos raíz (módulos sin padre)
    const roots: TreeNode[] = [];
    treeMap.forEach((node) => {
        if (node.parentId === null) {
            roots.push(node); // Añade el nodo raíz a la lista
        }
    });

    console.log('Raíces encontradas:', roots); // Muestra los nodos raíz
    console.log('Estructura final de menuItems:', roots); // Para verificar la estructura final
    return roots; // Devuelve la estructura final del árbol

  }
}

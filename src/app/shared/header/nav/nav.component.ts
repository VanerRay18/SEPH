import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';
import { BusquedaserlService } from 'src/app/services/busquedaserl.service';
export class TreeNode {
  moduleId!: number; // ID del módulo
  moduleName!: string; // Nombre del módulo
  description!: string; // Descripción del módulo
  config!: string; // Ruta del módulo
  parentId!: number | null; // ID del módulo padre (si es null, es un nodo padre)
  parentName!: string | null;
  icon!:string | null;
  children: TreeNode[] = []; // Lista de módulos hijos
}

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit, OnDestroy {
  menuItems: TreeNode[] = []; // Almacena los módulos construidos como árbol
  subs: Subscription[] = []; // Lista de suscripciones para limpiar después
  currentRoute: string = ''; // Ruta actual del navegador

  constructor(
    private authService: AuthService,
    private router: Router,
    private BusquedaserlService: BusquedaserlService,
  ) {     this.currentRoute = this.router.url;}

  ngOnInit(): void {
     // Obtiene la ruta actual al iniciar

    this.getCurrentRoute(); // Escucha los eventos de navegación
    this.getUserModules(); // Llama al servicio para obtener los módulos del usuario
  }

  // Escucha los cambios en la ruta actual del navegador
  getCurrentRoute() {
    const sub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url; // Actualiza la ruta actual
        console.log('Ruta actual:', this.currentRoute); // Agrega un log para verificar
      }
    });
    this.subs.push(sub);
  }
  handleChildClick(route:any) {
    this.router.navigate([route]);
  }
  // Obtiene los módulos del usuario desde la API
  getUserModules() {
    const rolId = localStorage.getItem('rolId');

    if (rolId) {
      const sub = this.authService.getModulesByRole(rolId).subscribe({
        next: (result) => {
          const modules: TreeNode[] = result.data.map((item: any) => ({
            moduleId: item.moduleId,
            moduleName: item.moduleName,
            description: item.description,
            config: item.config.trim(), // Eliminamos espacios en blanco
            parentId: item.parentId,
            icon: item.icon,
            parentName: item.parentName,
            children: []
          }));

          // Construye el árbol de módulos
          this.menuItems = this.buildTree(modules);
        },
        error: (error) => console.error('Error al obtener los módulos:', error),
      });
      this.subs.push(sub);
    }
  }

  // Construye el árbol de navegación a partir de los módulos obtenidos
  buildTree(data: TreeNode[]): TreeNode[] {
    const treeMap = new Map<number, TreeNode>();
console.log(data)
    // Paso 1: Crea el mapa de módulos
    data.forEach((item: TreeNode) => {
      treeMap.set(item.moduleId, {
        ...item,
        children: [] // Inicializa el array de hijos
      });
    });

    // Paso 2: Asocia los módulos hijos a sus padres
    data.forEach((item: TreeNode) => {
      if (item.parentId !== null) {
        const parent = treeMap.get(item.parentId);
        if (parent) {
          parent.children.push(treeMap.get(item.moduleId)!);
        }
      }
    });

    // Paso 3: Obtiene los nodos raíz (módulos sin padre)
    const roots: TreeNode[] = [];
    treeMap.forEach((node) => {
      if (node.parentId === null) {
        roots.push(node);
      }
    });
    return roots; // Devuelve la estructura final del árbol
  }

  ngOnDestroy(): void {
    this.BusquedaserlService.clearSrlEmp()
    this.subs.forEach(sub => sub.unsubscribe());
  }
}

import { Component } from '@angular/core';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {
  allRoles: string[] = ['Administrador', 'Licencias Admin', 'Licencias', 'Archivo Admin'];
  assignedRoles: string[] = ['Archivo'];
  allModules: string[] = ['Ingreso-licencias', 'Archivo-licenicas', 'Oficio-licenias', 'Logs-licenicas'];
  assignedModules: string[] = ['Home'];
  draggedModulo: string | null = null;
  draggedRole: string | null = null;
  showCards: boolean = false;

  toggleCards(activate: boolean) {
    this.showCards = activate;
  }

  onDragStart(event: DragEvent, role: string) {
    this.draggedRole = role;
    event.dataTransfer?.setData('text/plain', role);
  }

  onDragStartM(event: DragEvent, modulo: string) {
    this.draggedModulo = modulo;
    event.dataTransfer?.setData('text/plain', modulo);
  }


  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragOverM(event: DragEvent) {
    event.preventDefault();
  }


  onDrop(event: DragEvent, target: 'assigned' | 'all') {
    event.preventDefault();
    const role = this.draggedRole;

    if (role) {
      if (target === 'assigned') {
        if (!this.assignedRoles.includes(role)) {
          this.assignedRoles.push(role);
          this.allRoles = this.allRoles.filter(r => r !== role);
        }
      } else {
        this.assignedRoles = this.assignedRoles.filter(r => r !== role);
        this.allRoles.push(role);
      }
      this.draggedRole = null;
    }
  }

  onDropM(event: DragEvent, target: 'assigned' | 'all') {
    event.preventDefault();
    const modulo = this.draggedModulo;

    if (modulo) {
      if (target === 'assigned') {
        if (!this.assignedRoles.includes(modulo)) {
          this.assignedModules.push(modulo);
          this.allModules = this.allModules.filter(m => m !== modulo);
        }
      } else {
        this.assignedModules = this.assignedModules.filter(m => m !== modulo);
        this.allModules.push(modulo);
      }
      this.draggedModulo = null;
    }
  }

}

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit{
  allRoles: string[] = ['Administrador', 'Licencias Admin', 'Licencias', 'Archivo Admin'];
  assignedRoles: string[] = ['Archivo'];
  allModules: string[] = ['Ingreso-licencias', 'Archivo-licenicas', 'Oficio-licenias', 'Logs-licenicas'];
  assignedModules: string[] = ['Home'];
  draggedModulo: string | null = null;
  draggedRole: string | null = null;
  showCards: boolean = false;
  UserForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.UserForm = this.fb.group({
      On: [true], // Checkbox de habilitado/deshabilitado
      name: ['', [Validators.required, Validators.minLength(3)]], // Requerido, mínimo 3 caracteres
      rfc: ['', [Validators.required, Validators.pattern(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/)]], // Requerido, patrón RFC
      srl_emp: ['', [Validators.required, Validators.minLength(4)]], // Requerido, mínimo 4 caracteres
      position: ['', Validators.required], // Requerido
      area: ['', Validators.required], // Requerido
      fuction: ['', [Validators.required, Validators.minLength(10)]], // Requerido, mínimo 10 caracteres
      user: ['', [Validators.required, Validators.minLength(8)]], // Requerido, mínimo 8 caracteres
      pass: ['', [Validators.required, Validators.minLength(6)]]  // Requerido, mínimo 6 caracteres
    });
  }

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

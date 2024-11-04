import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.css']
})
export class ModulesComponent {
  allRoles: string[] = ['Administrador', 'Licencias Admin', 'Licencias', 'Archivo Admin'];
  assignedRoles: string[] = ['Archivo'];
  draggedRole: string | null = null;
  roleForm: FormGroup;
  isModulePapa: boolean = false; // Variable para controlar la visibilidad del dropdown

  constructor(private fb: FormBuilder) {
    this.roleForm = this.fb.group({
      selectedOption: ['', Validators.required], // Control para el dropdown
      // otros controles...
    });
  }

  ngOnInit(): void {
    // Inicializa según sea necesario
  }

  onActivateChange(isPapa: boolean): void {
    this.isModulePapa = isPapa; // Actualiza la variable basada en la selección
    if (!isPapa) {
      this.roleForm.get('selectedOption')?.reset(); // Reinicia el dropdown si es "No"
    }
  }


  onDragStart(event: DragEvent, role: string) {
    this.draggedRole = role;
    event.dataTransfer?.setData('text/plain', role);
  }

  onDragOver(event: DragEvent) {
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


}

import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css']
})
export class TablesComponent {

// Input para las cabeceras de la tabla
@Input() headers: string []= [];
// Input para los datos a mostrar
@Input() data: any[]=[];
 // Input para las columnas que se deben mostrar
@Input() displayedColums: string []=[];
// Input para mostrar u ocultar la columna de acciones
@Input() showActions: boolean = false;


@Input() showActionsEdit: boolean = false;
@Input() showActionsDeleted: boolean = false;
@Input() showActionsPdf: boolean = false;
// Outputs para emitir eventos de editar o eliminar
@Output() edit: EventEmitter<any> = new EventEmitter();
@Output() delete: EventEmitter<any> = new EventEmitter();
@Output() Pdf: EventEmitter<any> = new EventEmitter();
@Input() searchTerm: string = '';  // Término de búsqueda, opcional

 // Propiedad para activar el scroll
 enableScroll: boolean = false;

 ngOnChanges() {
   // Verificar si hay más de 10 filas
   this.enableScroll = this.data.length > 3;
 }


onEdit(row: any) {

  this.edit.emit(row); // Emitir el evento al componente padre
}

onDelete(row: any) {
  this.delete.emit(row); // Emitir el evento al componente padre
}

onPDF(row: any) {
  this.Pdf.emit(row); // Emitir el evento al componente padre
}

}

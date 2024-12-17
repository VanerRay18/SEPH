import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.css']
})
export class TablesComponent implements OnChanges{

// Input para las cabeceras de la tabla
@Input() headers: string []= [];
// Input para los datos a mostrar
@Input() data: any[]=[];
 // Input para las columnas que se deben mostrar
@Input() displayedColums: string []=[];
// Input para mostrar u ocultar la columna de acciones
@Input() showActions: boolean = false;

@Input() itemsPerPage: number = 20; // Cantidad de elementos por página
@Input() showActionsEdit: boolean = false;
@Input() showActionsDeleted: boolean = false;
@Input() showActionsPdf: boolean = false;

@Input() maxHeight: string = '300px';
// Outputs para emitir eventos de editar o eliminar
@Output() edit: EventEmitter<any> = new EventEmitter();
@Output() delete: EventEmitter<any> = new EventEmitter();
@Output() Pdf: EventEmitter<any> = new EventEmitter();
@Input() searchTerm: string = '';  // Término de búsqueda, opcional

isAnyLicenseReady: boolean = false;
 // Propiedades para ordenamiento
 sortedColumn: string = '';
 sortDirection: 'asc' | 'desc' = 'asc';

// Propiedades locales
paginatedData: any[] = [];
currentPage: number = 1;
totalPages: number = 1;

ngOnChanges(changes: SimpleChanges): void {
  if (changes['data'] || changes['itemsPerPage']) {
    this.updatePagination();
    this.checkIfAnyLicenseIsReady();
  }
}

private updatePagination(): void {
  const start = (this.currentPage - 1) * this.itemsPerPage;
  const end = start + this.itemsPerPage;
  this.paginatedData = this.data.slice(start, end);
  this.totalPages = Math.ceil(this.data.length / this.itemsPerPage);
}


onPageChange(page: number): void {
  this.currentPage = page;
  this.updatePagination();
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

sortData(column: string): void {
  if (this.sortedColumn === column) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortedColumn = column;
    this.sortDirection = 'asc';
  }

  // Ordenar los datos
  this.data.sort((a, b) => {
    const valueA = a[column];
    const valueB = b[column];

    if (valueA < valueB) {
      return this.sortDirection === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return this.sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Después de ordenar los datos, actualizamos la paginación
  this.updatePagination();
}

private checkIfAnyLicenseIsReady(): void {
  this.isAnyLicenseReady = this.data.some(
    (item: any) =>
      item.nueva === 1 &&
      (item.observaciones === 1 || item.observaciones === 2)
  );
}

}

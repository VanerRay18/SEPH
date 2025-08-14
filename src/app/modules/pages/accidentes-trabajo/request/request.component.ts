import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.css']
})
export class RequestComponent {
 selectedTab = 'solicitudes';
  searchText = '';
  currentPage = 1;
  pageSize = 6;

  data = [
    { nombre: 'Maria Fernanda', apellidoPaterno: 'López', apellidoMaterno: 'Martínez', rfc: 'REW3DWEF31', fecha: '12/03/25', hora: '12:00', telefono: '771 776 7894' },
    { nombre: 'José Manuel', apellidoPaterno: 'Gómez', apellidoMaterno: 'Hernández', rfc: 'REW3DWEF31', fecha: '12/03/25', hora: '12:00', telefono: '771 776 7894' },
    { nombre: 'Ana Sofia', apellidoPaterno: 'Rodríguez', apellidoMaterno: 'Sánchez', rfc: 'REW3DWEF31', fecha: '12/03/25', hora: '12:00', telefono: '771 776 7894' },
    { nombre: 'Carlos Alberto', apellidoPaterno: 'Morales', apellidoMaterno: 'Gutiérrez', rfc: 'REW3DWEF31', fecha: '12/03/25', hora: '12:00', telefono: '771 776 7894' },
    { nombre: 'Luis Enrique', apellidoPaterno: 'Torres', apellidoMaterno: 'Ramírez', rfc: 'REW3DWEF31', fecha: '12/03/25', hora: '12:00', telefono: '771 776 7894' },
    { nombre: 'Daniela Paola', apellidoPaterno: 'Pérez', apellidoMaterno: 'Castro', rfc: 'REW3DWEF31', fecha: '12/03/25', hora: '12:00', telefono: '771 776 7894' },
    // ... agrega más datos si quieres
  ];

  filteredData = [...this.data];

  ngOnInit(): void {
    this.filterData();
  }

  get pagedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  get totalPagesArray() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  filterData() {
    const text = this.searchText.toLowerCase();
    this.filteredData = this.data.filter(item =>
      item.nombre.toLowerCase().includes(text) ||
      item.apellidoPaterno.toLowerCase().includes(text) ||
      item.apellidoMaterno.toLowerCase().includes(text) ||
      item.rfc.toLowerCase().includes(text) ||
      item.telefono.includes(text)
    );
    this.currentPage = 1;
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}

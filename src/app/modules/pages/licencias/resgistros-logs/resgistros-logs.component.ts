import { Component } from '@angular/core';

@Component({
  selector: 'app-resgistros-logs',
  templateUrl: './resgistros-logs.component.html',
  styleUrls: ['./resgistros-logs.component.css']
})
export class ResgistrosLogsComponent {
  searchTerm: string = '';
  headers = ['No.', 'Nombre', 'RFC', 'FI_PS', 'Nombraminetos definitivos', 'Licencias Medicas', 'Licencias Especiales'];
  displayedColumns = ['no', 'nombre', 'rfc', '', ' ', 'folio'];
  data: any[] = [];

}

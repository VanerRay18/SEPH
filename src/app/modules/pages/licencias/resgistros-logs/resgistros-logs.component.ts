import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { LicenciasService } from 'src/app/services/licencias-service/licencias.service';
import { ApiResponse } from 'src/app/models/ApiResponse';
import { Logs } from 'src/app/shared/interfaces/utils';
@Component({
  selector: 'app-resgistros-logs',
  templateUrl: './resgistros-logs.component.html',
  styleUrls: ['./resgistros-logs.component.css']
})
export class ResgistrosLogsComponent implements OnInit{
  searchTerm: string = '';
  headers = ['No.','Usuario', 'Nombre', 'Accion','Fecha', 'No. licencia', 'Cambios'];
  displayedColumns = ['id','usuario', 'nombre', 'accion', 'tiempo', 'folio', 'data'];
  items: { rfc: string; nombre: string; srl_emp: number }[] = [];
  data: any[] = [];
  
  constructor(    
    private LicenciasService: LicenciasService,
    private fb: FormBuilder){}

  ngOnInit(){
    this.LicenciasService.getLicMedicasLogs().subscribe((response: ApiResponse) => {
      this.data = response.data.map((item: Logs) => {
        let parsedData;
    
        // Intentar parsear el campo 'data' solo si tiene contenido
        try {
          parsedData = JSON.parse(item.data);
        } catch (error) {
          parsedData = {}; // Si falla el parseo, asignamos un objeto vacío
        }
    
        // Verificar si 'params', 'new' y 'prev' están presentes en los datos parseados
        const newParams = parsedData?.params?.new;
        const prevParams = parsedData?.params?.prev;
    
        // Inicializar una variable para almacenar los datos concatenados
        let concatenatedData = '';
    
        // Si 'new' y 'prev' están presentes, formateamos toda su información
        if (newParams && prevParams) {
          concatenatedData = `
          Información anterior:
        Fecha inicio: ${prevParams.fecha_inicio}
        Fecha término: ${prevParams.fecha_termino}
        Formato: ${prevParams.formato ? prevParams.formato : 'N/A'}
        Folio: ${prevParams.folio ? prevParams.folio : 'N/A'}
        Fecha captura: ${prevParams.Fecha_captura}
        ------>
        Nueva información: Fecha inicio: ${newParams.fecha_inicio}
        Fecha término: ${newParams.fecha_termino}
        Formato: ${newParams.formato ? newParams.formato : 'N/A'}
        Folio: ${newParams.folio ? newParams.folio : 'N/A'}
        Fecha captura: ${newParams.Fecha_captura}
      `;
        } else {
          // Si no existen los datos en 'new' y 'prev', mostrar información básica o un mensaje
          concatenatedData ='No se encontró información detallada';
        }
      
        // Retornar el objeto original con el campo 'data' modificado
        return {
          ...item,
          tiempo:new Date(item.tiempo).toISOString().split('T')[0].replace(/-/g, '/'),
          data: concatenatedData
        };
      });
    });
    
    
  }
}

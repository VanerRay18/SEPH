import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistroComponent } from './registro/registro.component';
import { FormRecordComponent } from './form-record/form-record.component';
import { FormQueryComponent } from './form-query/form-query.component';
import { RequestComponent } from './request/request.component';

const routes: Routes = [
  {path: 'Registro-Reporte',component:RegistroComponent},
  {path: 'Formulario-Registro',component:FormRecordComponent},
  {path: 'Formulario-Consulta',component:FormQueryComponent},
  {path: 'Consultas',component:RequestComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccidentsRoutingModule { }

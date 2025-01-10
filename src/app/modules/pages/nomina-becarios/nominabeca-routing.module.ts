import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeBecariosComponent } from './home-becarios/home-becarios.component';
import { BecariosRComponent } from './becarios-r/becarios-r.component';
import { ActivasComponent } from './activas/activas.component';
import { CalcularComponent } from './calcular/calcular.component';
import { PagarComponent } from './pagar/pagar.component';
import { RevisionComponent } from './revision/revision.component';
import { EnviarComponent } from './enviar/enviar.component';
import { HistoricoComponent } from './historico/historico.component';

const routes: Routes = [
  {path: 'Home-Becarios',component:HomeBecariosComponent},
  {path: 'Becarios',component:BecariosRComponent},
  {path: 'Nominas-Activaas',component:ActivasComponent},
  {path: 'Nominas-Calcular',component:CalcularComponent},
  {path: 'Nominas-Pagar',component:PagarComponent},
  {path: 'Nominas-Revision',component:RevisionComponent},
  {path: 'Nominas-Enviar',component:EnviarComponent},
  {path: 'Nominas-Historico',component:HistoricoComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NominabecaRoutingModule { }

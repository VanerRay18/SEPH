import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeBecariosComponent } from './home-becarios/home-becarios.component';
import { BecariosRComponent } from './becarios-r/becarios-r.component';
import { ActivasComponent } from './activas/activas.component';
import { CalcularComponent } from './calcular/calcular.component';
import { PagarComponent } from './pagar/pagar.component';
import { RevisionComponent } from './revision/revision.component';
import { EnviarComponent } from './enviar/enviar.component';
import { HistoricoComponent } from './historico/historico.component';



@NgModule({
  declarations: [
    HomeBecariosComponent,
    BecariosRComponent,
    ActivasComponent,
    CalcularComponent,
    PagarComponent,
    RevisionComponent,
    EnviarComponent,
    HistoricoComponent
  ],
  imports: [
    CommonModule
  ]
})
export class NominaBecariosModule { }

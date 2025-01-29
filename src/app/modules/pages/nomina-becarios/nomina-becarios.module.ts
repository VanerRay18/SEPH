import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HomeBecariosComponent } from './home-becarios/home-becarios.component';
import { BecariosRComponent } from './becarios-r/becarios-r.component';
import { ActivasComponent } from './activas/activas.component';
import { CalcularComponent } from './calcular/calcular.component';
import { PagarComponent } from './pagar/pagar.component';
import { RevisionComponent } from './revision/revision.component';
import { EnviarComponent } from './enviar/enviar.component';
import { HistoricoComponent } from './historico/historico.component';
import { NominabecaRoutingModule } from './nominabeca-routing.module';
import { SharedModule } from "../../../shared/shared.module";
import { Anexo6Component } from './anexo6/anexo6.component';
import { Anexo7Component } from './anexo7/anexo7.component';
import { CatalogosComponent } from './catalogos/catalogos.component';

@NgModule({
  declarations: [
    HomeBecariosComponent,
    BecariosRComponent,
    ActivasComponent,
    CalcularComponent,
    PagarComponent,
    RevisionComponent,
    EnviarComponent,
    HistoricoComponent,
    Anexo6Component,
    Anexo7Component,
    CatalogosComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NominabecaRoutingModule,
    SharedModule

  ]
})
export class NominaBecariosModule { }

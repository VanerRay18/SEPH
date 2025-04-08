import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeTercerosComponent } from './home-terceros/home-terceros.component';
import { DescuentosComponent } from './descuentos/descuentos.component';
import { CrearLayoutComponent } from './crear-layout/crear-layout.component';
import { ValidarComponent } from './validar/validar.component';
import { CorrecionesComponent } from './correciones/correciones.component';
import { LayoutsTerminadosComponent } from './layouts-terminados/layouts-terminados.component';
import { RegistrosTercerosComponent } from './registros-terceros/registros-terceros.component';
import { RegistrosPersonasComponent } from './registros-personas/registros-personas.component';
import { HistoricoComponent } from './historico/historico.component';



@NgModule({
  declarations: [
    HomeTercerosComponent,
    DescuentosComponent,
    CrearLayoutComponent,
    ValidarComponent,
    CorrecionesComponent,
    LayoutsTerminadosComponent,
    RegistrosTercerosComponent,
    RegistrosPersonasComponent,
    HistoricoComponent
  ],
  imports: [
    CommonModule
  ]
})
export class TercerosModule { }

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
import { TercerosRoutingModule } from './terceros-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateLayoutForteComponent } from './create-layout-forte/create-layout-forte.component';



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
    HistoricoComponent,
    CreateLayoutForteComponent
  ],
  imports: [
    CommonModule,
    TercerosRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class TercerosModule { }

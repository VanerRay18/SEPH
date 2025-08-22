import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CorrecionesComponent } from './correciones/correciones.component';
import { CrearLayoutComponent } from './crear-layout/crear-layout.component';
import { DescuentosComponent } from './descuentos/descuentos.component';
import { HistoricoComponent } from './historico/historico.component';
import { HomeTercerosComponent } from './home-terceros/home-terceros.component';
import { LayoutsTerminadosComponent } from './layouts-terminados/layouts-terminados.component';
import { RegistrosPersonasComponent } from './registros-personas/registros-personas.component';
import { ValidarComponent } from './validar/validar.component';

const routes: Routes = [
  {path: 'Reporte-Validacion/:id',component: CorrecionesComponent},
  {path: 'Crear-Layout/:id',component: CrearLayoutComponent},
  {path: 'Descuentos',component: DescuentosComponent},
  {path: 'Historico-Terceros',component: HistoricoComponent},
  {path: 'Home-Terceros',component: HomeTercerosComponent},
  {path: 'Revision-Final',component: LayoutsTerminadosComponent},
  {path: 'Registros',component: RegistrosPersonasComponent},
  {path: 'Validar/:id',component: ValidarComponent},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TercerosRoutingModule { }

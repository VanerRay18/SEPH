import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HistorialComponent } from './historial/historial.component';

const routes: Routes = [
{path: 'Licencias-historial',component:HistorialComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], // Configura las rutas a nivel de raíz
  exports: [RouterModule]
})
export class LicenciasRoutingModule { }

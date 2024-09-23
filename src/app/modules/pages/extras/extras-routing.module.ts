import { NgModule } from '@angular/core';
import { PerfilComponent } from './perfil/perfil.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path: 'Perfil', component: PerfilComponent}

];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExtrasRoutingModule { }

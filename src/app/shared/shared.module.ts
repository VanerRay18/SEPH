import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from './header/nav/nav.component';
import { RouterModule } from '@angular/router';
import { FomrsComponent } from './componentes/fomrs/fomrs.component';
import { TablesComponent } from './componentes/tables/tables.component';


@NgModule({
  declarations: [
    NavComponent,
    FomrsComponent,
    TablesComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    NavComponent,
    TablesComponent
    ]

})
export class SharedModule { }

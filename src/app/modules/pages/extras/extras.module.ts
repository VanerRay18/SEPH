import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PruebasComponent } from './pruebas/pruebas.component';
import { SharedModule } from 'src/app/shared/shared.module';



@NgModule({
  declarations: [
    PruebasComponent
  ],
  imports: [
    CommonModule,
        SharedModule
  ]
})
export class ExtrasModule { }

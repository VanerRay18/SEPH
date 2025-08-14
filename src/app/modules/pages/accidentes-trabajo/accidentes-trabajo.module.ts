import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistroComponent } from './registro/registro.component';
import { FormRecordComponent } from './form-record/form-record.component';
import { FormQueryComponent } from './form-query/form-query.component';
import { RequestComponent } from './request/request.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    RegistroComponent,
    FormRecordComponent,
    FormQueryComponent,
    RequestComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ]
})
export class AccidentesTrabajoModule { }

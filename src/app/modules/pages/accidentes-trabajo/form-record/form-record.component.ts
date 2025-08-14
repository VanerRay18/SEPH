import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-form-record',
  templateUrl: './form-record.component.html',
  styleUrls: ['./form-record.component.css']
})
export class FormRecordComponent implements OnInit {

   reporteForm: FormGroup;

  historial = [
    { status: 'Pendiente' },
    { status: 'Fuera de tiempo' },
    { status: 'En espera' },
    { status: 'Aceptado' }
  ];

  constructor(private fb: FormBuilder) {
    this.reporteForm = this.fb.group({
      nombre: [''],
      apellidoPaterno: [''],
      apellidoMaterno: [''],
      rfc: [''],
      curp: [''],
      correo: [''],
      numeroContacto: [''],
      fechaAccidente: [''],
      horaAccidente: ['']
    });
  }

  ngOnInit(): void {

  }
}

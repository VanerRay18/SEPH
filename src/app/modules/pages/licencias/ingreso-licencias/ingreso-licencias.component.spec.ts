import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresoLicenciasComponent } from './ingreso-licencias.component';

describe('IngresoLicenciasComponent', () => {
  let component: IngresoLicenciasComponent;
  let fixture: ComponentFixture<IngresoLicenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IngresoLicenciasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngresoLicenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

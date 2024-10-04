import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OficioLicenciasComponent } from './oficio-licencias.component';

describe('OficioLicenciasComponent', () => {
  let component: OficioLicenciasComponent;
  let fixture: ComponentFixture<OficioLicenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OficioLicenciasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OficioLicenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

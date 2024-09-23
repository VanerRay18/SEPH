import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresarLicenciaComponent } from './ingresar-licencia.component';

describe('IngresarLicenciaComponent', () => {
  let component: IngresarLicenciaComponent;
  let fixture: ComponentFixture<IngresarLicenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IngresarLicenciaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngresarLicenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

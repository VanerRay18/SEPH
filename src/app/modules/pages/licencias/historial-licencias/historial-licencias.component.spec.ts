import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialLicenciasComponent } from './historial-licencias.component';

describe('HistorialLicenciasComponent', () => {
  let component: HistorialLicenciasComponent;
  let fixture: ComponentFixture<HistorialLicenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HistorialLicenciasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialLicenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

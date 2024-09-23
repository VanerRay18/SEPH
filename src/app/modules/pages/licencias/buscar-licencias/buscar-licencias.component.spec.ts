import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarLicenciasComponent } from './buscar-licencias.component';

describe('BuscarLicenciasComponent', () => {
  let component: BuscarLicenciasComponent;
  let fixture: ComponentFixture<BuscarLicenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuscarLicenciasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscarLicenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

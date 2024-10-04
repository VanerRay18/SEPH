import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivoLicenciasComponent } from './archivo-licencias.component';

describe('ArchivoLicenciasComponent', () => {
  let component: ArchivoLicenciasComponent;
  let fixture: ComponentFixture<ArchivoLicenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArchivoLicenciasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArchivoLicenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

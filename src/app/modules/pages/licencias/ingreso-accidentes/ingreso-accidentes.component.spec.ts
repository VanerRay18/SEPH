import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresoAccidentesComponent } from './ingreso-accidentes.component';

describe('IngresoAccidentesComponent', () => {
  let component: IngresoAccidentesComponent;
  let fixture: ComponentFixture<IngresoAccidentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IngresoAccidentesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngresoAccidentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

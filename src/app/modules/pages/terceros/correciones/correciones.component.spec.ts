import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorrecionesComponent } from './correciones.component';

describe('CorrecionesComponent', () => {
  let component: CorrecionesComponent;
  let fixture: ComponentFixture<CorrecionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CorrecionesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorrecionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

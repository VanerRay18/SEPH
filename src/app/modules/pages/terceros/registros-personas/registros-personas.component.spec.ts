import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrosPersonasComponent } from './registros-personas.component';

describe('RegistrosPersonasComponent', () => {
  let component: RegistrosPersonasComponent;
  let fixture: ComponentFixture<RegistrosPersonasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrosPersonasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrosPersonasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

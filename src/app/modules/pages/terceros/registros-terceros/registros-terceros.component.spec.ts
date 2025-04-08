import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrosTercerosComponent } from './registros-terceros.component';

describe('RegistrosTercerosComponent', () => {
  let component: RegistrosTercerosComponent;
  let fixture: ComponentFixture<RegistrosTercerosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrosTercerosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrosTercerosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

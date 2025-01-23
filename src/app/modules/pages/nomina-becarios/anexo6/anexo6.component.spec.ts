import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Anexo6Component } from './anexo6.component';

describe('Anexo6Component', () => {
  let component: Anexo6Component;
  let fixture: ComponentFixture<Anexo6Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Anexo6Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Anexo6Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

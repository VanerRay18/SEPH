import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Anexo7Component } from './anexo7.component';

describe('Anexo7Component', () => {
  let component: Anexo7Component;
  let fixture: ComponentFixture<Anexo7Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Anexo7Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Anexo7Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

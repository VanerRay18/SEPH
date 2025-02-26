import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Anexo5ExtraComponent } from './anexo5-extra.component';

describe('Anexo5ExtraComponent', () => {
  let component: Anexo5ExtraComponent;
  let fixture: ComponentFixture<Anexo5ExtraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Anexo5ExtraComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Anexo5ExtraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

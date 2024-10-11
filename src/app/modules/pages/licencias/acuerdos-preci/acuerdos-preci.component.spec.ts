import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcuerdosPreciComponent } from './acuerdos-preci.component';

describe('AcuerdosPreciComponent', () => {
  let component: AcuerdosPreciComponent;
  let fixture: ComponentFixture<AcuerdosPreciComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcuerdosPreciComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcuerdosPreciComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

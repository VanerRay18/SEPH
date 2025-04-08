import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearLayoutComponent } from './crear-layout.component';

describe('CrearLayoutComponent', () => {
  let component: CrearLayoutComponent;
  let fixture: ComponentFixture<CrearLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearLayoutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

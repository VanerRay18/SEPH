import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutsTerminadosComponent } from './layouts-terminados.component';

describe('LayoutsTerminadosComponent', () => {
  let component: LayoutsTerminadosComponent;
  let fixture: ComponentFixture<LayoutsTerminadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LayoutsTerminadosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutsTerminadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

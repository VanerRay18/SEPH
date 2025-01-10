import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BecariosRComponent } from './becarios-r.component';

describe('BecariosRComponent', () => {
  let component: BecariosRComponent;
  let fixture: ComponentFixture<BecariosRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BecariosRComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BecariosRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

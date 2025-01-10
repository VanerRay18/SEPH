import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeBecariosComponent } from './home-becarios.component';

describe('HomeBecariosComponent', () => {
  let component: HomeBecariosComponent;
  let fixture: ComponentFixture<HomeBecariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeBecariosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeBecariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

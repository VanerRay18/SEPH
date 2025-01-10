import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivasComponent } from './activas.component';

describe('ActivasComponent', () => {
  let component: ActivasComponent;
  let fixture: ComponentFixture<ActivasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActivasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

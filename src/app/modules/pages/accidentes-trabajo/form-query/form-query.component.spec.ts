import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormQueryComponent } from './form-query.component';

describe('FormQueryComponent', () => {
  let component: FormQueryComponent;
  let fixture: ComponentFixture<FormQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormQueryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

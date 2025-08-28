import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLayoutForteComponent } from './create-layout-forte.component';

describe('CreateLayoutForteComponent', () => {
  let component: CreateLayoutForteComponent;
  let fixture: ComponentFixture<CreateLayoutForteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateLayoutForteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateLayoutForteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeTercerosComponent } from './home-terceros.component';

describe('HomeTercerosComponent', () => {
  let component: HomeTercerosComponent;
  let fixture: ComponentFixture<HomeTercerosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeTercerosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeTercerosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

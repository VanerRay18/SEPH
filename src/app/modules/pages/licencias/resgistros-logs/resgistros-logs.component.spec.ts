import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResgistrosLogsComponent } from './resgistros-logs.component';

describe('ResgistrosLogsComponent', () => {
  let component: ResgistrosLogsComponent;
  let fixture: ComponentFixture<ResgistrosLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResgistrosLogsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResgistrosLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

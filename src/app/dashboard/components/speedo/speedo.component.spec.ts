import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SpeedoComponent } from './speedo.component';

describe('SpeedoComponent', () => {
  let component: SpeedoComponent;
  let fixture: ComponentFixture<SpeedoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SpeedoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpeedoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

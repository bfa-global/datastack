import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KpiMetricComponent } from './kpi-metric.component';

describe('KpiMetricComponent', () => {
  let component: KpiMetricComponent;
  let fixture: ComponentFixture<KpiMetricComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KpiMetricComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KpiMetricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

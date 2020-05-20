import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerDetailComponent } from './layer-detail.component';

describe('LayerDetailComponent', () => {
  let component: LayerDetailComponent;
  let fixture: ComponentFixture<LayerDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LayerDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayerDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

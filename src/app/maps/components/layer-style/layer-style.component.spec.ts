import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerStyleComponent } from './layer-style.component';

describe('LayerStyleComponent', () => {
  let component: LayerStyleComponent;
  let fixture: ComponentFixture<LayerStyleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LayerStyleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayerStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCompoundLayerComponent } from './add-compound-layer.component';

describe('AddCompoundLayerComponent', () => {
  let component: AddCompoundLayerComponent;
  let fixture: ComponentFixture<AddCompoundLayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCompoundLayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCompoundLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

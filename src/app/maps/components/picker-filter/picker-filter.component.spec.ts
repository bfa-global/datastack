import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PickerFilterComponent } from './picker-filter.component';

describe('PickerFilterComponent', () => {
  let component: PickerFilterComponent;
  let fixture: ComponentFixture<PickerFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PickerFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PickerFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

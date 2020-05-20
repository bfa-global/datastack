import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownElementComponent } from './dropdown-element.component';

describe('DropdownElementComponent', () => {
  let component: DropdownElementComponent;
  let fixture: ComponentFixture<DropdownElementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DropdownElementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DropdownElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

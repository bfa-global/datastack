import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapSideNavComponent } from './map-side-nav.component';

describe('MapSideNavComponent', () => {
  let component: MapSideNavComponent;
  let fixture: ComponentFixture<MapSideNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapSideNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapSideNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

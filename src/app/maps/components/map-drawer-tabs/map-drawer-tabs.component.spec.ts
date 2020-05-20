import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapDrawerTabsComponent } from './map-drawer-tabs.component';

describe('TabsComponent', () => {
  let component: MapDrawerTabsComponent;
  let fixture: ComponentFixture<MapDrawerTabsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapDrawerTabsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapDrawerTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

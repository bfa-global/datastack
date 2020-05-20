import { TestBed } from '@angular/core/testing';

import { MapDrawerService } from './map-drawer.service';

describe('MapDrawerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MapDrawerService = TestBed.get(MapDrawerService);
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { MapDrawerService } from '../../services/map-drawer.service';

describe('MapSideNavService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MapDrawerService = TestBed.get(MapDrawerService);
    expect(service).toBeTruthy();
  });
});

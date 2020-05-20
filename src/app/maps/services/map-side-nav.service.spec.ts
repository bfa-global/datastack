import { TestBed } from '@angular/core/testing';

import { MapSideNavService } from './map-side-nav.service';

describe('MapSideNavService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MapSideNavService = TestBed.get(MapSideNavService);
    expect(service).toBeTruthy();
  });
});

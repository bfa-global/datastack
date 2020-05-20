import { TestBed } from '@angular/core/testing';

import { CalculationsService } from './calculations.service';

describe('CalculationsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CalculationsService = TestBed.get(CalculationsService);
    expect(service).toBeTruthy();
  });
});

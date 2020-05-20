import { TestBed } from '@angular/core/testing';

import { DatasourceService } from './datasource.service';

describe('DatasourceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DatasourceService = TestBed.get(DatasourceService);
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { ActionHandlerService } from './action-handler.service';

describe('ActionHandlerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ActionHandlerService = TestBed.get(ActionHandlerService);
    expect(service).toBeTruthy();
  });
});

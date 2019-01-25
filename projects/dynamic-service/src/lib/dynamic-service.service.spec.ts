import { TestBed } from '@angular/core/testing';

import { DynamicServiceService } from './dynamic-service.service';

describe('DynamicServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DynamicServiceService = TestBed.get(DynamicServiceService);
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { NewReleaseService } from './new-release.service';

describe('NewReleaseService', () => {
  let service: NewReleaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewReleaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

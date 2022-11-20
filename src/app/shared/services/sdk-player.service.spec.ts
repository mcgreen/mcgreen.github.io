import { TestBed } from '@angular/core/testing';

import { SdkPlayerService } from './sdk-player.service';

describe('SdkPlayerService', () => {
  let service: SdkPlayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SdkPlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

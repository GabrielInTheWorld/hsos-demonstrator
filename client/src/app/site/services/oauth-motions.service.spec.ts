import { TestBed } from '@angular/core/testing';

import { OauthMotionsService } from './oauth-motions.service';

describe('OauthMotionsService', () => {
  let service: OauthMotionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OauthMotionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

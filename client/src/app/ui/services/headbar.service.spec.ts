import { TestBed } from '@angular/core/testing';

import { HeadbarService } from './headbar.service';

describe('HeadbarService', () => {
  let service: HeadbarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeadbarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

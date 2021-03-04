import { TestBed } from '@angular/core/testing';

import { PromptDialogService } from './prompt-dialog.service';

describe('PromptDialogService', () => {
  let service: PromptDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PromptDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

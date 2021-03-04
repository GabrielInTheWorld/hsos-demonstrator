import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FidoDialogComponent } from './fido-dialog.component';

describe('FidoDialogComponent', () => {
  let component: FidoDialogComponent;
  let fixture: ComponentFixture<FidoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FidoDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FidoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FidoLoginComponent } from './fido-login.component';

describe('FidoLoginComponent', () => {
  let component: FidoLoginComponent;
  let fixture: ComponentFixture<FidoLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FidoLoginComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FidoLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

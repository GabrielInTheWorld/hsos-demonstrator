import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TwoAuthHelperComponent } from './two-auth-helper.component';

describe('TwoAuthHelperComponent', () => {
  let component: TwoAuthHelperComponent;
  let fixture: ComponentFixture<TwoAuthHelperComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TwoAuthHelperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TwoAuthHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

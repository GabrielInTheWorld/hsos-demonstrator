import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UserAuthenticationTypeChooserComponent } from './user-authentication-type-chooser.component';

describe('UserAuthenticationTypeChooserComponent', () => {
  let component: UserAuthenticationTypeChooserComponent;
  let fixture: ComponentFixture<UserAuthenticationTypeChooserComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UserAuthenticationTypeChooserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserAuthenticationTypeChooserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

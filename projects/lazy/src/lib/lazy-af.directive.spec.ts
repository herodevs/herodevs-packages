import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LazyAFDirective } from './lazy-af.directive';

describe('LazyComponent', () => {
  let component: LazyAFDirective;
  let fixture: ComponentFixture<LazyAFDirective>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LazyAFDirective],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LazyAFDirective);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

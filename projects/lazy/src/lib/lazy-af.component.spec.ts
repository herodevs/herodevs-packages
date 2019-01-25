import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LazyAFComponent } from './lazy-af.component';

describe('LazyComponent', () => {
  let component: LazyAFComponent;
  let fixture: ComponentFixture<LazyAFComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LazyAFComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LazyAFComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

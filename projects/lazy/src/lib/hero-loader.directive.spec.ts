import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroLoaderDirective } from './hero-loader.directive';

describe('LazyComponent', () => {
  let component: HeroLoaderDirective;
  let fixture: ComponentFixture<HeroLoaderDirective>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HeroLoaderDirective],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeroLoaderDirective);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

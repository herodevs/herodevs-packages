import {
  AfterViewInit,
  Directive,
  EventEmitter,
  Injector,
  Input,
  NgModuleFactory,
  NgModuleFactoryLoader,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, first } from 'rxjs/operators';
import {
  DynamicComponentService,
  ICreatedModule,
  ICreatedComponentInterface,
} from '@herodevs/dynamic-component-service';

// @ts-ignore
@Directive({
  selector: 'hero-loader, [hero-loader]',
})
export class HeroLoaderDirective implements AfterViewInit, OnChanges, OnDestroy {
  // @ts-ignore
  @Input() moduleName: string;

  @Output() init = new EventEmitter();

  componentRef: ICreatedComponentInterface;

  changesBS = new BehaviorSubject<SimpleChanges>(null);

  // Need to wait until the component view has inited
  afterInitBS = new BehaviorSubject<boolean>(false);

  /**
   *  This observable fires once the component has been init'd
   *  and once the changes come through
   *  and once the changes that has an input value that is a function
   *
   *  It only fires once. If the input changes, this observable
   *  will not fire again.
   */
  // @ts-ignore
  action$ = combineLatest(
    this.changesBS.asObservable().pipe(
      filter((val: SimpleChanges) => {
        return val && val.moduleName && val.moduleName.currentValue;
      }),
      first(),
    ),
    this.afterInitBS.asObservable().pipe(
      filter((init) => init),
      distinctUntilChanged(),
    ),
  );

  subs: Subscription[] = [
    this.action$.subscribe(() => {
      // Uses the loader function to lazy load and compile a module.
      this.loader
        .load(this.moduleName)
        .then((compiledModule: NgModuleFactory<any>) => {
          if (this.destroyed) return {};
          return this.lazy.createAndAttachModuleAsync(compiledModule, this.injector, { vcr: this.vcr });
        })
        .then(({ moduleRef, componentRef }: ICreatedModule) => {
          this.componentRef = componentRef;
          this.init.emit(componentRef);
        });
    }),
  ];

  destroyed = false;

  constructor(
    private lazy: DynamicComponentService,
    private vcr: ViewContainerRef,
    private injector: Injector,
    private loader: NgModuleFactoryLoader,
  ) {}

  ngAfterViewInit() {
    this.afterInitBS.next(true);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.changesBS.next(changes);
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.subs.forEach((s) => s.unsubscribe());

    // If the component has init'd, destroy it.
    if (this.componentRef) {
      this.componentRef.detach();
    }
  }
}

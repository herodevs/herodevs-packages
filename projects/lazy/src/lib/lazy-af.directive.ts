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
import { BehaviorSubject, combineLatest } from 'rxjs';
import { distinctUntilChanged, filter, first } from 'rxjs/operators';
import { DynamicAFService, ICreatedModule, ICreatedComponentInterface } from '@herodevs/dynamic-af';

@Directive({
  selector: 'lazy-af, [lazyAf]',
})
export class LazyAFDirective implements AfterViewInit, OnChanges, OnDestroy {
  // @ts-ignore
  @Input() moduleName: string;

  @Output() init = new EventEmitter();

  // @ts-ignore
  componentRef: ICreatedComponentInterface;

  // @ts-ignore
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

  subs = [
    this.action$.subscribe(() => {
      // Uses the loader function to lazy load and compile a module.
      this.loader
        .load(this.moduleName)
        .then((compiledModule: NgModuleFactory<any>) => {
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
    private lazy: DynamicAFService,
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

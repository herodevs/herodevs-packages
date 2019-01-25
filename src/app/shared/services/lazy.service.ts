import {
  ApplicationRef,
  Compiler,
  ComponentFactory,
  ComponentFactoryResolver,
  Injectable,
  Injector,
  NgModuleFactory,
  ViewContainerRef,
} from '@angular/core';
import { InternalNgModuleRef } from '@angular/core/src/linker/ng_module_factory';
import { BehaviorSubject, Subscription } from 'rxjs';

export interface ICreatedComponentInterface {
  next: (data: { [key: string]: any }) => void;
  detach: () => void;
}

const FACTORY_CLASS_SUFFIX = 'NgFactory';

@Injectable({
  providedIn: 'root',
})
export class LazyAFService {
  constructor(
    private _compiler: Compiler,
    private cfr: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
  ) {}

  /**
   * All of the code from this section was taken directly from the SystemJSNgModuleFactoryLoader
   * from inside of the Angular code base. I used it as the pattern to take a lazily loaded
   * module and get it compiled inside of the Angular runtime regardless of whether we are
   * running in AOT or JIT mode (regardless of whether the compiler has been shipped to the
   * browser or not).
   *
   * @param importPromise - This is a promise that will return the module.exports from the
   *                        lazily loaded module. You get this promise from webpack.
   * @param _exportName - This is the string version of the module name that you are lazily
   *                      loading. Ex: If you are lazily loading TestModule, then this value
   *                      would be: 'TestModule'.
   */
  load(importPromise: Promise<any>, _exportName: string): Promise<NgModuleFactory<any>> {
    const offlineMode = this._compiler instanceof Compiler;
    return offlineMode
      ? this.loadFactory(importPromise, _exportName)
      : this.loadAndCompile(importPromise, _exportName);
  }

  /*
        See comments on `load` method
     */
  private loadAndCompile(importPromise: Promise<any>, exportName: string): Promise<NgModuleFactory<any>> {
    if (exportName === undefined) {
      exportName = 'default';
    }

    // @ts-ignore
    return importPromise
      .then((module: any) => module[exportName])
      .then((type: any) => checkNotEmpty(type, exportName))
      .then((type: any) => this._compiler.compileModuleAsync(type));
  }

  /*
        See comments on `load` method
     */
  private loadFactory(importPromise: Promise<any>, exportName: string): Promise<NgModuleFactory<any>> {
    let factoryClassSuffix = FACTORY_CLASS_SUFFIX;
    if (exportName === undefined) {
      exportName = 'default';
      factoryClassSuffix = '';
    }

    return importPromise
      .then((module: any) => module[exportName + factoryClassSuffix])
      .then((factory: any) => checkNotEmpty(factory, exportName));
  }

  /**
   * This code was taken whole sale from Frost's personal project that allows you to dynamically attach components
   * to a view inside of Angular.
   *
   * @param compiledModule - A module that has been compiled by calling the `load` method above.
   * @param injector - The injector from the parent container component.
   * @param vcr - The view container ref from the calling component.
   * @param context - An object that has properties that match the Input and Output names from the
   *                  component that is being created.
   */
  createComponent(
    compiledModule: NgModuleFactory<any>,
    injector: Injector,
    vcr?: ViewContainerRef,
    context: { [key: string]: any } = {},
  ): ICreatedComponentInterface {
    // Resolve the factory for incoming component `type`.

    // Now that the module is loaded and compiled, create an instance of it.
    const moduleRef = compiledModule.create(injector) as InternalNgModuleRef<any>;
    // Take the bootstrap component from that module.
    const type = moduleRef._bootstrapComponents[0];
    // Use the module to get the component factory, so that we can create an instance of it.
    const factory = moduleRef.componentFactoryResolver.resolveComponentFactory(type);

    // Create an instance of the component, and add it to the DOM
    let componentRef: any;
    if (vcr) {
      // This call to createComponent will create and attach the instance to the vcr (the view element).
      componentRef = vcr.createComponent(factory, undefined, injector || this.injector);
    } else {
      // Manually create an instance of the component
      componentRef = factory.create(injector || this.injector);
      // Attach it to the app
      this.appRef.attachView(componentRef.hostView);
      // Attach the instance to the end of the body
      document.body.appendChild((componentRef.hostView as any).rootNodes[0]);
    }

    // Take the context and search for keys that match the names of the inputs/outputs
    // on the component.
    const unsubs = this._wireOutputs(factory, componentRef, context);

    // Place the incoming context into a stream. This stream will be returned to the caller,
    // and the caller can send in a new context at will by calling `.next(newContact)` on
    // this BehaviorSubject.
    const context$ = new BehaviorSubject(context);

    // Subscribe to the new observable for updated input values
    unsubs.push(
      context$.subscribe((_context) => {
        // When a new values comes through this stream, match up the key names to the input/output
        // names on the component and update those values on the component.
        factory.inputs.forEach((i) => {
          if (_context[i.propName] !== undefined) {
            componentRef.instance[i.propName] = _context[i.propName];
          }
        });
      }),
    );

    // This function will be returned to the caller, to be called when their context is destroyed
    const detach = () => {
      if (!vcr) {
        this.appRef.detachView(componentRef.hostView);
      }
      componentRef.destroy();
      unsubs.map((u) => {
        if (!u.closed) {
          u.unsubscribe();
        }
      });
    };

    // This function will be returned to the caller, to be called when there are new values for the inputs
    const next = (data: any) => {
      context$.next(data);
    };

    return {
      detach,
      next,
    };
  }

  /**
   * Same as `createComponent` function, but wraps call in a promise
   */
  createComponentAsync(
    compiledModule: NgModuleFactory<any>,
    injector: Injector,
    vcr?: ViewContainerRef,
    context: { [key: string]: any } = {},
  ): Promise<ICreatedComponentInterface> {
    return new Promise((res, rej) => {
      res(this.createComponent(compiledModule, injector, vcr, context));
    });
  }

  // Internal function to add event emitters for each of the provide outputs
  _wireOutputs(
    factory: ComponentFactory<any>,
    componentRef: any,
    context: { [key: string]: any },
  ): Array<Subscription> {
    const unsubs: Subscription[] = [];
    factory.outputs.forEach((o) => {
      if (context[o.propName] && context[o.propName] instanceof Function) {
        unsubs.push(componentRef.instance[o.propName].subscribe(context[o.propName]));
      }
    });
    return unsubs;
  }
}

function checkNotEmpty(value: any, exportName: string): any {
  if (!value) {
    throw new Error(`Cannot find '${exportName}'`);
  }
  return value;
}

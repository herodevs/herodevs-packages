import {
  ApplicationRef,
  Compiler,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  Injectable,
  Injector,
  NgModuleFactory,
  NgModuleRef,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';

export interface InternalNgModuleRef<T> extends NgModuleRef<T> {
  _bootstrapComponents: Type<any>[];
}

export interface ICreatedComponentInterface {
  next: (data: { [key: string]: any }) => void;
  detach: () => void;
  componentRef: ComponentRef<any>;
}

export interface ICreatedModule {
  moduleRef: InternalNgModuleRef<any>;
  componentRef?: ICreatedComponentInterface;
}

interface CreateComponentOptions {
  module?: NgModuleRef<any>;
  context?: { [key: string]: any };
  vcr?: ViewContainerRef;
}

interface CreateAttachModuleOptions {
  context?: { [key: string]: any };
  vcr?: ViewContainerRef;
}

@Injectable({
  providedIn: 'root',
})
export class DynamicComponentService {
  constructor(
    private _compiler: Compiler,
    private cfr: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
  ) {}

  /**
   *
   * @param compiledModule - This is a module that is compiled by the JIT or AOT compiler
   * @param injector - An injector that the
   */
  createModuleSync(compiledModule: NgModuleFactory<any>, injector: Injector): ICreatedModule {
    // Now that the module is loaded and compiled, create an instance of it.
    const moduleRef = compiledModule.create(injector) as InternalNgModuleRef<any>;

    return {
      moduleRef,
    };
  }

  createModuleAsync(compiledModule: NgModuleFactory<any>, injector: Injector): Promise<ICreatedModule> {
    return new Promise((res, rej) => {
      try {
        res(this.createModuleSync(compiledModule, injector));
      } catch {
        rej();
      }
    });
  }

  createAndAttachModuleSync(
    compiledModule: NgModuleFactory<any>,
    injector: Injector,
    { vcr, context = {} }: CreateAttachModuleOptions = {},
  ): ICreatedModule {
    // Create an instance of the module from the moduleFactory
    const createdModule = this.createModuleSync(compiledModule, injector);

    // Take the bootstrap component from that module.
    const type = createdModule.moduleRef._bootstrapComponents[0];

    // The first time they try this and screw up, they will get this warning. This won't happen in prod.
    if (!type) {
      warn(`Module '${typeof createdModule.moduleRef}' has no bootstrap component. 
      You must fix this before calling 'dynamicComponentService.createAndAttachModule'.`);
    }

    const createdComponent = this.createAndAttachComponentSync(type, {
      context,
      module: createdModule.moduleRef,
      vcr,
    });

    return {
      moduleRef: createdModule.moduleRef,
      componentRef: createdComponent,
    };
  }

  createAndAttachModuleAsync(
    compiledModule: NgModuleFactory<any>,
    injector: Injector,
    { vcr, context = {} }: CreateAttachModuleOptions = {},
  ): Promise<ICreatedModule> {
    return new Promise((res, rej) => {
      try {
        res(this.createAndAttachModuleSync(compiledModule, injector, { vcr, context }));
      } catch {
        rej('Error created and attaching module async.');
      }
    });
  }

  private getComponentFactory(type: any, module?: NgModuleRef<any>): ComponentFactory<any> {
    if (module) {
      return module.componentFactoryResolver.resolveComponentFactory(type);
    } else {
      return this.cfr.resolveComponentFactory(type);
    }
  }

  /**
   *
   *
     @param type - A type of a component that we want to create.
   * @param injector - The injector from the parent container component.
   * @param vcr - The view container ref from the calling component.
   * @param context - An object that has properties that match the Input and Output names from the
   *                  component that is being created.
   * @param module - For components that were not lazily loaded, the type existed a build and thus, the
   *                 ViewContainerRef will have access to it's factory. But for those that were
   *                 lazily loaded, we will need to get their factory from the module that they are
   *                 declared in (which module was also lazily loaded and compiled, during which
   *                 process it received access to the components factory).
   */
  createAndAttachComponentSync(
    type: any,
    { context, module, vcr }: CreateComponentOptions = {},
  ): ICreatedComponentInterface {
    // Use the module to get the component factory, so that we can create an instance of the component.
    const factory = this.getComponentFactory(type, module);

    // Create an instance of the component, and add it to the DOM
    let componentRef;
    if (vcr) {
      // This call to createComponent will create and attach the instance to the vcr (the view element).
      componentRef = vcr.createComponent(factory);
    } else {
      // Manually create an instance of the component
      componentRef = factory.create(this.injector);

      // Attach it to the app
      this.appRef.attachView(componentRef.hostView);

      // Attach the instance to the end of the body
      document.body.appendChild((componentRef.hostView as any).rootNodes[0]);
      warn(`Since no 'ViewContainerRef' was provided to 'DynamicComponentService.createAndAttachComponent',
          the component is being attached to the root of the <body>. This is not recommended.`);
    }

    // Take the context and search for keys that match the names of the outputs
    // on the component. Track the
    const subscriptions = this._wireOutputs(factory, componentRef, context);

    // Place the incoming context into a stream. This stream will be returned to the caller,
    // and the caller can send in a new context at will by calling `.next(newContact)` on
    // this BehaviorSubject.
    const context$ = new BehaviorSubject(context);

    // Subscribe to the new observable for updated input values
    subscriptions.push(
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
      // We only need to manually detach if we didn't get a vcr
      if (!vcr) {
        this.appRef.detachView(componentRef.hostView);
      }

      // Destroy our instance of the component
      componentRef.destroy();

      // Go through each subscription from the context and unsubscribe
      subscriptions.map((s: Subscription) => {
        if (!s.closed) {
          s.unsubscribe();
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
      componentRef,
    };
  }

  /**
   * Same as `createComponent` function, but wraps call in a promise
   */
  createAndAttachComponentAsync(
    type: any,
    { context, module, vcr }: CreateComponentOptions = {},
  ): Promise<ICreatedComponentInterface> {
    return new Promise((res, rej) => {
      try {
        res(this.createAndAttachComponentSync(type, { context, module, vcr }));
      } catch {
        rej('Error creating component async');
      }
    });
  }

  // Internal function to add event emitters for each of the provided outputs
  private _wireOutputs(
    factory: ComponentFactory<any>,
    componentRef: any,
    context: { [key: string]: any },
  ): Array<Subscription> {
    const subscriptions: Subscription[] = [];
    factory.outputs.forEach((o) => {
      if (context[o.propName] && context[o.propName] instanceof Function) {
        subscriptions.push(componentRef.instance[o.propName].subscribe(context[o.propName]));
      }
    });
    return subscriptions;
  }
}

function checkNotEmpty(value: any, exportName: string): any {
  if (!value) {
    throw new Error(`Cannot find '${exportName}'`);
  }
  return value;
}

function warn(msg) {
  console.warn(msg.replace(/\s{2,}/g, ' '));
}

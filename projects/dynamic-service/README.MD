# DynamicComponentService

A service that makes dynamically creating components easy.

When you use DynamicComponentService to create a component, you are given
backed an `ICreatedComponentInterface` which allows you to do the
following three things:

- `.next()` - Push new data into the component's Inputs, as well
  as provide callbacks for the Outputs. This is how you pass new
  down into the created component.
- `.detach()` - Allows you to detach the component from the DOM
  as well as destroys the component. This is how you destroy the
  created component.
- `.componentRef` - This is a pointer to the created component.
  This is of type `ComponentRef`. In other words, this is the
  instance of the component that is returned when you call `new`
  on the class definition. The `.componentRef` is the `this` of
  the component.

### How to use it

#### Installation

Start by installing it correctly:

```bash
npm install @herodevs/dynamic-af
```

#### Inject the Service

Now you need to inject the service into your component, or into
another service of your own. You do that by adding it to the
constructor of your component/service, like so:

```typescript
export class MyCoolComponent {
  constructor(private dynamicService: DynamicComponentService) {
    // ...
  }
}
```

#### Call `createAndAttachComponentSync`

Now that you have the service, you can call the `createAndAttachComponentSync`
method to create a component and have it attached to the DOM.
Here is an example of what that looks like:

```typescript
const ref = dynamicService.createAndAttachComponentSync(FooComponent, { vcr: this.viewContainerRef });
```

You must pass the `createAndAttachComponentSync` method two
parameters. First, you need to pass the class of the component
that you want to dynamically create. The second is an
object that matches the `CreateComponentOptions` interface:

```typescript
interface CreateComponentOptions {
  module?: NgModuleRef<any>;
  context?: { [key: string]: any };
  vcr?: ViewContainerRef;
}
```

Here are what each of those represents:

- `vcr (optional, but not really)` - This is the `ViewContainerRef`
  where you want to attach the createdComponent. If you don't
  provide a `vcr`, the service will have no choice but to attach
  your component to the bottom of the `document.body`. So it
  is recommended that you DEFINITELY provide a `vcr`.
- `context (optional)` - This is an object that has keys
  that match the names of the Inputs/Outputs of the component
  being created. If your component being created has an
  input named `name`, then you can pass a `context` with
  a `name` property to provide a name. Eg: `{name: 'Your Name'}`.
  This will pass the value `Your Name` into the Input
  of you component.
- `module (optional)` - This is a reference to the module
  that the component belongs to. You only need to pass this
  if you manually lazily loaded the component and module.
  Otherwise you can not pass this.

#### Updating input/output values

Once you have the `ref` to your created component, you can
call `next(newContext)` to pass in new values to your
inputs/outputs of your component. Here is an example of
updating an input value one second for a component
that has `@Input() count`:

```typescript
const ref = dynamicService.createAndAttachComponentSync(FooComponent, { vcr: this.viewContainerRef });

let count = 0;
ref.next({ count: count++ });

setInterval(() => {
  ref.next({ count: count++ });
}, 1000);
```

Once a second the created component will get a new `count`
via it's input.

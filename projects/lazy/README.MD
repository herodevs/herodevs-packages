# `<hero-loader>` for lazy loading in Angular

Every Angular app is different and has different needs. Yet Angular only provides
one method for lazily loading code: using the `loadChildren` piece in the routes
for any given module. By using the `loadChildren` piece of a route, you are telling
Angular and the Angular CLI to help you out and lazily load that piece of the app
when the associated route is hit. This is a very efficient tool that we should
all be using.

#### HOWEVER!!!

Some of us need more flexibility when lazily loading modules. Some modules need
to be triggered to load on events BESIDES route change. Maybe a `click` or a
`mouseover`. Maybe when the user has admin rights, or when they don't have
admin rights. This is why we built `<hero-loader>`. Using this component, combined
with an `ngIf`, you can trigger lazy loading of a module for just about any
scenario that you can think of.

#### How does it work?

To do this, we utilize the exact same pieces of Angular that `loadChildren` from
routes uses. But we do it in a different way. Let's look at how it works.

## Getting Started

Start by installing the right node module:

```bash
npm install @herodevs/hero-loader
```

At this point, we have all that we need to get started. We only need to do some
configuring. We need to do the following:

1. Tell Angular to create a separate bundle for the module that we intend to
   lazy load.
2. Import `HeroLoaderModule` where we intend to use this lazy loading.
3. Tell `<hero-loader>` to load that bundle when needed.

Let's do this one at a time.

### Create a separate bundle for our module

Open your `angular.json` file. In that file, look for the nested property
`projects.<your-project-name>.architect.build.options` where `<your-project-name>`
is the name of your project. Once you have the build options property in
sight, add the `lazyModules` property to the options:

```json
 "options": {
    ...
    "lazyModules": [ "src/app/test/test.module" ]
 }
```

In the above example, you are telling the Angular CLI to prepare a separate
bundle for `TestModule` in the file `src/app/test/test.module.ts`. You will
notice that this looks a lot like the `loadChildren` syntax for a route.
That's because this `lazyModules` property is doing the same thing that
the `loadChildren` property does in a route. Now the Angular CLI knows to
create a separate bundle for the `TestModule`.

### Import `HeroLoaderModule`

In your app, you need to add `HeroLoaderModule` to the imports of one of your
app's NgModules

```typescript
@NgModule({
  imports: [HeroLoaderModule],
})
export class AppModule {}
```

Now your app knows about the `HeroLoaderModule` and you can use the `<hero-loader>`
component to lazy load the `TestModule`.

### Use `<hero-loader>` in our app

The following is an example of how to use `<hero-loader>` to load our `TestModule`.

```html
<div (mouseover)="load = true">Hover to load TestModule</div>
<hero-loader *ngIf="load" moduleName="src/app/test/test.module#TestModule"></hero-loader>
```

When you hover the `<div>` above, the `ngIf` will turn on the `<hero-loader>` component
which will then load the `TestModule` and it will use whatever component is
listed in the `TestModule.bootstrap` property and attach that component to the
inside of the `<hero-loader>` component.

Consider that `TestModule` looks as follows:

```typescript
@NgModule({
  declarations: [TestComponent],
  bootstrap: [TestComponent],
})
export class TestModule {}
```

Using `<hero-loader>` to load the `TestModule` will render the `TestComponent` inside of the
the `<hero-loader>` component that you added to your template.

## Question

- [Report an Issue](https://github.com/herodevs/herodevs-packages/issues)
- [View Past Issues](https://github.com/herodevs/herodevs-packages/issues?utf8=%E2%9C%93&q=is%3Aissue+is%3Aclosed+)

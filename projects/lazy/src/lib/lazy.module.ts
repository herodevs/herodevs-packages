import { NgModule, NgModuleFactoryLoader, SystemJsNgModuleLoader } from '@angular/core';
import { LazyAFDirective } from './lazy-af.directive';

@NgModule({
  imports: [],
  declarations: [LazyAFDirective],
  exports: [LazyAFDirective],
  providers: [{ provide: NgModuleFactoryLoader, useClass: SystemJsNgModuleLoader }],
})
export class LazyModule {}

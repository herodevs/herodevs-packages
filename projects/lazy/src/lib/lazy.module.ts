import { NgModule, NgModuleFactoryLoader, SystemJsNgModuleLoader } from '@angular/core';
import { LazyAFComponent } from './lazy-af.component';

@NgModule({
  imports: [],
  declarations: [LazyAFComponent],
  exports: [LazyAFComponent],
  providers: [{ provide: NgModuleFactoryLoader, useClass: SystemJsNgModuleLoader }],
})
export class LazyModule {}

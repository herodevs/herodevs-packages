import { NgModule, NgModuleFactoryLoader, SystemJsNgModuleLoader } from '@angular/core';
import { HeroLoaderDirective } from './hero-loader.directive';

@NgModule({
  imports: [],
  declarations: [HeroLoaderDirective],
  exports: [HeroLoaderDirective],
  providers: [{ provide: NgModuleFactoryLoader, useClass: SystemJsNgModuleLoader }],
})
export class HeroLoaderModule {}

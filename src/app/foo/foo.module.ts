import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeroLoaderModule } from '@herodevs/hero-loader';
import { SharedModule } from '../shared/shared.module';
import { FooComponent } from './components/foo/foo.component';

@NgModule({
  imports: [CommonModule, RouterModule, SharedModule, HeroLoaderModule],
  declarations: [FooComponent],
  exports: [FooComponent],
})
export class FooModule {}

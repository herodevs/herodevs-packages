import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LazyAFComponent } from './components/lazy/lazy.component';

@NgModule({
  imports: [CommonModule],
  declarations: [LazyAFComponent],
  exports: [LazyAFComponent],
})
export class SharedModule {}

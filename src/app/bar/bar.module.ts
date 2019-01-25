import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BarComponent } from './components/bar/bar.component';

const routes: Routes = [
  {
    path: '',
    component: BarComponent,
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  declarations: [BarComponent],
  bootstrap: [BarComponent],
})
export class BarModule {}

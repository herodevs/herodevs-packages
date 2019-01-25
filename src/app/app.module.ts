import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { FooComponent } from './foo/components/foo/foo.component';
import { FooModule } from './foo/foo.module';

const routes: Routes = [
  {
    path: '',
    component: FooComponent,
  },
];

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, FooModule, RouterModule.forRoot(routes)],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-foo',
  template: `
    <p>
      foo works!
    </p>
    <div (mouseover)="load = true">
      Hello
      <lazy-af *ngIf="load" [moduleName]="moduleName"></lazy-af>
    </div>
  `,
  styles: [],
})
export class FooComponent implements OnInit {
  moduleName = 'src/app/bar/bar.module#BarModule';
  load = false;

  constructor() {}

  ngOnInit() {}
}

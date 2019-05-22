import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-foo',
  template: `
    <p>
      foo works!
    </p>
    <div (mouseover)="load = !load">
      Hello
      <hero-loader *ngIf="load" [moduleName]="moduleName" (init)="saveComponentRef($event)"></hero-loader>
    </div>
  `,
  styles: [],
})
export class FooComponent implements OnInit {
  moduleName = 'src/app/bar/bar.module#BarModule';
  load = false;

  constructor() {}

  ngOnInit() {}

  saveComponentRef(ref) {
    let num = 0;
    setInterval(() => {
      ref.next({ num: num++ });
    }, 1000);
  }
}

import { Component, Input, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-bar',
  template: `
    <p>bar loaded! {{ num }}</p>
  `,
  styles: [],
})
export class BarComponent implements OnInit, OnDestroy {
  @Input() num = 0;

  constructor() {}

  ngOnInit() {}

  ngOnDestroy() {
    console.log('destroying barcomponent');
  }
}

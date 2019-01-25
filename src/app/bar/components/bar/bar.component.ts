import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bar',
  template: `
    <p>
      bar loaded!
    </p>
  `,
  styles: [],
})
export class BarComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}

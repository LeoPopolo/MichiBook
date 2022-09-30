import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pages',
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
  `
})
export class PagesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

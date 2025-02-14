import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  imports: [],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css'
})

export class LandingPageComponent {
  toggletoSignUp() {
    this.router.navigate(['/sign-up'])
  }
  constructor(private router : Router){

  }
  toggletoLogin() {
    this.router.navigate(['/login'])
  }
}

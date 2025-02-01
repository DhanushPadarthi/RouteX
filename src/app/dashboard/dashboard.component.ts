import { Component } from '@angular/core';
import { Router, RouterOutlet} from '@angular/router';
import { LoginComponent } from "../login/login.component";

@Component({
  selector: 'app-dashboard',
  imports: [RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  currentUserName: any;

  constructor(private router:Router){
    this.currentUserName = localStorage.getItem('username')
  }

  loggout() {
    localStorage.removeItem('username')
    this.router.navigate(['/landing-page'])
  }

  toggletoGoogleMap() {
    this.router.navigate(['/dashboard/google-maps'])
  }
  toogletohome() {
    this.router.navigate(['/dashboard/home'])
  }

  toggletoMap() {
    this.router.navigate(['/dashboard/map'])
  }
}

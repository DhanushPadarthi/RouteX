import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { environment } from './services/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(
    private router: Router,
    private renderer: Renderer2  // Inject Renderer2
  ) {}

  ngOnInit() {
    
  }

  toggletoLogin() {
    this.router.navigate(['/login']);
  }

}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../services/login';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [FormsModule, HttpClientModule],
  providers : [LoginService],
  templateUrl: './login.component.html',
  standalone: true,
  styleUrl: './login.component.css'
})

export class LoginComponent {
  toggletoSignup() {
    this.router.navigate(['/sign-up'])
  }
  username : string = '';
  password : string = '';
  constructor(private router : Router,
    private loginService : LoginService
  ){
    
  }
  toggletodashboard() {
    this.router.navigate(['/dashboard'])
  }

  login(username: string, password: string) {
    this.loginService.login(username, password).subscribe({
      next: (response: any) => {
        console.log('Login successful:', response);
  
        const userId = response.user.username; 
        // Set token and user ID in local storage
        localStorage.setItem('username', userId.toString()); // Convert to string if it's not
        this.toggletodashboard();
      },
      error: (error) => {
        console.error('Login failed:', error);
        alert('Invalid username or password. Please try again.');
      }
    });
  }
  
}

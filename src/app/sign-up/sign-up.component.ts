import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../services/login';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-sign-up',
  providers : [LoginService],
  imports: [FormsModule, HttpClientModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  toggletoLogin() {
    this.router.navigate(['/login'])
  }
  constructor(private signupservice : LoginService,
    private router : Router
  ){

  }
  username: any;
  password: any;
  confirmpassword: any;

  signup() {
    if(this.password==this.confirmpassword){
      this.signupservice.signup(this.username, this.password).subscribe({
        next: (response : any) =>{
          this.router.navigate(['/login'])
        },
        error : (error:any) =>{
          console.log('Invalid response from backend', error);
          alert(error.error.error)
        }
      })
    }else{
      alert('Password and confirm password are not matched, Plese try again')
    }
  }


}

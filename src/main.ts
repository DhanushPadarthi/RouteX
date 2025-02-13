import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { Routes, provideRouter } from '@angular/router';
import { LoginComponent } from './app/login/login.component';
import { LandingPageComponent } from './app/landing-page/landing-page.component';
import { DashboardComponent } from './app/dashboard/dashboard.component';
import { SignUpComponent } from './app/sign-up/sign-up.component';
import { MapComponent } from './app/map/map.component';
import { Map } from 'leaflet';
import { GoogleMapComponent } from './app/google-map/google-map.component';
import { HomeComponent } from './app/home/home.component';
import { AuthGuard } from './app/auth.guard';
import { AnalyticsComponent } from './app/analytics/analytics.component';


 const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'landing-page', component: LandingPageComponent },
  { path: 'sign-up', component: SignUpComponent },
  { 
    path: 'dashboard', component: DashboardComponent, canActivate : [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent }, // Default dashboard content
      { path: 'map', component: MapComponent }, // Map route
      { path: 'google-maps', component: GoogleMapComponent }, // G-Map route
      { path: 'analytics', component: AnalyticsComponent }, 
    ]
  }
];





 
 bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)]
 }).catch(err => console.error(err));
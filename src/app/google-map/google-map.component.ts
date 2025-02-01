import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MapService } from '../services/map.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-google-map',
  imports: [FormsModule, HttpClientModule],
  providers : [MapService],
  templateUrl: './google-map.component.html',
  styleUrl: './google-map.component.css',
  
})
export class GoogleMapComponent implements OnInit {

  map: google.maps.Map | undefined;
  directionsService: google.maps.DirectionsService | undefined;
  directionsRenderer: google.maps.DirectionsRenderer | undefined;

  startLocation: string = '';
  destinationLocation: string = '';


  constructor(private mapservice : MapService){

  }

  ngOnInit(): void {
    // Initialize the map
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: { lat: 37.7749, lng: -122.4194 }, // Default center (San Francisco)
      zoom: 13,
    });

    // Initialize Directions services
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();
    this.directionsRenderer.setMap(this.map);
  }

  calculateRoute(): void {
    if (this.startLocation && this.destinationLocation) {

      const currentUserName : any = localStorage.getItem('username')

    
      this.mapservice.sethistory(this.startLocation, this.destinationLocation, 'GoogleMap', currentUserName).subscribe({
        next: (resposne : any) =>{
          console.log('success')
          alert('data saved succesfully')
        },
        error : (error : any) => {
          console.error('Setting record failed:', error);
          alert('Invalid arguments. Please try again.');
        }
      })


      const request: google.maps.DirectionsRequest = {
        origin: this.startLocation,
        destination: this.destinationLocation,
        travelMode: google.maps.TravelMode.DRIVING, 
      };

      this.directionsService?.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          this.directionsRenderer?.setDirections(result);
        } else {
          alert('Unable to find the route. Please check the locations.');
        }
      });
    } else {
      alert('Please enter both start and destination locations.');
    }
  }
}

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
  circle: any;
  allCoordinates: any;


  constructor(private mapservice : MapService){

  }

  ngOnInit(): void {
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: { lat: 17.6868, lng: 83.2185 },
      zoom: 10,
    });

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();
    this.directionsRenderer.setMap(this.map);

  }

  getCoordinatesInsideCircle(): void {
    if (!this.circle || !this.map) return;

    const bounds = this.circle.getBounds();
    if (!bounds) return;

    this.allCoordinates = [];

   
    for (let lat = bounds.getSouthWest().lat(); lat <= bounds.getNorthEast().lat(); lat += 0.01) {
      for (let lng = bounds.getSouthWest().lng(); lng <= bounds.getNorthEast().lng(); lng += 0.01) {
        const point = new google.maps.LatLng(lat, lng);
        if (google.maps.geometry.spherical.computeDistanceBetween(point, this.circle.getCenter()!) <= this.circle.getRadius()) {
          this.allCoordinates.push(point);
        }
      }
    }

    console.log('Coordinates inside the circle:', this.allCoordinates);
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


      const request: any = {
        origin: this.startLocation,
        destination: this.destinationLocation,
        travelMode: google.maps.TravelMode.DRIVING, 
      };

      const request2: any = {
        origin: this.startLocation,
        destination: this.destinationLocation,
        travelMode: google.maps.TravelMode.WALKING, 
      };

      this.directionsService?.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          this.directionsRenderer?.setDirections(result);
        } else {
          alert('Unable to find the route. Please check the locations.');
        }
      });


      this.directionsService?.route(request2, (result, status) => {
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

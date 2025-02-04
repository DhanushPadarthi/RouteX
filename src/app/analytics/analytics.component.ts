import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MapService } from '../services/map.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { CoordinatesService } from '../services/Flask/GoogleCoordinates.service';

@Component({
  selector: 'app-analytics',
  imports: [FormsModule, HttpClientModule, CommonModule],
  providers : [MapService, CoordinatesService],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css'
})
export class AnalyticsComponent implements OnInit {
  map: google.maps.Map | undefined;
  directionsService: google.maps.DirectionsService | undefined;
  directionsRenderer: google.maps.DirectionsRenderer | undefined;

  startLocation: string = '';
  destinationLocation: string = '';
  circle: any;
  allCoordinates: any = [];
  showTable: boolean = false;  // Track the visibility of the table

  constructor(private mapservice: MapService, private coordService : CoordinatesService) {}

  ngOnInit(): void {
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: { lat: 17.6868, lng: 83.2185 },
      zoom: 10,
    });
  
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();
    this.directionsRenderer.setMap(this.map);
  
    this.createDraggableCircle(); // Circle gets created here
  }
  
  createDraggableCircle(): void {
    if (!this.map) return;
  
    this.circle = new google.maps.Circle({
      strokeColor: 'blue',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: 'blue',
      fillOpacity: 0.25,
      map: this.map,
      center: { lat: 17.6868, lng: 83.2185 },
      radius: 5000,
      draggable: true,
      editable: true,
    });
  
    google.maps.event.addListener(this.circle, 'radius_changed', () => {
      this.getCoordinatesInsideCircle();
    });
  
    google.maps.event.addListener(this.circle, 'center_changed', () => {
      this.getCoordinatesInsideCircle();
    });
  
    // Ensure initial coordinates are populated only after the circle is ready
    setTimeout(() => {
      this.getCoordinatesInsideCircle();
      console.log('Initial coordinates:', this.allCoordinates);
    }, 1000);
  }
  
  getCoordinatesInsideCircle(): void {
    if (!this.circle || !this.map) return;
  
    const bounds = this.circle.getBounds();
    if (!bounds) return;
  
    this.allCoordinates = []; 
  
    for (let lat = bounds.getSouthWest().lat(); lat <= bounds.getNorthEast().lat(); lat += 0.01) {
      for (let lng = bounds.getSouthWest().lng(); lng <= bounds.getNorthEast().lng(); lng += 0.01) {
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(lat, lng),
          this.circle.getCenter()!
        );
  
        if (distance <= this.circle.getRadius()) {
          this.allCoordinates.push({ lat: lat, lng: lng });
        }
      }
    }
  
    console.log('Coordinates inside the circle:', this.allCoordinates);
  }

  

  toggleTable(): void {
    this.showTable = !this.showTable;
  
    if (this.allCoordinates.length > 0) {
      this.coordService.getCityNames(this.allCoordinates).subscribe({
        next: (response: any) => {
          console.log('City Names:', response.cities);
        },
        error: (error: any) => {
          console.error('Error fetching cities:', error);
        }
      });
    } else {
      console.log('No coordinates available.');
    }
  }
  
  
  calculateRoute(): void {
    if (this.startLocation && this.destinationLocation) {

      const currentUserName: any = localStorage.getItem('username');

      this.mapservice.sethistory(this.startLocation, this.destinationLocation, 'GoogleMap', currentUserName).subscribe({
        next: (response: any) => {
          console.log('success');
          alert('data saved successfully');
        },
        error: (error: any) => {
          console.error('Setting record failed:', error);
          alert('Invalid arguments. Please try again.');
        }
      });

      const request: any = {
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

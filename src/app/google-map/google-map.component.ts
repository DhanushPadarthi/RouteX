import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MapService } from '../services/map.service';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-google-map',
  imports: [FormsModule, HttpClientModule],
  providers: [MapService],
  templateUrl: './google-map.component.html',
  styleUrl: './google-map.component.css',
})
export class GoogleMapComponent implements OnInit {
  map: google.maps.Map | undefined;
  directionsService: google.maps.DirectionsService | undefined;
  directionsRenderer: google.maps.DirectionsRenderer | undefined;

  startLocation: string = '';
  destinationLocation: string = '';
  startMarker: google.maps.Marker | undefined;
  destinationMarker: google.maps.Marker | undefined;
  startCircle: google.maps.Circle | undefined;
  destinationCircle: google.maps.Circle | undefined;

  constructor(private mapservice: MapService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: { lat: 17.6868, lng: 83.2185 },
      zoom: 10,
    });

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();
    this.directionsRenderer.setMap(this.map);

    // Add zoom change listener
    this.map.addListener('zoom_changed', () => {
      this.updateCyberEffects();
    });

    // Check if parameters exist
    this.route.params.subscribe((params) => {
      if (params['startLocation'] && params['endLocation']) {
        this.startLocation = params['startLocation'];
        this.destinationLocation = params['endLocation'];
        this.calculateRoute();
      }
    });
  }

  calculateRoute(): void {
    if (this.startLocation && this.destinationLocation) {
      const currentUserName: any = localStorage.getItem('username');

      this.mapservice
        .sethistory(this.startLocation, this.destinationLocation, 'GoogleMap', currentUserName)
        .subscribe({
          next: (resposne: any) => {
            console.log('success');
            alert('data saved successfully');
          },
          error: (error: any) => {
            console.error('Setting record failed:', error);
            alert('Invalid arguments. Please try again.');
          },
        });

      const request: any = {
        origin: this.startLocation,
        destination: this.destinationLocation,
        travelMode: google.maps.TravelMode.DRIVING,
      };

      this.directionsService?.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          this.directionsRenderer?.setDirections(result);

          // Add cyber representation for start and destination
          const startPoint = result.routes[0].legs[0].start_location;
          const endPoint = result.routes[0].legs[0].end_location;

          this.addCyberMarker(startPoint, 'Start');
          this.addCyberMarker(endPoint, 'Destination');
        } else {
          alert('Unable to find the route. Please check the locations.');
        }
      });
    } else {
      alert('Please enter both start and destination locations.');
    }
  }

  addCyberMarker(position: google.maps.LatLng, label: string): void {
    const marker = new google.maps.Marker({
      position: position,
      map: this.map,
      label: label,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#00FFFF', // Neon cyan color
        fillOpacity: 0.8,
        strokeColor: '#00FFFF',
        strokeWeight: 2,
        scale: this.getMarkerSize(), // Dynamic size based on zoom
      },
    });

    const circle = new google.maps.Circle({
      map: this.map,
      center: position,
      radius: this.getCircleRadius(), // Dynamic radius based on zoom
      fillColor: '#00FFFF',
      fillOpacity: 0.1,
      strokeColor: '#00FFFF',
      strokeOpacity: 0.5,
      strokeWeight: 2,
    });

    // Pulsating effect
    setInterval(() => {
      const radius = circle.getRadius() || 0;
      const maxRadius = this.getCircleRadius() * 1.5; // Max radius based on zoom
      if (radius > maxRadius) {
        circle.setRadius(this.getCircleRadius());
      } else {
        circle.setRadius(radius + this.getCircleRadius() * 0.1);
      }
    }, 500);

    if (label === 'Start') {
      this.startMarker = marker;
      this.startCircle = circle;
    } else {
      this.destinationMarker = marker;
      this.destinationCircle = circle;
    }
  }

  updateCyberEffects(): void {
    if (this.startMarker && this.startCircle) {
      this.startMarker.setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#00FFFF',
        fillOpacity: 0.8,
        strokeColor: '#00FFFF',
        strokeWeight: 2,
        scale: this.getMarkerSize(), // Update marker size
      });
      this.startCircle.setRadius(this.getCircleRadius()); // Update circle radius
    }

    if (this.destinationMarker && this.destinationCircle) {
      this.destinationMarker.setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#00FFFF',
        fillOpacity: 0.8,
        strokeColor: '#00FFFF',
        strokeWeight: 2,
        scale: this.getMarkerSize(), // Update marker size
      });
      this.destinationCircle.setRadius(this.getCircleRadius()); // Update circle radius
    }
  }

  getMarkerSize(): number {
    if (!this.map) return 8; // Default size
    const zoom = this.map.getZoom() || 10;
    return Math.max(4, zoom * 0.8); // Adjust size based on zoom
  }

  getCircleRadius(): number {
    if (!this.map) return 500; // Default radius in meters
    const zoom = this.map.getZoom() || 10;
    return Math.max(400, zoom * 100); // Adjust radius based on zoom
  }
}
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MapService } from '../services/map.service';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-google-map',
  standalone: true,
  imports: [FormsModule, HttpClientModule],
  providers: [MapService],
  templateUrl: './google-map.component.html',
  styleUrl: './google-map.component.css',
})
export class GoogleMapComponent implements OnInit {
updateRoutePreference(arg0: string) {
throw new Error('Method not implemented.');
}
updateTravelMode(arg0: string) {
throw new Error('Method not implemented.');
}
  map: google.maps.Map | undefined;
  directionsService: google.maps.DirectionsService | undefined;
  directionsRenderer: google.maps.DirectionsRenderer | undefined;
  userLocation: { lat: number; lng: number } | null = null;
  userMarker: google.maps.Marker | undefined;
  outerCircle: google.maps.Circle | undefined;
  radarWaves: google.maps.Circle[] = [];

  startLocation: string = '';
  destinationLocation: string = '';
  selectedTravelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING;
  routePreference: { avoidTolls?: boolean; avoidHighways?: boolean } = {};

  startMarker: google.maps.Marker | undefined;
  destinationMarker: google.maps.Marker | undefined;
  startCircle: google.maps.Circle | undefined;
  destinationCircle: google.maps.Circle | undefined;

  constructor(private mapservice: MapService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: { lat: 37.7749, lng: -122.4194 },
      zoom: 13,
    });

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();
    this.directionsRenderer.setMap(this.map);

    this.getUserLocation();

    // Update marker effects based on zoom
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

  getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          this.map?.setCenter(this.userLocation);
          
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: this.userLocation }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results?.[0]?.formatted_address) {
              this.startLocation = results[0].formatted_address;
            } else {
              this.startLocation = `${this.userLocation?.lat ?? 0}, ${this.userLocation?.lng ?? 0}`;
            }
          });

          this.drawUserMarker();
          this.startRadarEffect();
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Location access denied. Enable it to set your start location.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  drawUserMarker(): void {
    if (!this.userLocation || !this.map) return;

    this.userMarker = new google.maps.Marker({
      position: this.userLocation,
      map: this.map,
      title: 'Current Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#0000FF',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#FFFFFF',
      },
    });

    this.outerCircle = new google.maps.Circle({
      strokeColor: '#00BFFF',
      strokeOpacity: 0.5,
      strokeWeight: 1,
      fillColor: '#00BFFF',
      fillOpacity: 0.2,
      map: this.map,
      center: this.userLocation,
      radius: 100,
    });
  }

  startRadarEffect(): void {
    if (!this.userLocation || !this.map) return;

    const waveDuration = 2000;
    const maxRadius = 500;

    setInterval(() => {
      const radarWave = new google.maps.Circle({
        strokeColor: '#0000FF',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#0000FF',
        fillOpacity: 0.3,
        map: this.map,
        center: this.userLocation,
        radius: 0,
      });

      let radius = 0;
      const waveInterval = setInterval(() => {
        if (radius >= maxRadius) {
          radarWave.setMap(null);
          clearInterval(waveInterval);
        } else {
          radius += 10;
          radarWave.setRadius(radius);
          radarWave.setOptions({
            fillOpacity: 0.3 - (radius / maxRadius) * 0.3,
          });
        }
      }, 50);
    }, waveDuration);
  }

  calculateRoute(): void {
    if (this.startLocation && this.destinationLocation) {
      const currentUserName: any = localStorage.getItem('username');

      this.mapservice
        .sethistory(this.startLocation, this.destinationLocation, 'GoogleMap', currentUserName)
        .subscribe({
          next: () => alert('Data saved successfully'),
          error: () => alert('Invalid arguments. Please try again.'),
        });

      const request: any = {
        origin: this.startLocation,
        destination: this.destinationLocation,
        travelMode: this.selectedTravelMode,
      };

      this.directionsService?.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          this.directionsRenderer?.setDirections(result);

          this.addCyberMarker(result.routes[0].legs[0].start_location, 'Start');
          this.addCyberMarker(result.routes[0].legs[0].end_location, 'Destination');
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
      position,
      map: this.map,
      label,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#00FFFF',
        fillOpacity: 0.8,
        strokeColor: '#00FFFF',
        strokeWeight: 2,
        scale: this.getMarkerSize(),
      },
    });

    const circle = new google.maps.Circle({
      map: this.map,
      center: position,
      radius: this.getCircleRadius(),
      fillColor: '#00FFFF',
      fillOpacity: 0.1,
      strokeColor: '#00FFFF',
      strokeOpacity: 0.5,
      strokeWeight: 2,
    });

    if (label === 'Start') {
      this.startMarker = marker;
      this.startCircle = circle;
    } else {
      this.destinationMarker = marker;
      this.destinationCircle = circle;
    }
  }

  updateCyberEffects(): void {
    if (this.startCircle) this.startCircle.setRadius(this.getCircleRadius());
    if (this.destinationCircle) this.destinationCircle.setRadius(this.getCircleRadius());
  }

  getMarkerSize(): number {
    return Math.max(4, (this.map?.getZoom() || 10) * 0.8);
  }

  getCircleRadius(): number {
    return Math.max(400, (this.map?.getZoom() || 10) * 100);
  }
}

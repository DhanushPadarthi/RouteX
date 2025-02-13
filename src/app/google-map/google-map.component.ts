import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MapService } from '../services/map.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-google-map',
  standalone: true,
  imports: [FormsModule, HttpClientModule],
  providers: [MapService],
  templateUrl: './google-map.component.html',
  styleUrl: './google-map.component.css',
})
export class GoogleMapComponent implements OnInit {
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

  constructor(private mapservice: MapService) {}

  ngOnInit(): void {
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: { lat: 37.7749, lng: -122.4194 }, // Default: San Francisco
      zoom: 13,
    });

    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer();
    this.directionsRenderer.setMap(this.map);

    this.getUserLocation();
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
          console.error("Error getting location:", error);
          alert("Location access denied. Enable it to set your start location.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }

  drawUserMarker(): void {
    if (!this.userLocation || !this.map) return;

    // Small thick blue circle (Main Marker)
    this.userMarker = new google.maps.Marker({
      position: this.userLocation,
      map: this.map,
      title: "Current Location",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8, 
        fillColor: "#0000FF",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#FFFFFF",
      },
    });

    // Outer Light Blue Circle
    this.outerCircle = new google.maps.Circle({
      strokeColor: "#00BFFF",
      strokeOpacity: 0.5,
      strokeWeight: 1,
      fillColor: "#00BFFF",
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
        strokeColor: "#0000FF",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#0000FF",
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

      this.mapservice.sethistory(this.startLocation, this.destinationLocation, 'GoogleMap', currentUserName).subscribe({
        next: () => alert('Data saved successfully'),
        error: (error: any) => {
          console.error('Setting record failed:', error);
          alert('Invalid arguments. Please try again.');
        },
      });

      const request: google.maps.DirectionsRequest = {
        origin: this.startLocation,
        destination: this.destinationLocation,
        travelMode: this.selectedTravelMode,
        provideRouteAlternatives: true,
        avoidTolls: this.routePreference.avoidTolls || false,
        avoidHighways: this.routePreference.avoidHighways || false,
      };

      this.directionsService?.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          this.directionsRenderer?.setDirections(result);
        } else {
          alert('Unable to find the route. Please check the locations.');
        }
      });

      // Keep radar effect even after clicking "Get Route"
      this.startRadarEffect();
    } else {
      alert('Please enter both start and destination locations.');
    }
  }

  updateTravelMode(selectedMode: string): void {
    this.selectedTravelMode = google.maps.TravelMode[selectedMode as keyof typeof google.maps.TravelMode];
    this.calculateRoute(); 
  }

  updateRoutePreference(option: string): void {
    this.routePreference = {
      avoidTolls: option === 'avoidTolls',
      avoidHighways: option === 'avoidHighways',
    };
    this.calculateRoute(); 
  }
}

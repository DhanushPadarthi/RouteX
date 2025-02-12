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

  circle: any;
  allCoordinates: any = [];
  showTable: boolean = false;  

  boundFactorSearch = 0.1

  showSocial: boolean = false;
  selectedSocial: string = '';


  toggleSocial() {
    this.showSocial = !this.showSocial;
  }

  selectSocial(social: string) {
    this.selectedSocial = social;
  }

  constructor(private mapservice: MapService, private coordService : CoordinatesService) {}

  ngOnInit(): void {
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: { lat: 17.6868, lng: 83.2185 },
      zoom: 10,
    });

  
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
    });
  
    google.maps.event.addListener(this.circle, 'center_changed', () => {
    });

  }
  
  isLoading: boolean = false;

  toggleTable(): void {
    this.showTable = !this.showTable;
  
    if (this.showTable) {
      this.isLoading = true; 
      this.getCoordinatesInsideCircle();
    }
  }
  
  async getCoordinatesInsideCircle(): Promise<void> {
    if (!this.circle || !this.map) return;
  
    const bounds = this.circle.getBounds();
    if (!bounds) return;
  
    this.allCoordinates = [];
    const coordinates: { lat: number; lng: number }[] = [];
  
    for (let lat = bounds.getSouthWest().lat(); lat <= bounds.getNorthEast().lat(); lat += this.boundFactorSearch) {
      for (let lng = bounds.getSouthWest().lng(); lng <= bounds.getNorthEast().lng(); lng += this.boundFactorSearch) {
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(lat, lng),
          this.circle.getCenter()!
        );
  
        if (distance <= this.circle.getRadius()) {
          coordinates.push({ lat, lng });
        }
      }
    }
  
    await this.processInBatches(coordinates, 5); 
    this.isLoading = false;



  
  }
  
  async processInBatches(coords: { lat: number; lng: number }[], batchSize: number) {
    for (let i = 0; i < coords.length; i += batchSize) {
      const batch = coords.slice(i, i + batchSize);
  
      await Promise.allSettled(batch.map((coord) => this.fetchPlaceName(coord.lat, coord.lng)));
  
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  
  fetchPlaceName(lat: number, lng: number): Promise<void> {
    return new Promise((resolve, reject) => {
      let url = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`;
      url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;

      
  
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.display_name && data.display_name!='') {
            const placeName = data.display_name || "Unknown";
            const importance = data.importance;
            this.allCoordinates.push({ lat, lng, placeName, importance });
          }
          resolve();
        })
        .catch((error) => {
          console.error("Error fetching place name:", error);
          reject();
        });
    });
  }
}

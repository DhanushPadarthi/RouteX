import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import axios from 'axios';
import { FormsModule } from '@angular/forms';
import { MapService } from '../services/map.service';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  imports : [FormsModule, HttpClientModule],
  providers : [MapService]
})

export class MapComponent implements OnInit {
  map!: L.Map;
  startLocation: string = '';
  destinationLocation: string = '';
  routeLayer: L.LayerGroup | null = null;

  constructor(private mapservice : MapService, private route : ActivatedRoute){

  }

  ngOnInit(): void {
    this.map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "© OpenStreetMap contributors",
      }
    ).addTo(this.map);
    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);



    // Check if parameters exist
    this.route.params.subscribe(async params => {
      if (params['startLocation'] && params['endLocation']) {
        this.startLocation = params['startLocation'];
        this.destinationLocation = params['endLocation'];
        await this.calculateRoute();
      }
    });

  }

  async geocode(address: string): Promise<L.LatLng | null> {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
        },
      });

      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        return L.latLng(parseFloat(lat), parseFloat(lon));
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    return null;
  }

  async calculateRoute() {
    if (!this.startLocation || !this.destinationLocation) {
      alert('Please enter both start and destination locations.');
      return;
    }

    const currentUserName : any = localStorage.getItem('username')

    
    this.mapservice.sethistory(this.startLocation, this.destinationLocation, 'NormalMap', currentUserName).subscribe({
      next: (resposne : any) =>{
        console.log('success')
        alert('data saved succesfully')
      },
      error : (error : any) => {
        console.error('Setting record failed:', error);
        alert('Invalid arguments. Please try again.');
      }
    })

    const startCoords = await this.geocode(this.startLocation);
    const destinationCoords = await this.geocode(this.destinationLocation);

    if (!startCoords || !destinationCoords) {
      alert('Unable to find one or both locations.');
      return;
    }

    if (this.routeLayer) {
      this.map.removeLayer(this.routeLayer);
    }
    
    this.routeLayer = L.layerGroup().addTo(this.map);

    const route = L.polyline([startCoords, destinationCoords], {
      color: 'blue',
      weight: 4,
      opacity: 0.7,
    }).addTo(this.routeLayer);


    this.map.fitBounds(route.getBounds());

    L.marker(startCoords).addTo(this.routeLayer).bindPopup('Start: ' + this.startLocation).openPopup();
    L.marker(destinationCoords).addTo(this.routeLayer).bindPopup('Destination: ' + this.destinationLocation);
  }
}


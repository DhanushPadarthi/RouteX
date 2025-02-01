import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { MapService } from '../services/map.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-home',
  imports: [NgFor, NgIf, FormsModule, HttpClientModule],
  providers : [MapService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  // userQueries = [
  //   {
  //     username: 'John Doe',
  //     date: '20-19-2026',
  //     locations: [
  //       { startLocation: 'New York', endLocation: 'San Francisco' },
  //       { startLocation: 'Los Angeles', endLocation: 'Seattle' },
  //       { startLocation: 'Boston', endLocation: 'Miami' },
  //     ],
  //   },
  //   {
  //     userName: 'Jane Smith',
  //     date: '20-19-2026',
  //     locations: [
  //       { startLocation: 'Chicago', endLocation: 'Houston' },
  //       { startLocation: 'Phoenix', endLocation: 'Denver' },
  //       { startLocation: 'Dallas', endLocation: 'Atlanta' },
  //     ],
  //   },
  // ];

  userQueries : any[] = []

  rowsPerPage = 5; 
  rowsPerUser = 2; 
  currentPage = 1;
  paginatedData : any= [];
  totalPages = 1;

  constructor(private mapservice : MapService) {
    this.fetchBackend()
  }

  ngOnInit(): void {
  }

  


  async fetchBackend(){
    this.mapservice.getfullhistory().subscribe({
      next:(response : any) =>{
        console.log('respone printing',response)
        this.userQueries = response.data
        this.updatePagination();
      },
      error : (error:any) => {
        alert(error.error.error)
      }

    })
  }


  updatePagination(): void {
    const processedData = this.userQueries.map((user) => ({
      ...user,
      filteredLocations: user.locations.slice(0, this.rowsPerUser),
    }));
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    const endIndex = startIndex + this.rowsPerPage;
    this.paginatedData  = processedData.slice(startIndex, endIndex);

    this.totalPages = Math.ceil(processedData.length / this.rowsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }
}

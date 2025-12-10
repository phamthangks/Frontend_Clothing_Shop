import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  ModuleRegistry,
  AllCommunityModule,
  provideGlobalGridOptions
} from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);
provideGlobalGridOptions({ theme: 'legacy' });

@Component({
  selector: 'dashboard-ng19-table',
  imports: [AgGridAngular],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent implements OnInit {
  rowData: any[] = [];
  gridApi!: GridApi;

  columnDefs: ColDef[] = [
    { field: 'productId', headerName: 'Product ID', sortable: true, filter: true },
    { field: 'productName', headerName: 'Product Name', sortable: true, filter: true },
    {
      field: 'price',
      headerName: 'Price',
      sortable: true,
      filter: 'agNumberColumnFilter',
      valueFormatter: params => `$${params.value.toFixed(2)}`
    },
    {
      field: 'quantityOrdered',
      headerName: 'Quantity Sold',
      sortable: true,
      filter: 'agNumberColumnFilter'
    },
    { field: 'category', headerName: 'Category', sortable: true, filter: true },
    { field: 'brand', headerName: 'Brand', sortable: true, filter: true },
    { field: 'description', headerName: 'Description', sortable: true, filter: true }
  ];
  

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchTopSellingProducts();
  }

  fetchTopSellingProducts(): void {
    this.http
      .get<any[]>('https://localhost:7163/api/statistics/top5-best-selling-products')
      .subscribe({
        next: (data) => {
          this.rowData = data;
        },
        error: (err) => {
          console.error('Error loading top-selling products:', err);
        },
      });
  }

  onGridReady(evt: any) {
    this.gridApi = evt.api;
  }
}

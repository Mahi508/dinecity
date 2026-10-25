import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Business, BusinessRequest, BusinessStatus, City, GrantRequest, Page, Quote, QuoteRequest, Wall, WallArea } from './models';

export interface SearchParams {
  q?: string;
  cityId?: number | null;
  category?: string;
  cuisine?: string;
  page?: number;
  size?: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  // public
  cities(): Observable<City[]> {
    return this.http.get<City[]>('/api/cities');
  }

  searchBusinesses(p: SearchParams): Observable<Page<Business>> {
    let params = new HttpParams();
    if (p.q) params = params.set('q', p.q);
    if (p.cityId != null) params = params.set('cityId', p.cityId);
    if (p.category) params = params.set('category', p.category);
    if (p.cuisine) params = params.set('cuisine', p.cuisine);
    params = params.set('page', p.page ?? 0).set('size', p.size ?? 12);
    return this.http.get<Page<Business>>('/api/businesses', { params });
  }

  business(id: number): Observable<Business> {
    return this.http.get<Business>(`/api/businesses/${id}`);
  }

  // owner
  myBusinesses(): Observable<Business[]> {
    return this.http.get<Business[]>('/api/owner/businesses');
  }

  createBusiness(req: BusinessRequest): Observable<Business> {
    return this.http.post<Business>('/api/businesses', req);
  }

  updateBusiness(id: number, req: BusinessRequest): Observable<Business> {
    return this.http.put<Business>(`/api/businesses/${id}`, req);
  }

  // admin
  createCity(body: { name: string; state: string; country: string }): Observable<City> {
    return this.http.post<City>('/api/admin/cities', body);
  }

  adminBusinesses(status: BusinessStatus): Observable<Business[]> {
    return this.http.get<Business[]>('/api/admin/businesses', { params: { status } });
  }

  setBusinessStatus(id: number, status: BusinessStatus): Observable<Business> {
    return this.http.put<Business>(`/api/admin/businesses/${id}/status`, { status });
  }

  // pixel wall (public)
  wall(cityId: number): Observable<Wall> {
    return this.http.get<Wall>(`/api/cities/${cityId}/wall`);
  }

  quote(cityId: number, body: QuoteRequest): Observable<Quote> {
    return this.http.post<Quote>(`/api/cities/${cityId}/wall/quote`, body);
  }

  // pixel wall (admin)
  grantPlacement(body: GrantRequest): Observable<WallArea> {
    return this.http.post<WallArea>('/api/admin/wall/grants', body);
  }

  releasePlacement(areaId: number): Observable<void> {
    return this.http.delete<void>(`/api/admin/wall/areas/${areaId}`);
  }
}

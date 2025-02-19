import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { Page } from '../model/page.model';
import { RessourceDTO } from '../model/RessourceDTO';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RessourceService {
  private apiUrl = `${environment.apiUrl}/ressources`;
  private searchSubject = new Subject<any>();

  constructor(private http: HttpClient) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(filters => this.search(filters));
  }

  searchRessources(filter: any, page: number = 0, size: number = 10): Observable<Page<RessourceDTO>> {   
    this.searchSubject.next({ ...filter, page, size });
    return this.search({ ...filter, page, size });
  }

  private search(filter: any): Observable<Page<RessourceDTO>> {
    let params = new HttpParams()
      .set('page', filter.page)
      .set('size', filter.size);
    Object.keys(filter).forEach(key => {
      if (filter[key] && key !== 'page' && key !== 'size') {
        params = params.set(key, filter[key]);
      }
    });
    return this.http.get<Page<RessourceDTO>>(this.apiUrl, { params });
  }

  getAllRessourcesPaginated(page: number, size: number): Observable<Page<RessourceDTO>> {
    return this.http.get<Page<RessourceDTO>>(`${this.apiUrl}/all?page=${page}&size=${size}`);
  }
  
reserverRessource(idOrganisateur: number, idRessource: number, reservationData: any): Observable<any> {
    const url = `${this.apiUrl}/reserver?idOrganisateur=${idOrganisateur}&idRessource=${idRessource}`;
    return this.http.post(url, reservationData);
}
}
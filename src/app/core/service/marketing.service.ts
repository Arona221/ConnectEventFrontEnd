import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EvenementDTO } from '../model/EvenementDTO';
import { environment } from '../../../environments/environment';
import { MessageMarketingUpdate } from '../model/message-marketing-update.model';
import { SegmentAudienceUpdate } from '../model/segment-audience-update.model';
import { CampagneMarketingUpdate } from '../model/campagne-marketing-update.model';

@Injectable({
  providedIn: 'root',
})
export class MarketingService {
    private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getApprovedEvents(
    categorie?: string,
    lieu?: string,
    date?: string,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'date',
    sortDirection: string = 'asc'
  ): Observable<EvenementDTO[]> {
    const params: any = {
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDirection,
    };
    if (categorie) params.categorie = categorie;
    if (lieu) params.lieu = lieu;
    if (date) params.date = date;
  
    return this.http.get<EvenementDTO[]>(`${this.apiUrl}/evenements/events`, { params });
  }
  getEventDetails(eventId: number): Observable<EvenementDTO> {
    return this.http.get<EvenementDTO>(`${this.apiUrl}/evenements/${eventId}`);
  }
  
getMessages(): Observable<MessageMarketingUpdate[]> {
  return this.http.get<MessageMarketingUpdate[]>(`${this.apiUrl}/messages/update`);
}

getSegments(): Observable<SegmentAudienceUpdate[]> {
  return this.http.get<SegmentAudienceUpdate[]>(`${this.apiUrl}/segments/update`);
}


createSegment(segmentData: any): Observable<SegmentAudienceUpdate> {
  return this.http.post<SegmentAudienceUpdate>(
    `${this.apiUrl}/segments/update`, 
    segmentData
  );
}

generateMessage(eventId: number): Observable<MessageMarketingUpdate> {
  return this.http.post<MessageMarketingUpdate>(`${this.apiUrl}/messages/update/generer/${eventId}`, {});
}

createCampagne(campaignData: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/campagnes`, campaignData, {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  });
}

// Ajouter ces méthodes dans MarketingService
getCampagnes(): Observable<CampagneMarketingUpdate[]> {
  return this.http.get<CampagneMarketingUpdate[]>(`${this.apiUrl}/campagnes`);
}

publierCampagne(id: number): Observable<any> {
  return this.http.post(`${this.apiUrl}/campagnes/${id}/publier`, {});
}

supprimerCampagne(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/campagnes/${id}`);
}

}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  lastSeen?: Date;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Récupérer l'utilisateur actuel
  getCurrentUser(): Observable<User> {
    return this.http.get<User>('/api/users/me').pipe(
      tap(user => this.currentUserSubject.next(user))
    );
  }

  // Rechercher des utilisateurs
  searchUsers(query: string): Observable<User[]> {
    return this.http.get<User[]>(`/api/users/search?query=${query}`);
  }

  // Mettre à jour le profil
  updateUserProfile(userId: string, updates: Partial<User>): Observable<User> {
    return this.http.patch<User>(`/api/users/${userId}`, updates).pipe(
      tap(updatedUser => {
        if(updatedUser.id === this.currentUserSubject.value?.id) {
          this.currentUserSubject.next(updatedUser);
        }
      })
    );
  }

  // Récupérer les détails d'un utilisateur
  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`/api/users/${userId}`);
  }

  // Vérifier l'état d'authentification
  isAuthenticated(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => !!user)
    );
  }

  // Mettre à jour la présence
  updateUserPresence(status: 'online' | 'offline'): Observable<void> {
    return this.http.post<void>('/api/users/presence', { status });
  }

  // Charger les participants d'une conversation
  getConversationParticipants(messageId: string): Observable<User[]> {
    return this.http.get<User[]>(`/api/messages/${messageId}/participants`);
  }
}
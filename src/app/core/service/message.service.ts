import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { User } from '../model/user.model'; // Adjust the path as necessary
import { WebSocketService } from './websocket.service'; // Adjust the path as necessary

interface Message {
  id: string;
  content: string;
  sender: User;
  receiver: User;
  timestamp: Date;
  fileAttachment?: FileAttachment;
  isEdited: boolean;
}

interface FileAttachment {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  private baseUrl = 'http://localhost:8081/api/messages'; // Adjust the base URL as needed

  constructor(private http: HttpClient, private webSocketService: WebSocketService) {}

  // Connexion WebSocket
  connect(userId: string): void {
    this.webSocketService.connect(userId);
    this.webSocketService.getMessages().subscribe({
      next: (message) => this.handleIncomingMessage(message),
      error: (err) => console.error('WebSocket error:', err)
    });
  }

  // Envoyer un message texte
  sendMessage(content: string, senderId: string, receiverId: string): Observable<Message> {
    return this.http.post<Message>(`${this.baseUrl}/send`, {
      content,
      senderId,
      receiverId
    }).pipe(
      tap(message => this.messagesSubject.next([...this.messagesSubject.value, message]))
    );
  }

  // Envoyer un fichier
  uploadFile(file: File, senderId: string, receiverId: string): Observable<Message> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Message>(
      `${this.baseUrl}/upload?senderId=${senderId}&receiverId=${receiverId}`,
      formData
    ).pipe(
      tap(message => this.messagesSubject.next([...this.messagesSubject.value, message]))
    );
  }

  // Supprimer un message
  deleteMessage(messageId: string, senderId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${messageId}?senderId=${senderId}`).pipe(
      tap(() => {
        const updatedMessages = this.messagesSubject.value.filter(m => m.id !== messageId);
        this.messagesSubject.next(updatedMessages);
      })
    );
  }

  // Rechercher des conversations
  searchConversations(query: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/search?query=${query}`);
  }

  // Charger l'historique des messages
  loadConversation(userId1: string, userId2: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.baseUrl}/conversation/${userId1}/${userId2}`).pipe(
      tap(messages => this.messagesSubject.next(messages))
    );
  }

  // Gestion des messages entrants en temps réel
  private handleIncomingMessage(message: any): void {
    if (message.type === 'DELETE') {
      const updatedMessages = this.messagesSubject.value.filter(m => m.id !== message.id);
      this.messagesSubject.next(updatedMessages);
    } else {
      this.messagesSubject.next([...this.messagesSubject.value, message]);
    }
  }

  getConversation(currentUserId: number, participantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/conversation/${currentUserId}/${participantId}`);
  }
}
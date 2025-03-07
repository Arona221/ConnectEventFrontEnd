import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import SockJS from 'sockjs-client';
import { Client, over } from 'stompjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private stompClient!: Client;
  private socketUrl = 'http://localhost:8081/ws'; 
  private socket: WebSocket;
  private messagesSubject = new Subject<any>(); // Adjust type as necessary

  constructor() {}

  // Fonction pour se connecter au WebSocket
  connect(): Observable<any> {
    return new Observable((observer) => {
      console.log('Tentative de connexion à:', this.socketUrl);
      const socket = new SockJS(this.socketUrl);
      
      socket.onopen = () => {
        console.log('SockJS connection opened');
      };
      
      socket.onclose = (event) => {
        console.log('SockJS connection closed:', event);
      };
      
      socket.onerror = (error) => {
        console.error('SockJS error:', error);
      };
      
      this.stompClient = over(socket);

      this.stompClient.connect({}, () => {
        console.log('Connecté au WebSocket');
        this.stompClient.subscribe('/topic/sales-updates', (message: any) => {
          console.log('Message reçu du WebSocket :', message);
          observer.next(JSON.parse(message.body));
        });
      });

      // Fonction de nettoyage lors de la désinscription
      return () => {
        if (this.stompClient) {
          this.stompClient.disconnect(() => {
            console.log('WebSocket Déconnecté');
          });
        }
      };
    });
  }

  connect(userId: string): void {
    // Logic to connect to WebSocket server
    this.socket = new WebSocket(`ws://your-websocket-url?userId=${userId}`);

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.messagesSubject.next(message);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  getMessages() {
    return this.messagesSubject.asObservable(); // Return observable for messages
  }
}
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import SockJS from 'sockjs-client';
import { Client, over } from 'stompjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private stompClient!: Client;
  private socketUrl = 'http://localhost:8081/ws'; 

  constructor() {}

  // Fonction pour se connecter au WebSocket
  connect(): Observable<any> {
    return new Observable((observer) => {
      const socket = new SockJS(this.socketUrl);
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
}
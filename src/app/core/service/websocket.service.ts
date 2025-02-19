import { Injectable } from '@angular/core';
import { Stomp } from '@stomp/stompjs';
import { BehaviorSubject } from 'rxjs';
import SockJS from 'sockjs-client';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private stompClient: any;
  private messagesSubject = new BehaviorSubject<any>(null);
  
  connect(userId: string) {
    const socket = new SockJS('http://localhost:8080/ws-messages');
    this.stompClient = Stomp.over(socket);
    
    this.stompClient.connect({}, () => {
      this.stompClient.subscribe(`/user/${userId}/topic/messages`, (message: any) => {
        this.messagesSubject.next(JSON.parse(message.body));
      });
      
      this.stompClient.subscribe('/topic/deletions', (messageId: string) => {
        this.messagesSubject.next({ type: 'DELETE', id: messageId });
      });
    });
  }

  getMessages() {
    return this.messagesSubject.asObservable();
  }

  sendMessage(destination: string, message: any) {
    this.stompClient.send(`/app/${destination}`, {}, JSON.stringify(message));
  }
}
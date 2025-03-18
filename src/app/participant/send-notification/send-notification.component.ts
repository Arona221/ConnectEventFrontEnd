import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLinkActive, RouterLink } from '@angular/router';
import { NotificationService } from '../../core/service/notification.service';
import { faTicketAlt, faHeart, faBell, faCircle, faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HighlightPipe } from './highlight.pipe';
import { TimeAgoPipe } from './time-ago.pipe';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-send-notification',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    FontAwesomeModule,
    HighlightPipe,
    TimeAgoPipe
  ],
  providers: [NotificationService],
  templateUrl: './send-notification.component.html',
  styleUrls: ['./send-notification.component.scss']
})
export class SendNotificationComponent implements OnInit, OnDestroy {
  private countSubscription!: Subscription;
  notificationsCount: number = 0;
  nomUtilisateur: string | null = '';
  notifications: any[] = [];
  faIcons = {
    ticket: faTicketAlt,
    heart: faHeart,
    bell: faBell,
    unread: faCircle,
    markAll: faCheckDouble
  };
  

  constructor(
            private router: Router,
            public notificationService: NotificationService) {
             this.nomUtilisateur = localStorage.getItem('nomUtilisateur');
  }
  ngOnInit(): void {
    this.loadNotifications();

    this.countSubscription = this.notificationService.notificationCount$
    .subscribe(count => {
      // Mettre à jour le badge de la navbar
      this.notificationsCount = count;
    });
  }
  private loadNotifications(): void {
    const userId = parseInt(localStorage.getItem('idUtilisateur') || '0', 10);
    this.notificationService.getNotifications(userId).subscribe({
      next: (data) => {
        this.notifications = data;
        this.updateUnreadCount();
      },
      error: (err) => console.error('Error loading notifications:', err)
    });
  }
  ngOnDestroy(): void {
    // Nettoyer la souscription
    if (this.countSubscription) {
      this.countSubscription.unsubscribe();
    }
  }

  markAsRead(notification: any): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.read = true;
          this.updateUnreadCount();
        },
        error: (err) => console.error('Error marking as read:', err)
      });
    }
  }

  markAllAsRead(): void {
    this.notifications
      .filter(n => !n.read)
      .forEach(n => this.markAsRead(n));
  }

  private updateUnreadCount(): void {
    const count = this.notifications.filter(n => !n.read).length;
    this.notificationService.updateUnreadCount(count);
  }
  navigateToEvent(eventId: number): void {
    this.router.navigate(['/event-details', eventId]);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/connexion']);
  }
}


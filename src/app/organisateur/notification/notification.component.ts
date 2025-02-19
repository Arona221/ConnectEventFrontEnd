import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { NotificationService } from '../../core/service/notification.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notification',
  imports: [CommonModule,RouterLinkActive,RouterLink],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss',
  providers: [DatePipe]
})
export class NotificationComponent  implements OnInit {
  notifications: any[] = [];
  isLoading = false;
  nomUtilisateur: string = localStorage.getItem('nomUtilisateur') || 'Utilisateur';
  notificationCount$: Observable<number>;

  constructor(
    private notificationService: NotificationService,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private router: Router
  ) {
    this.notificationCount$ = this.notificationService.notificationsCount$;
  }

  ngOnInit() {
    this.loadNotifications();
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/connexion']);
  }

  loadNotifications() {
    this.isLoading = true;
    const userId = Number(localStorage.getItem('idUtilisateur'));
    
    this.notificationService.getUserNotifications(userId).subscribe({
      next: (data) => {
        this.notifications = data.map(n => ({
          ...n,
          formattedDate: this.formatDate(n.dateEnvoi)
        }));
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Erreur de chargement des notifications');
        this.isLoading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return `
      ${this.datePipe.transform(date, 'dd/MM/yyyy')} 
      à ${this.datePipe.transform(date, 'HH:mm')}
    `;
  }

  deleteNotification(id: number) {
    this.notificationService.deleteNotification(id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.toastr.success('Notification supprimée');
      },
      error: () => this.toastr.error('Échec de la suppression')
    });
  }

  markAllAsRead() {
    const userId = Number(localStorage.getItem('idUtilisateur'));
    this.notificationService.markAllAsRead(userId).subscribe({
      next: () => {
        this.notifications = [];
        this.toastr.success('Toutes les notifications marquées comme lues');
      },
      error: () => this.toastr.error('Échec de l\'opération')
    });
  }
}


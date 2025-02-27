export interface NotificationDTO {
    idNotification?: number;
    date?: Date;
    contenu: string;
    typeNotification: 'INFO' | 'RAPPEL' | 'URGENT' | 'ANNULATION';
  }
  
  export interface NotificationTypeOption {
    value: NotificationDTO['typeNotification'];
    label: string;
    icon: string;
    color: string;
  }
  interface Notification {
    id: number;
    message: string;
    dateEnvoi: string;
    eventId: number;
    formattedDate: string;
  }
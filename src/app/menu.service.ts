import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private isMenuVisibleSubject = new BehaviorSubject<boolean>(true);
  isMenuVisible$ = this.isMenuVisibleSubject.asObservable();

  toggleMenu(visible: boolean) {
    this.isMenuVisibleSubject.next(visible);
  }
} 
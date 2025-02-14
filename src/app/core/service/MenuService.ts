import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private isMenuVisible = new BehaviorSubject<boolean>(true);
  isMenuVisible$ = this.isMenuVisible.asObservable();

  showMenu() {
    this.isMenuVisible.next(true);
  }

  hideMenu() {
    this.isMenuVisible.next(false);
  }
}

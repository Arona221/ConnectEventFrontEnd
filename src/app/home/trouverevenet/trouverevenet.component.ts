import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-trouverevenet',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './trouverevenet.component.html',
  styleUrls: ['./trouverevenet.component.scss']
})
export class TrouverevenetComponent {

}

import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-creerevenement',
  templateUrl: './creerevenement.component.html',
  styleUrls: ['./creerevenement.component.scss']
})
export class CreerevenementComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>(); // Pour gérer la désinscription des observables
  private observer: IntersectionObserver | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    // Réagir aux événements de navigation pour relancer l'animation après chaque changement de route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$) // Désinscription automatique
    ).subscribe(() => {
      this.setupAnimation(); // Réinitialiser l'animation après chaque changement de route
    });
  }

  ngAfterViewInit() {
    this.setupAnimation(); // Configurer l'animation après l'initialisation de la vue
  }

  ngOnDestroy() {
    this.destroy$.next(); // Désinscription des observables
    this.destroy$.complete();
    if (this.observer) {
      this.observer.disconnect(); // Nettoyer l'IntersectionObserver
    }
  }

  // Configurer l'animation avec IntersectionObserver
  setupAnimation() {
    const animateElements = document.querySelectorAll(".animate");

    // Configuration de l'IntersectionObserver
    const observerOptions = {
      root: null, // Observe par rapport à la fenêtre d'affichage
      threshold: 0.5, // Déclenche l'animation lorsque 50% de l'élément est visible
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.animateNumbers(entry.target as HTMLElement);
          this.observer?.unobserve(entry.target); // Arrête d'observer l'élément après l'animation
        }
      });
    }, observerOptions);

    // Observer chaque élément avec la classe .animate
    animateElements.forEach((element) => {
      this.observer?.observe(element);
    });
  }

  // Lancer l'animation des nombres
  animateNumbers(element: HTMLElement) {
    const target = parseInt(element.getAttribute("data-target")!, 10);
    const suffix = element.getAttribute("data-suffix") || ""; // Récupère le suffixe (par défaut vide)
    const duration = 2000; // Durée de l'animation en millisecondes
    const increment = target / (duration / 16); // 16ms pour correspondre à ~60fps

    let current = 0;

    const updateNumber = () => {
      if (current < target) {
        current += increment;
        element.textContent = `${Math.floor(current)}${suffix}`; // Ajoute le suffixe pendant l'animation
        requestAnimationFrame(updateNumber);
      } else {
        element.textContent = `${target}${suffix}`; // Ajoute le suffixe à la fin de l'animation
      }
    };

    updateNumber();
  }
}
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EvenementDTO } from '../../core/model/EvenementDTO';
import { Categorie } from '../../core/enumeration/Categorie';
import { Status } from '../../core/enumeration/Status';
import { EvenementService } from '../../core/service/evenement.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink} from '@angular/router';
@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [FormsModule,RouterLink],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss'],
})
export class NavbarComponent implements OnInit {
  evenementDTO: EvenementDTO = {
    nom: '',
    date: new Date(),
    description: '',
    lieu: '',
    categorie: Categorie.SPORTS,
    status: Status.EN_ATTENTE,
    nombrePlaces: null,
    image: '',
    billets: [],
    id_evenement: 0,

  };

  nomUtilisateur: string | null = '';
  idUtilisateur: number | null = null;

  constructor(
    private router: Router,
    private evenementService: EvenementService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.nomUtilisateur = localStorage.getItem('nomUtilisateur') || 'Utilisateur';
    const idUtilisateurStr = localStorage.getItem('idUtilisateur');
    this.idUtilisateur = idUtilisateurStr ? Number(idUtilisateurStr) : null;

    if (!this.idUtilisateur || isNaN(this.idUtilisateur)) {
      this.showErrorMessage('Utilisateur non valide ou non connecté.');
    }
  }


  onSubmit(): void {
    if (!this.idUtilisateur) {
      this.showErrorMessage('Utilisateur non connecté.');
      return;
    }
  
    this.evenementService.createEvenement(this.evenementDTO, this.idUtilisateur).subscribe(
      (response) => {
        console.log('Réponse du serveur :', response); // Log de la réponse
        if (response) {
          this.showSuccessMessage('Événement créé avec succès.');
          this.resetForm();
        } else {
          this.showErrorMessage("Erreur lors de la création de l'événement.");
        }
      },
      (error) => {
        console.error('Erreur du serveur :', error); // Log de l'erreur
        this.showErrorMessage("Erreur lors de la création de l'événement.");
      }
    );
  }
  addBillet(): void {
    const typeBillet = (document.querySelector('#typeBillet') as HTMLInputElement).value;
    const prix = parseFloat((document.querySelector('#prixBillet') as HTMLInputElement).value);
    const quantite = parseInt((document.querySelector('#quantiteBillet') as HTMLInputElement).value, 10);
  
    if (typeBillet && !isNaN(prix) && !isNaN(quantite)) {
      this.evenementDTO.billets.push({
        typeBillet: typeBillet,
        prix: prix,
        quantite: quantite,
      });
  
      // Réinitialiser les champs du formulaire
      (document.querySelector('#typeBillet') as HTMLInputElement).value = '';
      (document.querySelector('#prixBillet') as HTMLInputElement).value = '';
      (document.querySelector('#quantiteBillet') as HTMLInputElement).value = '';
  
      this.showSuccessMessage('Billet ajouté avec succès.');
    } else {
      this.showErrorMessage('Veuillez remplir tous les champs du billet.');
    }
  }

  resetForm(): void {
    this.evenementDTO = {
      nom: '',
      date: new Date(),
      description: '',
      lieu: '',
      categorie: Categorie.SPORTS,
      status: Status.EN_ATTENTE,
      nombrePlaces: null,
      image: '',
      billets: [],
      id_evenement: 0,

    };
  }

  showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['success-snackbar'],
    });
  }

  showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/connexion']);
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.evenementDTO.image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
}
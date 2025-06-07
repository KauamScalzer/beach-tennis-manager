import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Importe Router para navegação

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './header.component.html', // Mantenha o template em arquivo separado
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() titulo = '';
  @Input() showBackButton: boolean = false; // Adicione esta propriedade Input
  @Output() onAdd = new EventEmitter<void>();

  constructor(private router: Router) {} // Injete o Router

  // Método para lidar com o clique no botão de voltar
  goBack() {
    this.router.navigateByUrl('/campeonatos'); // Volta para a página de campeonatos
  }
}
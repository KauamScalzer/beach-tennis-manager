import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { addOutline, copyOutline, arrowBackOutline } from 'ionicons/icons'; // Certifique-se de que copyOutline está aqui

addIcons({
  'add-outline': addOutline,
  'copy-outline': copyOutline, // Adicione este ícone se não estiver
  'arrow-back-outline': arrowBackOutline,
});

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './header.component.html', // APONTE PARA O ARQUIVO HTML
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() titulo: string = '';
  @Input() showBackButton: boolean = false;
  @Input() showAddButton: boolean = true; // Controla visibilidade do botão '+'
  @Input() showCopyButton: boolean = false; // Controla visibilidade do botão de copiar
  @Output() onAdd = new EventEmitter<void>();
  @Output() onCopy = new EventEmitter<void>(); // Novo Output para o evento de copiar

  constructor(private router: Router) {}

  goBack() {
    this.router.navigateByUrl('/campeonatos');
  }
}
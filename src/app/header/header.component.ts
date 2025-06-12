import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { addOutline, copyOutline, arrowBackOutline } from 'ionicons/icons';

addIcons({
  'add-outline': addOutline,
  'copy-outline': copyOutline,
  'arrow-back-outline': arrowBackOutline,
});

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [IonicModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() titulo: string = '';
  @Input() showBackButton: boolean = false;
  @Input() showAddButton: boolean = true;
  @Input() showCopyButton: boolean = false;
  @Output() onAdd = new EventEmitter<void>();
  @Output() onCopy = new EventEmitter<void>();

  constructor(private router: Router) {}

  goBack() {
    this.router.navigateByUrl('/campeonatos');
  }
}
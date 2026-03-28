import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export interface ToastData {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
  
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: ToastData,
    public snackBarRef: MatSnackBarRef<ToastComponent>
  ) {}

  get icon(): string {
    switch (this.data.type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  }

  get containerClass(): string {
    return `toast-container ${this.data.type}`;
  }
}

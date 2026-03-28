import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastComponent, ToastData } from '../../shared/components/toast/toast.component';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private snackBar: MatSnackBar) { }

  success(message: string, duration: number = 3000): void {
    this.openToast({ message, type: 'success' }, duration);
  }

  error(message: string, duration: number = 5000): void {
    this.openToast({ message, type: 'error' }, duration);
  }

  warning(message: string, duration: number = 4000): void {
    this.openToast({ message, type: 'warning' }, duration);
  }

  info(message: string, duration: number = 3000): void {
    this.openToast({ message, type: 'info' }, duration);
  }

  private openToast(data: ToastData, duration: number): void {
    this.snackBar.openFromComponent(ToastComponent, {
      data,
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['transparent-toast-panel'] // Custom class if needed to remove default margins
    });
  }
}

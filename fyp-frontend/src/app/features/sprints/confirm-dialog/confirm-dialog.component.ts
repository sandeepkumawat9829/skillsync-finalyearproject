import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    color?: 'primary' | 'accent' | 'warn';
    icon?: string;
}

@Component({
    selector: 'app-confirm-dialog',
    template: `
        <div class="confirm-dialog">
            <div class="dialog-header">
                <mat-icon [class]="'icon-' + (data.color || 'primary')">{{data.icon || 'help_outline'}}</mat-icon>
                <h2>{{data.title}}</h2>
            </div>
            <mat-dialog-content>
                <p>{{data.message}}</p>
            </mat-dialog-content>
            <mat-dialog-actions align="end">
                <button mat-button (click)="onCancel()" class="cancel-btn">
                    {{data.cancelText || 'Cancel'}}
                </button>
                <button mat-raised-button [color]="data.color || 'primary'" (click)="onConfirm()">
                    {{data.confirmText || 'Confirm'}}
                </button>
            </mat-dialog-actions>
        </div>
    `,
    styles: [`
        .confirm-dialog {
            min-width: 360px;
        }
        .dialog-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 20px 24px 8px;
        }
        .dialog-header h2 {
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: #1b1b1b;
        }
        .dialog-header mat-icon {
            font-size: 28px;
            width: 28px;
            height: 28px;
        }
        .icon-primary {
            color: #3b82f6;
        }
        .icon-accent {
            color: #16a34a;
        }
        .icon-warn {
            color: #ef4444;
        }
        mat-dialog-content p {
            font-size: 15px;
            color: #6b7280;
            line-height: 1.6;
            margin: 0;
        }
        mat-dialog-actions {
            padding: 16px 24px 20px;
        }
        .cancel-btn {
            color: #6b7280;
        }
    `]
})
export class ConfirmDialogComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
    ) {}

    onConfirm(): void {
        this.dialogRef.close(true);
    }

    onCancel(): void {
        this.dialogRef.close(false);
    }
}

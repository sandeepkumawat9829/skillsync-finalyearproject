import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewChecked, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChatRoom, ChatMessage } from '../../../core/models/chat.model';

@Component({
    selector: 'app-chat-room',
    templateUrl: './chat-room.component.html',
    styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements OnInit, AfterViewChecked, OnDestroy {
    @Input() room!: ChatRoom;
    @ViewChild('messagesContainer') messagesContainer!: ElementRef;

    messages: ChatMessage[] = [];
    messageControl = new FormControl('');
    loading = false;
    currentUserId: number | null = null;
    
    private shouldScroll = false;
    private messageSub?: Subscription;

    constructor(
        private chatService: ChatService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.currentUserId = this.authService.currentUserValue?.userId || null;
        this.loadMessages();

        // Connect STOMP WebSockets
        this.chatService.connect();

        // Subscribe to real-time incoming messages for this room
        this.messageSub = this.chatService.subscribeToRoom(this.room.roomId).subscribe({
            next: (message) => {
                // Determine if message already exists (in case HTTP fetch brought it in, or we just sent it)
                const exists = this.messages.some(m => m.messageId === message.messageId);
                if (!exists) {
                    this.messages.push(message);
                    this.shouldScroll = true;
                }
            }
        });
    }

    ngAfterViewChecked(): void {
        if (this.shouldScroll) {
            this.scrollToBottom();
            this.shouldScroll = false;
        }
    }

    ngOnDestroy(): void {
        if (this.messageSub) {
            this.messageSub.unsubscribe();
        }
        if (this.room) {
            this.chatService.unsubscribeFromRoom(this.room.roomId);
        }
    }

    loadMessages(): void {
        this.loading = true;
        this.chatService.getMessages(this.room.roomId).subscribe({
            next: (messages) => {
                this.messages = messages;
                this.loading = false;
                this.shouldScroll = true;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    sendMessage(): void {
        const text = this.messageControl.value?.trim();
        if (!text) return;

        const request = {
            roomId: this.room.roomId,
            messageText: text,
            messageType: 'TEXT' as 'TEXT'
        };

        // Clear input immediately for snappy UX
        this.messageControl.setValue('');

        // Use HTTP POST: guaranteed to save to DB AND backend broadcasts via WebSocket to others
        this.chatService.sendMessage(request).subscribe({
            next: (message) => {
                // Add own message directly (WebSocket echo from backend will be deduplicated)
                const exists = this.messages.some(m => m.messageId === message.messageId);
                if (!exists) {
                    this.messages.push(message);
                    this.shouldScroll = true;
                }
            },
            error: (err) => {
                // Restore input if send failed and alert the error
                this.messageControl.setValue(text);
                console.error("Send message failed:", err);
                alert(`Failed to send message: ${err.message || err.statusText || 'Unknown error'}\nDetails: ${JSON.stringify(err.error)}`);
            }
        });
    }

    isOwnMessage(message: ChatMessage): boolean {
        return message.userId === this.currentUserId;
    }

    scrollToBottom(): void {
        if (this.messagesContainer) {
            this.messagesContainer.nativeElement.scrollTop =
                this.messagesContainer.nativeElement.scrollHeight;
        }
    }

    formatTime(date: Date): string {
        return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
}

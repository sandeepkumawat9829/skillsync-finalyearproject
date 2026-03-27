import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatService } from '../../../core/services/chat.service';
import { ChatRoom } from '../../../core/models/chat.model';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
    selector: 'app-chat-container',
    templateUrl: './chat-container.component.html',
    styleUrls: ['./chat-container.component.scss']
})
export class ChatContainerComponent implements OnInit {
    rooms: ChatRoom[] = [];
    selectedRoom: ChatRoom | null = null;
    loading = false;
    error = false;

    constructor(private chatService: ChatService) { }

    ngOnInit(): void {
        this.loadRooms();
    }

    loadRooms(): void {
        this.loading = true;
        this.error = false;

        // First, bootstrap rooms for any teams that don't have one yet, then load all rooms
        this.chatService.initRooms().pipe(
            switchMap(() => this.chatService.getChatRooms()),
            catchError(() => {
                // If init fails (e.g. no team), still try to load existing rooms
                return this.chatService.getChatRooms().pipe(catchError(() => of([])));
            })
        ).subscribe({
            next: (rooms) => {
                this.rooms = rooms;
                this.loading = false;
                // Auto-select first room
                if (rooms.length > 0 && !this.selectedRoom) {
                    this.selectRoom(rooms[0]);
                }
            },
            error: () => {
                this.loading = false;
                this.error = true;
            }
        });
    }

    selectRoom(room: ChatRoom): void {
        this.selectedRoom = room;
        // Mark as read (ignore errors)
        this.chatService.markAsRead(room.roomId).subscribe({ error: () => {} });
    }

    getRoomIcon(room: ChatRoom): string {
        if (room.roomType === 'TEAM') return 'groups';
        if (room.roomType === 'DIRECT') return 'person';
        return 'school';
    }

    getTotalUnread(): number {
        return this.rooms.reduce((sum, room) => sum + (room.unreadCount || 0), 0);
    }
}

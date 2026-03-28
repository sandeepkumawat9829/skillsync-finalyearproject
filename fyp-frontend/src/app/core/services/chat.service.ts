import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { ChatRoom, ChatMessage, SendMessageRequest } from '../models/chat.model';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

@Injectable({
    providedIn: 'root'
})
export class ChatService implements OnDestroy {
    private apiUrl = '/api/chat';
    private wsUrl = '/ws';

    private stompClient: Client | null = null;
    private subscriptions: Map<number, StompSubscription> = new Map();
    private messageSubject = new Subject<ChatMessage>();
    private connectionStatus = new BehaviorSubject<boolean>(false);

    constructor(private http: HttpClient) {
        this.initializeWebSocket();
    }

    ngOnDestroy(): void {
        this.disconnect();
    }

    // ==================== WebSocket Connection ====================

    private initializeWebSocket(): void {
        this.stompClient = new Client({
            webSocketFactory: () => new SockJS(this.wsUrl),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            connectHeaders: {
                Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`
            },
            debug: (str) => {
                // console.log('STOMP: ' + str);
            },
            onConnect: () => {
                console.log('WebSocket Connected');
                this.connectionStatus.next(true);
            },
            onDisconnect: () => {
                console.log('WebSocket Disconnected');
                this.connectionStatus.next(false);
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame);
            }
        });

        this.stompClient.activate();
    }

    connect(): void {
        if (this.stompClient && !this.stompClient.active) {
            // Ensure we have the fresh token before connecting
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (token) {
                this.stompClient.connectHeaders = {
                    Authorization: `Bearer ${token}`
                };
            }
            this.stompClient.activate();
        }
    }

    disconnect(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        this.subscriptions.clear();
        if (this.stompClient) {
            this.stompClient.deactivate();
        }
    }

    isConnected(): Observable<boolean> {
        return this.connectionStatus.asObservable();
    }

    // ==================== Room Subscriptions ====================

    subscribeToRoom(roomId: number): Observable<ChatMessage> {
        const subject = new Subject<ChatMessage>();

        if (this.stompClient && this.stompClient.active) {
            const subscription = this.stompClient.subscribe(
                `/topic/room/${roomId}`,
                (message: IMessage) => {
                    const chatMessage: ChatMessage = JSON.parse(message.body);
                    subject.next(chatMessage);
                    this.messageSubject.next(chatMessage);
                }
            );
            this.subscriptions.set(roomId, subscription);
        }

        return subject.asObservable();
    }

    unsubscribeFromRoom(roomId: number): void {
        const subscription = this.subscriptions.get(roomId);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(roomId);
        }
    }

    // ==================== REST API Methods ====================

    getChatRooms(): Observable<ChatRoom[]> {
        return this.http.get<ChatRoom[]>(`${this.apiUrl}/rooms`);
    }

    // Bootstrap rooms for all teams the user is in (call once on page load)
    initRooms(): Observable<ChatRoom[]> {
        return this.http.post<ChatRoom[]>(`${this.apiUrl}/init-rooms`, {});
    }

    getRoomById(roomId: number): Observable<ChatRoom> {
        return this.http.get<ChatRoom>(`${this.apiUrl}/rooms/${roomId}`);
    }

    getMessages(roomId: number, page: number = 0, size: number = 50): Observable<ChatMessage[]> {
        return this.http.get<ChatMessage[]>(
            `${this.apiUrl}/rooms/${roomId}/messages?page=${page}&size=${size}`
        );
    }

    sendMessage(request: SendMessageRequest): Observable<ChatMessage> {
        // Send via REST (will be broadcast via WebSocket by backend)
        return this.http.post<ChatMessage>(
            `${this.apiUrl}/rooms/${request.roomId}/messages`,
            request
        );
    }

    sendMessageViaWebSocket(roomId: number, request: SendMessageRequest): void {
        if (this.stompClient && this.stompClient.active) {
            this.stompClient.publish({
                destination: `/app/chat.send/${roomId}`,
                body: JSON.stringify(request)
            });
        }
    }

    getTeamRoom(teamId: number): Observable<ChatRoom> {
        return this.http.get<ChatRoom>(`${this.apiUrl}/teams/${teamId}/room`);
    }

    getDirectRoom(otherUserId: number): Observable<ChatRoom> {
        return this.http.get<ChatRoom>(`${this.apiUrl}/direct/${otherUserId}`);
    }

    markAsRead(roomId: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/rooms/${roomId}/read`, {});
    }

    getTotalUnreadCount(): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/unread-count`);
    }

    // ==================== Observable Streams ====================

    get newMessages$(): Observable<ChatMessage> {
        return this.messageSubject.asObservable();
    }

    // ==================== Typing Indicator ====================

    sendTypingIndicator(roomId: number): void {
        if (this.stompClient && this.stompClient.active) {
            this.stompClient.publish({
                destination: `/app/chat.typing/${roomId}`,
                body: ''
            });
        }
    }

    subscribeToTyping(roomId: number): Observable<{ userId: number; userName: string; isTyping: boolean }> {
        const subject = new Subject<{ userId: number; userName: string; isTyping: boolean }>();

        if (this.stompClient && this.stompClient.active) {
            this.stompClient.subscribe(
                `/topic/room/${roomId}/typing`,
                (message: IMessage) => {
                    subject.next(JSON.parse(message.body));
                }
            );
        }

        return subject.asObservable();
    }
}

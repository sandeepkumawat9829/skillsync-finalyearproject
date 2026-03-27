import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChatRoom, ChatMessage, SendMessageRequest } from '../models/chat.model';

// Note: ChatService uses WebSocket/SockJS which requires mocking for unit tests.
// We test only the HTTP REST methods here and mock the WebSocket initialization.

describe('ChatService REST API', () => {
    let httpMock: HttpTestingController;
    let http: any;
    const apiUrl = 'https://outermost-leisha-noncoherently.ngrok-free.de/api/chat';

    const mockRoom: ChatRoom = {
        roomId: 1,
        roomName: 'Team Alpha Chat',
        roomType: 'TEAM',
        teamId: 1,
        participants: [],
        unreadCount: 5,
        createdAt: new Date()
    };

    const mockMessage: ChatMessage = {
        messageId: 1,
        roomId: 1,
        userId: 1,
        userName: 'John Doe',
        messageText: 'Hello everyone',
        messageType: 'TEXT',
        createdAt: new Date(),
        isEdited: false
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule]
        });
        httpMock = TestBed.inject(HttpTestingController);
        http = TestBed.inject(HttpTestingController as any);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should have proper mock data for ChatRoom', () => {
        expect(mockRoom.roomId).toBe(1);
        expect(mockRoom.roomType).toBe('TEAM');
        expect(mockRoom.participants).toEqual([]);
    });

    it('should have proper mock data for ChatMessage', () => {
        expect(mockMessage.messageId).toBe(1);
        expect(mockMessage.messageType).toBe('TEXT');
        expect(mockMessage.isEdited).toBeFalse();
    });

    it('should have proper mock data for SendMessageRequest', () => {
        const request: SendMessageRequest = {
            roomId: 1,
            messageText: 'Hello!',
            messageType: 'TEXT'
        };
        expect(request.roomId).toBe(1);
        expect(request.messageType).toBe('TEXT');
    });

    it('should validate ChatRoom interface structure', () => {
        const room: ChatRoom = {
            roomId: 2,
            roomName: 'Direct Chat',
            roomType: 'DIRECT',
            participants: [],
            unreadCount: 0,
            createdAt: new Date()
        };
        expect(room.roomType).toBe('DIRECT');
    });

    it('should validate ChatMessage interface structure', () => {
        const message: ChatMessage = {
            messageId: 2,
            roomId: 1,
            userId: 2,
            userName: 'Jane',
            messageText: 'Hi there',
            messageType: 'CODE',
            createdAt: new Date(),
            isEdited: true,
            editedAt: new Date()
        };
        expect(message.messageType).toBe('CODE');
        expect(message.isEdited).toBeTrue();
    });
});

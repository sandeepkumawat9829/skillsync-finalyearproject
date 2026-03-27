import { of } from 'rxjs';
import { ChatRoomComponent } from './chat-room.component';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';

describe('ChatRoomComponent', () => {
    let component: ChatRoomComponent;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;

    const mockMessages = [
        {
            messageId: 1,
            roomId: 1,
            senderId: 1,
            senderName: 'John',
            content: 'Hello!',
            sentAt: new Date()
        }
    ];

    beforeEach(() => {
        chatServiceSpy = jasmine.createSpyObj('ChatService', [
            'getChatHistory', 'sendMessage', 'messages$'
        ]);
        authServiceSpy = jasmine.createSpyObj('AuthService', [], {
            currentUserValue: { userId: 1, email: 'test@example.com' }
        });

        chatServiceSpy.getChatHistory.and.returnValue(of(mockMessages));
        chatServiceSpy.messages$ = of(mockMessages);

        component = new ChatRoomComponent(chatServiceSpy, authServiceSpy);
        component.roomId = 1;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load chat history on init', () => {
            component.ngOnInit();
            expect(chatServiceSpy.getChatHistory).toHaveBeenCalledWith(1);
        });

        it('should populate messages array', () => {
            component.ngOnInit();
            expect(component.messages.length).toBe(1);
        });
    });

    describe('sendMessage', () => {
        it('should not send empty message', () => {
            component.newMessage = '';
            component.sendMessage();
            expect(chatServiceSpy.sendMessage).not.toHaveBeenCalled();
        });
    });

    describe('isOwnMessage', () => {
        it('should return true for own message', () => {
            expect(component.isOwnMessage(mockMessages[0])).toBeTrue();
        });

        it('should return false for other message', () => {
            const otherMessage = { ...mockMessages[0], senderId: 2 };
            expect(component.isOwnMessage(otherMessage)).toBeFalse();
        });
    });
});

import { of } from 'rxjs';
import { ChatContainerComponent } from './chat-container.component';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';

describe('ChatContainerComponent', () => {
    let component: ChatContainerComponent;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;

    const mockRooms = [
        {
            roomId: 1,
            roomName: 'Team Alpha Chat',
            roomType: 'TEAM',
            participants: [],
            createdAt: new Date()
        }
    ];

    beforeEach(() => {
        chatServiceSpy = jasmine.createSpyObj('ChatService', [
            'getUserChatRooms', 'createChatRoom', 'connectWebSocket'
        ]);
        authServiceSpy = jasmine.createSpyObj('AuthService', [], {
            currentUserValue: { userId: 1, email: 'test@example.com' }
        });

        chatServiceSpy.getUserChatRooms.and.returnValue(of(mockRooms));

        component = new ChatContainerComponent(chatServiceSpy, authServiceSpy);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Initialization', () => {
        it('should load chat rooms on init', () => {
            component.ngOnInit();
            expect(chatServiceSpy.getUserChatRooms).toHaveBeenCalled();
        });

        it('should populate rooms array', () => {
            component.ngOnInit();
            expect(component.rooms.length).toBe(1);
        });
    });

    describe('selectRoom', () => {
        it('should set selected room', () => {
            component.selectRoom(mockRooms[0]);
            expect(component.selectedRoom).toEqual(mockRooms[0]);
        });
    });
});

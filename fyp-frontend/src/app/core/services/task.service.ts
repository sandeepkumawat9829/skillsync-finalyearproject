import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import {
    CreateTaskRequest,
    ReorderTaskRequest,
    Task,
    TaskBoardEvent,
    UpdateTaskRequest
} from '../models/task.model';

@Injectable({
    providedIn: 'root'
})
export class TaskService implements OnDestroy {
    private apiUrl = 'https://skillsync-finalyearproject.onrender.com/api/tasks';
    private wsUrl = 'https://skillsync-finalyearproject.onrender.com/ws';

    private stompClient: Client | null = null;
    private projectSubscriptions = new Map<number, StompSubscription>();
    private subscribedProjects = new Set<number>();
    private boardEventSubject = new Subject<TaskBoardEvent>();

    constructor(private http: HttpClient) {
        this.initializeWebSocket();
    }

    ngOnDestroy(): void {
        this.projectSubscriptions.forEach(subscription => subscription.unsubscribe());
        this.projectSubscriptions.clear();
        this.subscribedProjects.clear();
        if (this.stompClient) {
            this.stompClient.deactivate();
        }
    }

    getTasksByProject(projectId: number): Observable<Task[]> {
        return this.http.get<Task[]>(`${this.apiUrl}/project/${projectId}`);
    }

    getTaskById(taskId: number): Observable<Task> {
        return this.http.get<Task>(`${this.apiUrl}/${taskId}`);
    }

    createTask(request: CreateTaskRequest): Observable<Task> {
        return this.http.post<Task>(`${this.apiUrl}`, request);
    }

    updateTask(taskId: number, request: UpdateTaskRequest): Observable<Task> {
        return this.http.put<Task>(`${this.apiUrl}/${taskId}`, request);
    }

    updateTaskStatus(taskId: number, status: string, position: number = 0): Observable<Task> {
        return this.http.patch<Task>(`${this.apiUrl}/${taskId}/move`, { status, position });
    }

    reorderTasks(projectId: number, updates: ReorderTaskRequest[]): Observable<Task[]> {
        return this.http.put<Task[]>(`${this.apiUrl}/project/${projectId}/reorder`, updates);
    }

    deleteTask(taskId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${taskId}`);
    }

    getMyTasks(): Observable<Task[]> {
        return this.http.get<Task[]>(`${this.apiUrl}/my`);
    }

    getTasksBySprint(sprintId: number): Observable<Task[]> {
        return this.http.get<Task[]>(`${this.apiUrl}/sprint/${sprintId}`);
    }

    assignTask(taskId: number, userId: number | null): Observable<Task> {
        return this.http.put<Task>(`${this.apiUrl}/${taskId}/assign`, { userId });
    }

    subscribeToProject(projectId: number): Observable<TaskBoardEvent> {
        this.ensureConnected();
        this.subscribedProjects.add(projectId);

        if (this.stompClient?.connected && !this.projectSubscriptions.has(projectId)) {
            this.projectSubscriptions.set(
                projectId,
                this.stompClient.subscribe(`/topic/projects/${projectId}/tasks`, (message: IMessage) => {
                    this.boardEventSubject.next(JSON.parse(message.body) as TaskBoardEvent);
                })
            );
        }

        return this.boardEventSubject.asObservable();
    }

    unsubscribeFromProject(projectId: number): void {
        this.subscribedProjects.delete(projectId);
        const subscription = this.projectSubscriptions.get(projectId);
        if (subscription) {
            subscription.unsubscribe();
            this.projectSubscriptions.delete(projectId);
        }
    }

    private initializeWebSocket(): void {
        this.stompClient = new Client({
            webSocketFactory: () => new SockJS(this.wsUrl),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            connectHeaders: this.getConnectHeaders(),
            debug: () => undefined
        });

        this.stompClient.onConnect = () => {
            this.projectSubscriptions.forEach(subscription => subscription.unsubscribe());
            this.projectSubscriptions.clear();
            const pendingProjects = Array.from(this.subscribedProjects.values());
            pendingProjects.forEach(projectId => this.subscribeToProject(projectId));
        };

        this.stompClient.activate();
    }

    private ensureConnected(): void {
        if (!this.stompClient) {
            this.initializeWebSocket();
            return;
        }

        this.stompClient.connectHeaders = this.getConnectHeaders();
        if (!this.stompClient.active) {
            this.stompClient.activate();
        }
    }

    private getConnectHeaders(): { Authorization?: string } {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    }
}

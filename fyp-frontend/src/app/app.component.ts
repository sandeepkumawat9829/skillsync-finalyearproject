import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'FYP Management System';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // On app startup / page refresh, restore session from HttpOnly cookie
    // If the cookie is valid, the backend returns the user info
    this.authService.fetchCurrentUser().subscribe();
  }
}

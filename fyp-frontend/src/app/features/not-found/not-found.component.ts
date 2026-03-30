import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  template: `
    <div class="not-found-container">
      <div class="not-found-card">
        <img src="/assets/images/skillsync-logo.svg" alt="SkillSync" class="nf-logo" />
        <div class="error-code">404</div>
        <h1>Page Not Found</h1>
        <p>Oops! The page you're looking for doesn't exist or has been moved.</p>
        <div class="nf-actions">
          <button class="home-btn" (click)="goHome()">
            ← Go to Home
          </button>
          <button class="back-btn" (click)="goBack()">
            Go Back
          </button>
        </div>
      </div>

      <!-- Floating decorations -->
      <div class="float-circle c1"></div>
      <div class="float-circle c2"></div>
      <div class="float-circle c3"></div>
    </div>
  `,
  styles: [`
    .not-found-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e8e7ff;
      position: relative;
      overflow: hidden;
      padding: 40px 20px;
    }

    .not-found-card {
      text-align: center;
      background: white;
      border-radius: 28px;
      padding: 56px 48px;
      max-width: 520px;
      width: 100%;
      box-shadow: 0 8px 40px rgba(27, 27, 27, 0.1);
      position: relative;
      z-index: 2;
      animation: slideUp 0.6s ease-out;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .nf-logo {
      height: 48px;
      width: auto;
      margin-bottom: 24px;
    }

    .error-code {
      font-size: 120px;
      font-weight: 900;
      background: linear-gradient(135deg, #ff5754, #ff9a76);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
      margin-bottom: 8px;
      letter-spacing: -4px;
    }

    h1 {
      font-size: 28px;
      font-weight: 800;
      color: #1b1b1b;
      margin: 0 0 12px;
    }

    p {
      color: #6b7280;
      font-size: 16px;
      font-weight: 500;
      margin: 0 0 32px;
      line-height: 1.5;
    }

    .nf-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
    }

    .home-btn {
      background: #ff5754;
      color: white;
      border: none;
      padding: 14px 32px;
      border-radius: 28px;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(255, 87, 84, 0.3);
      transition: all 0.3s ease;
    }

    .home-btn:hover {
      background: #ff6b68;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 87, 84, 0.4);
    }

    .back-btn {
      background: transparent;
      color: #6b7280;
      border: 2px solid #e5e7eb;
      padding: 14px 28px;
      border-radius: 28px;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .back-btn:hover {
      border-color: #ff5754;
      color: #ff5754;
    }

    /* Floating decorations */
    .float-circle {
      position: absolute;
      border-radius: 50%;
      z-index: 1;
    }

    .c1 {
      width: 200px;
      height: 200px;
      background: rgba(255, 87, 84, 0.08);
      top: 10%;
      left: 5%;
      animation: float 6s ease-in-out infinite;
    }

    .c2 {
      width: 140px;
      height: 140px;
      background: rgba(189, 186, 255, 0.15);
      bottom: 15%;
      right: 8%;
      animation: float 8s ease-in-out infinite reverse;
    }

    .c3 {
      width: 80px;
      height: 80px;
      background: rgba(255, 204, 77, 0.12);
      top: 30%;
      right: 20%;
      animation: float 5s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }

    @media (max-width: 480px) {
      .not-found-card { padding: 40px 28px; }
      .error-code { font-size: 80px; }
      .nf-actions { flex-direction: column; }
    }
  `]
})
export class NotFoundComponent {
  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    window.history.back();
  }
}

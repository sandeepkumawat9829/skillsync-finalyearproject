import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="site-footer">
      <div class="footer-content">
        <div class="footer-main">
          <div class="footer-brand">
            <img src="/assets/images/skillsync-logo.svg" alt="SkillSync" class="footer-logo" />
            <p class="footer-tagline">Empowering students and mentors to collaborate on final year projects seamlessly.</p>
          </div>

          <div class="footer-links">
            <div class="footer-col">
              <h4>Platform</h4>
              <a routerLink="/">Home</a>
              <a routerLink="/auth/login">Login</a>
              <a routerLink="/auth/register">Register</a>
              <a routerLink="/showcase">Project Showcase</a>
            </div>
            <div class="footer-col">
              <h4>Features</h4>
              <a>Team Management</a>
              <a>Mentor Matching</a>
              <a>Task Tracking</a>
              <a>Real-time Chat</a>
            </div>
            <div class="footer-col">
              <h4>Legal</h4>
              <a>Privacy Policy</a>
              <a>Terms of Service</a>
              <a>Cookie Policy</a>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <p>&copy; {{ currentYear }} SkillSync. All rights reserved.</p>
          <p class="footer-credit">Built with ❤️ for Final Year Projects</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .site-footer {
      background: #1b1b1b;
      color: rgba(255, 255, 255, 0.7);
      padding: 48px 0 0;
      margin-top: auto;
    }

    .footer-content {
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 24px;
    }

    .footer-main {
      display: flex;
      gap: 60px;
      padding-bottom: 40px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .footer-brand {
      flex: 1;
      min-width: 240px;
    }

    .footer-logo {
      height: 40px;
      width: auto;
      margin-bottom: 16px;
      filter: brightness(1.1);
    }

    .footer-tagline {
      font-size: 14px;
      line-height: 1.6;
      color: rgba(255, 255, 255, 0.45);
      max-width: 280px;
    }

    .footer-links {
      display: flex;
      gap: 48px;
      flex-wrap: wrap;
    }

    .footer-col {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .footer-col h4 {
      color: white;
      font-weight: 700;
      font-size: 14px;
      margin: 0 0 8px 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .footer-col a {
      color: rgba(255, 255, 255, 0.5);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: color 0.2s ease;
      cursor: pointer;
    }

    .footer-col a:hover {
      color: #ff5754;
    }

    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 0;
    }

    .footer-bottom p {
      margin: 0;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.3);
    }

    .footer-credit {
      font-size: 13px;
    }

    @media (max-width: 768px) {
      .footer-main {
        flex-direction: column;
        gap: 32px;
      }

      .footer-links {
        gap: 32px;
      }

      .footer-bottom {
        flex-direction: column;
        gap: 8px;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}

import { Injectable } from '@angular/core';
interface GoogleIdentity {
  initialize(options: { client_id: string; callback: (result: { credential: string }) => void }): void;
  renderButton(element: HTMLElement, options: object): void;
}
declare global { interface Window { google?: { accounts: { id: GoogleIdentity } }; } }

@Injectable({ providedIn: 'root' })
export class GoogleSignInService {
  private loading?: Promise<void>;
  private callback?: (credential: string) => void;
  private clientId?: string;
  async render(element: HTMLElement, clientId: string, callback: (credential: string) => void): Promise<void> {
    if (!window.google) {
      this.loading ??= new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        const timer = window.setTimeout(() => { script.remove(); reject(new Error('Google timed out')); }, 12000);
        script.onload = () => { clearTimeout(timer); resolve(); };
        script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error('Google unavailable')); };
        document.head.appendChild(script);
      }).catch(error => { this.loading = undefined; throw error; });
      await this.loading;
    }
    const identity = window.google?.accounts.id;
    if (!identity) throw new Error('Google unavailable');
    this.callback = callback;
    if (this.clientId !== clientId) {
      identity.initialize({ client_id: clientId, callback: result => this.callback?.(result.credential) });
      this.clientId = clientId;
    }
    identity.renderButton(element, { type: 'standard', theme: 'outline', size: 'large', text: 'continue_with', shape: 'rectangular', width: Math.min(element.clientWidth || 360, 400) });
  }
  clear(): void { this.callback = undefined; }
}

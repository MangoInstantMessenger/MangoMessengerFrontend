import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Tokens} from "../../consts/Tokens";
import {LoginCommand} from "../../types/requests/LoginCommand";
import {ITokensResponse} from "../../types/responses/ITokensResponse";
import {IBaseResponse} from "../../types/responses/IBaseResponse";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private sessionsRoute = 'api/sessions/'

  constructor(private httpClient: HttpClient) {
  }

  // POST /api/sessions
  createSession(command: LoginCommand): Observable<ITokensResponse> {
    return this.httpClient.post<ITokensResponse>(environment.baseUrl + this.sessionsRoute, command,
      {withCredentials: true});
  }

  // POST /api/sessions/{refreshToken}
  refreshSession(refreshToken: string | null): Observable<ITokensResponse> {
    return this.httpClient.post<ITokensResponse>(environment.baseUrl + this.sessionsRoute + refreshToken, {});
  }

  // DELETE /api/sessions/{refreshToken}
  deleteSession(refreshToken: string | null): Observable<IBaseResponse> {
    return this.httpClient.delete<IBaseResponse>(environment.baseUrl + this.sessionsRoute + refreshToken);
  }

  // DELETE /api/sessions
  deleteAllSessions(): Observable<IBaseResponse> {
    return this.httpClient.delete<IBaseResponse>(environment.baseUrl + this.sessionsRoute);
  }
  
  setTokens(tokens: ITokensResponse): void {
    let anyTokens = tokens as any;
    localStorage.setItem('Tokens', anyTokens);
  }

  getTokens(): string | null {
    return localStorage.getItem('Tokens');
  }

  clearTokens(): void {
    localStorage.removeItem('Tokens');
  }
}

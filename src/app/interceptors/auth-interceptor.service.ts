import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {SessionService} from "../services/session.service";
import {catchError, switchMap} from "rxjs/operators";
import {Router} from "@angular/router";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: SessionService, private router: Router) {
  }

  private handleAuthError(err: HttpErrorResponse, request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    const shouldHandle = err.status === 401 &&
      request.headers.has('Authorization') &&
      request.headers.get('Authorization')?.startsWith('Bearer');

    if (shouldHandle) {
      let refreshToken = this.authService.getRefreshToken();
      const refreshTokenResponse = this.authService.refreshSession(refreshToken);
      return refreshTokenResponse.pipe(switchMap((loginData) => {
        this.authService.writeAccessToken(loginData.accessToken);
        this.authService.writeRefreshToken(loginData.refreshToken);
        this.authService.writeUserId(loginData.userId);
        return next.handle(request.clone({
          setHeaders: {
            Authorization: 'Bearer ' + loginData.accessToken
          }, withCredentials: true
        }));
      })).pipe(catchError((_: HttpErrorResponse) => {
        this.router.navigate(['login']).then(r => r);
        return of<never>();
      }));
    }

    return throwError(err);
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(catchError(error => {

      if (error instanceof HttpErrorResponse && error.status === 401) {
        return this.handleAuthError(error, request, next);
      }

      return throwError(error);

    }))
  }

}

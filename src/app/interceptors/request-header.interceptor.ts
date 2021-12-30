import { ITokensResponse } from './../../types/responses/ITokensResponse';
import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpHeaders
} from '@angular/common/http';
import {Observable} from 'rxjs';
import {SessionService} from "../services/session.service";

@Injectable()
export class RequestHeaderInterceptor implements HttpInterceptor {

  constructor(private sessionService: SessionService) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const tokens: ITokensResponse = JSON.parse( this.sessionService.getTokens() as any );

    const addHeaderRequest = request.clone({
      headers: new HttpHeaders({'Authorization': 'Bearer ' + tokens.accessToken})
    });

    return next.handle(addHeaderRequest);
  }
}

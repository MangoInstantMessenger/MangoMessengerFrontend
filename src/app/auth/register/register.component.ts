import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SessionService} from "../../services/session.service";
import {UsersService} from "../../services/users.service";
import {RegisterCommand} from "../../../types/requests/RegisterCommand";
import {Subscription} from "rxjs";
import {AutoUnsubscribe} from "ngx-auto-unsubscribe";
import {ErrorNotificationService} from "../../services/error-notification.service";

@AutoUnsubscribe()
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnDestroy {

  public registerCommand: RegisterCommand = {
    displayName: "Bo4a Account",
    email: "kolosovp94@gmail.com",
    password: "z[?6dMR#xmp=nr6q",
    termsAccepted: false,
  };

  protected registerSub$!: Subscription;

  constructor(private usersService: UsersService,
              private sessionService: SessionService,
              private route: ActivatedRoute,
              private router: Router,
              private errorNotificationService: ErrorNotificationService) {
  }

  register(): void {
    if (!this.registerCommand.displayName) {
      alert("Display name must not be empty.");
      return;
    }

    if (!this.registerCommand.email) {
      alert("Email must not be empty.");
      return;
    }

    if (!this.registerCommand.password) {
      alert("Password must not be empty.");
      return;
    }

    if (!this.registerCommand.termsAccepted) {
      alert("Terms of service must be accepted.");
      return;
    }

    this.registerSub$ = this.usersService.createUser(this.registerCommand).subscribe(registerResponse => {
      this.sessionService.setTokens(registerResponse);
      this.router.navigateByUrl('verify-email-note').then(r => r);
    }, error => {
      this.errorNotificationService.notifyOnError(error);
    });
  }

  ngOnDestroy(): void {
  }
}

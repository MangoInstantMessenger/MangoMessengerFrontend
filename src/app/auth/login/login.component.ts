import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SessionService} from "../../services/session.service";
import {LoginCommand} from "../../../types/requests/LoginCommand";
import {Subscription} from "rxjs";
import {AutoUnsubscribe} from "ngx-auto-unsubscribe";
import {ErrorNotificationService} from "../../services/error-notification.service";

@AutoUnsubscribe()
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnDestroy {

  constructor(private authService: SessionService,
              private route: ActivatedRoute,
              private router: Router,
              private errorNotificationService: ErrorNotificationService) {
  }

  protected loginSub$!: Subscription;

  public loginCommand: LoginCommand = {
    email: "kolosovp95@gmail.com",
    password: "z[?6dMR#xmp=nr6q"
  };

  login(): void {
    if (!this.loginCommand.email) {
      alert("Enter valid email of password.");
      return;
    }

    if (!this.loginCommand.password) {
      alert("Enter valid password");
      return;
    }

    this.loginSub$ = this.authService.createSession(this.loginCommand).subscribe(data => {
      
      this.authService.setTokens(data);

      this.router.navigateByUrl('main').then(r => r);
    }, error => {
      this.errorNotificationService.notifyOnError(error);
    });
  }

  ngOnDestroy(): void {
  }
}

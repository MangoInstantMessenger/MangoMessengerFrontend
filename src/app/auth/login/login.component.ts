import { Component, OnInit } from '@angular/core';
import {ILoginResponse} from "../../models/responses/auth/ILoginResponse";
import {MangoService} from "../../mango.service";
import {ActivatedRoute, Router} from "@angular/router";
import {LoginCommand} from "../../models/commands/auth/LoginCommand";
import {Tokens} from "../../models/consts/tokens";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  email = 'maintester@gmail.com';
  password = 'z[?6dMR#xmp=nr6q';
  loginResponse!: ILoginResponse;

  constructor(private service: MangoService, private route: ActivatedRoute, private router: Router) { }

  login(): void {
    this.service.login(new LoginCommand(this.email, this.password)).subscribe((data: ILoginResponse) => {
      this.loginResponse = data;

      if (!this.loginResponse.success) {
        // to implement redirect
        this.router.navigateByUrl('register').then(r => r);
        return;
      }

      localStorage.setItem(Tokens.accessToken, this.loginResponse.accessToken);
      localStorage.setItem(Tokens.refreshTokenId, this.loginResponse.refreshTokenId);
      this.router.navigateByUrl('main').then(r => r);
    });
  }

  ngOnInit(): void {
  }

}

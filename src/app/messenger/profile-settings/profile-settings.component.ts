import { ITokensResponse } from './../../../types/responses/ITokensResponse';
import {SessionService} from './../../services/session.service';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {UsersService} from "../../services/users.service";
import {UpdateAccountInformationCommand} from "../../../types/requests/UpdateAccountInformationCommand";
import {ChangePasswordCommand} from "../../../types/requests/ChangePasswordCommand";
import {IUser} from "../../../types/models/IUser";
import {Subject, Subscription} from "rxjs";
import {UpdateUserSocialsCommand} from "../../../types/requests/UpdateUserSocialsCommand";
import {DocumentsService} from "../../services/documents.service";
import {AutoUnsubscribe} from "ngx-auto-unsubscribe";
import {ErrorNotificationService} from "../../services/error-notification.service";
import {ActivatedRoute, Router} from "@angular/router";
import {DatePipe} from '@angular/common';

@AutoUnsubscribe()
@Component({
  selector: 'app-profile-settings',
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss']
})
export class ProfileSettingsComponent implements OnInit, OnDestroy {

  constructor(private userService: UsersService,
              private documentService: DocumentsService,
              private errorNotificationService: ErrorNotificationService,
              private sessionService: SessionService,
              private route: ActivatedRoute,
              private router: Router,
              private datePipe: DatePipe) {
  }

  protected getCurrentUserSub$!: Subscription;
  protected updateAccountInfoSub$!: Subscription;
  protected updateUserSocialsSub$!: Subscription;
  protected changePasswordSub$!: Subscription;
  protected updateProfilePictureSub$!: Subscription;

  private tokens: ITokensResponse = JSON.parse( this.sessionService.getTokens() as any );

  public eventsSubject: Subject<IUser> = new Subject<IUser>();
  public isLoaded = false;
  public cloneUser!: IUser;
  public currentPassword = '';
  public newPassword = '';
  public repeatNewPassword = '';
  public fileName = '';
  public file!: File;

  public currentUser: IUser = {
    pictureUrl: "",
    publicKey: 0,
    address: "",
    bio: "",
    birthdayDate: "",
    displayName: "",
    email: "",
    facebook: "",
    firstName: "",
    instagram: "",
    lastName: "",
    linkedIn: "",
    twitter: "",
    userId: "",
    username: "",
    website: ""
  };

  ngOnInit(): void {
    this.initializeView();
  }

  initializeView(): void {
    this.getCurrentUserSub$ = this.userService.getUserById(this.tokens.userId).subscribe(getUserResponse => {
      this.currentUser = getUserResponse.user;
      this.cloneCurrentUser();
      this.emitEventToChild(this.cloneUser);
      this.isLoaded = true;
    }, error => {
      this.errorNotificationService.notifyOnError(error);

      if (error.status === 0 || error.status === 401 || error.status === 403) {
        this.router.navigateByUrl('login').then(r => r);
      }
    });
  }

  saveAccountInfo(): void {
    if (!this.validateDate(this.currentUser.birthdayDate)) {
      alert('Invalid birthday date format. Correct and try again.');
      return;
    }

    const command = new UpdateAccountInformationCommand(
      this.currentUser.birthdayDate,
      this.currentUser.website,
      this.currentUser.username,
      this.currentUser.bio,
      this.currentUser.address,
      this.currentUser.displayName);

    this.updateAccountInfoSub$ = this.userService.updateUserAccountInformation(command).subscribe(_ => {
      alert('Personal information has been updated successfully.');
      this.cloneCurrentUser();
      this.emitEventToChild(this.cloneUser);
    }, error => {
      this.errorNotificationService.notifyOnError(error);

      if (error.status === 0 || error.status === 401 || error.status === 403) {
        this.router.navigateByUrl('login').then(r => r);
      }
    });
  }

  saveSocialMediaInfo(): void {
    const command = new UpdateUserSocialsCommand(this.currentUser.facebook,
      this.currentUser.twitter,
      this.currentUser.instagram,
      this.currentUser.linkedIn);

    this.updateUserSocialsSub$ = this.userService.updateUserSocials(command).subscribe(_ => {
      alert('Social media links updated successfully.');
      this.cloneCurrentUser();
      this.emitEventToChild(this.cloneUser);
    }, error => {
      this.errorNotificationService.notifyOnError(error);

      if (error.status === 0 || error.status === 401 || error.status === 403) {
        this.router.navigateByUrl('login').then(r => r);
      }
    });
  }

  changePassword(): void {
    if (this.currentPassword === this.newPassword) {
      alert("New password should not equals current password");
      return;
    }

    if (this.newPassword !== this.repeatNewPassword) {
      alert('Passwords are different.');
      return;
    }

    const command = new ChangePasswordCommand(this.currentPassword, this.newPassword);

    this.changePasswordSub$ = this.userService.changePassword(command).subscribe(data => {
      alert(data.message);
    }, error => {
      this.errorNotificationService.notifyOnError(error);

      if (error.status === 0 || error.status === 401 || error.status === 403) {
        this.router.navigateByUrl('login').then(r => r);
      }
    });
  }

  updateProfilePicture(): void {
    const formData = new FormData();
    formData.append("pictureFile", this.file);

    this.updateProfilePictureSub$ =
      this.userService.updateProfilePicture(formData).subscribe(updateResponse => {
        alert(updateResponse.message);
        this.currentUser.pictureUrl = updateResponse.newUserPictureUrl;
        this.cloneCurrentUser();
        this.emitEventToChild(this.cloneUser);
      }, error => {
        this.errorNotificationService.notifyOnError(error);
      });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];

    if (file) {
      this.file = file;
      this.fileName = file.name;
    }
  }

  ngOnDestroy(): void {
  }

  emitEventToChild(user: IUser): void {
    this.eventsSubject.next(user);
  }

  private cloneCurrentUser = () => {
    this.cloneUser = JSON.parse(JSON.stringify(this.currentUser));
    this.cloneUser.birthdayDate = this.datePipe.transform(this.cloneUser.birthdayDate, "MM-dd-yyyy") as any;
  }

  validateDate(date: string): boolean {
    if (date === null) {
      return false;
    }

    let anyDate = date as any;
    let parsedDate = (new Date(anyDate)).getDate();
    return !isNaN(parsedDate);
  }
}

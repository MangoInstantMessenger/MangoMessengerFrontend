import {Component, OnDestroy, OnInit} from '@angular/core';
import {ContactsService} from "../../services/contacts.service";
import {IContact} from "../../../types/models/IContact";
import {UsersService} from "../../services/users.service";
import {IUser} from "../../../types/models/IUser";
import {CommunitiesService} from "../../services/communities.service";
import {ActivatedRoute, Router} from "@angular/router";
import {CreateChatCommand} from "../../../types/requests/CreateChatCommand";
import {ChatType} from "../../../types/enums/ChatType";
import {SessionService} from "../../services/session.service";
import {Subscription} from "rxjs";
import {AutoUnsubscribe} from "ngx-auto-unsubscribe";

@AutoUnsubscribe()
@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html'
})
export class ContactsComponent implements OnInit, OnDestroy {

  constructor(private contactsService: ContactsService,
              public userService: UsersService,
              private chatsService: CommunitiesService,
              private sessionService: SessionService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  private currentUser!: IUser;

  protected getCurrentUserContactsSub$!: Subscription;
  protected getCurrentUserSub$!: Subscription;
  protected onFilterSub$!: Subscription;
  protected searchSub$!: Subscription;
  protected getUserByIdSub$!: Subscription;
  protected addContactSub$!: Subscription;
  protected createDirectChatSub$!: Subscription;
  protected deleteContactSub$!: Subscription;

  public contacts: IContact[] = [];
  public isLoaded = false;

  public currentOpenedContact: IUser = {
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

  public contactsSearchQuery = '';
  public contactsFilter = 'All Contacts';
  public currentOpenedUserIsContact = false;

  ngOnInit(): void {
    this.initializeView();
  }

  private initializeView(): void {
    this.getCurrentUserContactsSub$ =
      this.contactsService.getCurrentUserContacts().subscribe(contResponse => {
        this.contacts = contResponse.contacts;

        this.getCurrentUserSub$ = this.userService.getCurrentUser().subscribe(response => {
          this.currentUser = response.user;
          this.currentOpenedContact = response.user;
          this.isLoaded = true;
          this.currentOpenedUserIsContact = true;
          this.contactsFilter = 'All Contacts';
          this.contactsSearchQuery = '';
        });
      }, error => alert(error.error.errorDetails));
  }

  onFilterClick(filter: string) {

    this.contactsFilter = filter;

    this.onFilterSub$ = this.contactsService.getCurrentUserContacts().subscribe(response => {
      this.contacts = response.contacts;
      this.contactsSearchQuery = '';
    }, error => alert(error.error.errorDetails));
  }

  onUserSearchClick(): void {
    this.searchSub$ =
      this.contactsService.searchContacts(this.contactsSearchQuery).subscribe(response => {
        this.contacts = response.contacts;
        this.contactsFilter = 'Search Results';
      }, error => alert(error.error.errorDetails));
  }

  onContactClick(contact: IContact): void {
    this.getUserByIdSub$ = this.userService.getUserById(contact.userId).subscribe(response => {
      this.currentOpenedContact = response.user;
      this.currentOpenedUserIsContact = contact.isContact;
    }, error => alert(error.error.errorDetails));
  }

  onAddContactClick() {
    const contactId = this.currentOpenedContact.userId;

    this.addContactSub$ = this.contactsService.addContact(contactId).subscribe(_ => {

      // TODO: This API call is redundant, keep contacts in memory and simply push result to array
      // TODO: Implement contacts repo
      this.onFilterClick('All Contacts');

      this.contactsSearchQuery = '';
      this.currentOpenedUserIsContact = true;
    }, error => alert(error.error.errorDetails));
  }

  onStartDirectChatClick() {
    const userId = this.currentOpenedContact.userId;
    const createDirectChatCommand = new CreateChatCommand(userId, ChatType.DirectChat);

    this.createDirectChatSub$ =
      this.chatsService.createChat(createDirectChatCommand).subscribe(response => {
        this.router.navigate(['main', {chatId: response.chatId}]).then(r => r);
      }, error => alert(error.error.errorDetails));
  }

  onRemoveContactClick() {
    const userToRemoveId = this.currentOpenedContact.userId;

    this.deleteContactSub$ =
      this.contactsService.deleteContact(this.currentOpenedContact.userId).subscribe(_ => {
        this.contacts = this.contacts.filter(x => x.userId !== userToRemoveId);
        this.currentOpenedContact = this.currentUser;
      }, error => alert(error.error.errorDetails));

  }

  getContactItemClass = (userId: string) => userId === this.currentOpenedContact.userId
    ? 'contacts-item active'
    : 'contacts-item';


  ngOnDestroy(): void {
  }
}

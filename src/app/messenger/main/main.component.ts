import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SessionService} from "../../services/session.service";
import {ChatsService} from "../../services/chats.service";
import {MessagesService} from "../../services/messages.service";
import {IGetUserChatsResponse} from "../../../types/responses/IGetUserChatsResponse";
import {IMessage} from "../../../types/models/IMessage";
import {IChat} from "../../../types/models/IChat";
import {GroupType} from "../../../types/enums/GroupType";
import {UserChatsService} from "../../services/user-chats.service";
import {ArchiveChatCommand} from "../../../types/requests/ArchiveChatCommand";
import {MatDialog} from "@angular/material/dialog";
import {CreateGroupDialogComponent} from "../dialogs/create-group-dialog/create-group-dialog.component";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  messages: IMessage[] = [];
  chats: IChat[] = [];

  activeChatId = '';

  activeChat: IChat = {
    description: "",
    chatId: "",
    chatType: GroupType.DirectChat,
    image: "",
    isArchived: false,
    isMember: false,
    lastMessage: "",
    lastMessageAt: "",
    lastMessageAuthor: "",
    membersCount: 0,
    title: ""
  };

  chatFilter = 'All Chats';
  searchQuery = '';

  constructor(private sessionService: SessionService,
              private chatService: ChatsService,
              private messageService: MessagesService,
              private userChatsService: UserChatsService,
              private route: ActivatedRoute,
              private router: Router,
              public dialog: MatDialog) {
  }

  openCreateGroupDialog(): void {
    this.dialog.open(CreateGroupDialogComponent);
  }

  ngOnInit(): void {
    this.initializeView();
  }

  initializeView(): void {
    this.chatService.getUserChats().subscribe((data) => {
      const routeChatId = this.route.snapshot.paramMap.get('chatId');
      this.chatFilter = 'All Chats';
      this.chats = data.chats.filter(x => !x.isArchived);

      if (routeChatId) {
        this.loadChatAndMessages(routeChatId);
        return;
      }

      const firstChat = data.chats[0];
      if (firstChat) {
        this.loadChatAndMessages(firstChat.chatId);
      }
    }, error => {
      if (error.status === 403) {
        this.router.navigateByUrl('login').then(r => r);
        return;
      }

      alert(error.error.ErrorMessage);
    });
  }

  loadChatAndMessages(chatId: string): void {
    this.messageService.getChatMessages(chatId).subscribe((getMessagesData) => {
        this.messages = getMessagesData.messages;
        this.activeChatId = chatId;
        this.chatService.getChatById(chatId).subscribe((getChatByIdData) => {
          if (getChatByIdData) {
            this.activeChat = getChatByIdData.chat;
            this.scrollToEnd();
          }
        }, error => {
          alert(error.error.ErrorMessage);
        })
      },
      error => {
        alert(error.error.ErrorMessage);
      });
  }

  scrollToEnd(): void {
    setTimeout(() => {
      let element = document.getElementById('messageList');
      element?.scrollIntoView({block: "end"});
    }, 0);
  }

  onChatFilerClick(filer: string): void {
    this.chatService.getUserChats().subscribe((data: IGetUserChatsResponse) => {

      switch (filer) {
        case 'All Chats':
          this.chats = data.chats.filter(x => !x.isArchived);
          const firstChat = data.chats[0];
          if (firstChat) {
            this.loadChatAndMessages(firstChat.chatId);
          }
          break;
        case 'Groups':
          console.log(data.chats);
          this.chats = data.chats.filter(x => x.chatType === GroupType.ReadOnlyChannel
            || x.chatType === GroupType.PublicChannel
            || x.chatType === GroupType.PrivateChannel);
          break;
        case 'Direct Chats':
          this.chats = data.chats.filter(x => x.chatType === GroupType.DirectChat);
          break;
        case 'Archived':
          this.chats = data.chats.filter(x => x.isArchived);
          break;
        default:
          break;
      }

      this.chatFilter = filer;
      this.searchQuery = '';
    });
  }

  onSearchClick(): void {
    this.chatService.searchChat(this.searchQuery).subscribe((data) => {
      this.chats = data.chats;
      this.chatFilter = 'Search Results';
      console.log(this.noActiveChat());
      console.log(this.activeChatId);
    }, error => {
      alert(error.error.ErrorMessage);
    })
  }

  onArchiveChatClick(): void {
    this.chatService.getUserChats().subscribe((data) => {
      const chat = data.chats.filter(x => x.chatId === this.activeChatId)[0];
      const command = new ArchiveChatCommand(this.activeChatId, !chat.isArchived);

      this.userChatsService.putArchiveChat(command).subscribe((_) => {

        if (chat.isArchived) {
          this.router.navigate(['main', {chatId: this.activeChatId}]).then(_ => this.initializeView());
          return;
        }

        this.initializeView();
      }, error => {
        alert(error.error.ErrorMessage);
      })
    }, error => {
      alert(error.error.ErrorMessage);
    })
  }

  onLeaveChatClick(): void {
    this.userChatsService.deleteLeaveChat(this.activeChatId).subscribe((_) => {
      this.activeChatId = '';
      this.onChatFilerClick('All Chats');
    }, error => {
      alert(error.error.ErrorMessage);
    })
  }

  getMessageComponentClass(chat: IChat): string {
    return chat.chatId === this.activeChatId ? 'contacts-item friends active' : 'contacts-item friends';
  }

  onDeleteMessageEvent(messageId: string) {
    this.messages = this.messages.filter(x => x.messageId !== messageId);
  }

  onJoinGroupEvent() {
    this.router.navigate(['main', {chatId: this.activeChatId}]).then(_ => this.initializeView());
  }

  noActiveChat(): boolean {
    return this.activeChatId !== '';
  }
}

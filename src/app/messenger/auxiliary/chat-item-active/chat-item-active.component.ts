import {Component, Input} from '@angular/core';
import {IChat} from "../../../../types/models/IChat";
import {CommunityType} from "../../../../types/enums/CommunityType";

@Component({
  selector: 'app-chat-item-active',
  templateUrl: './chat-item-active.component.html'
})
export class ChatItemActiveComponent {

  @Input() chat: IChat = {
    lastMessageId: "",
    lastMessageAuthor: "",
    lastMessageText: "",
    lastMessageTime: "",
    updatedAt: "",
    roleId: 1,
    communityType: CommunityType.DirectChat,
    description: "",
    chatId: "",
    chatLogoImageUrl: "",
    isArchived: false,
    membersCount: 0,
    title: "",
    isMember: false
  };

  chatContainsMessages(): boolean {
    return this.chat.lastMessageAuthor != null && this.chat.lastMessageText != null;
  }

  getChatPictureUrl(): string {
    return this.chat.chatLogoImageUrl ? this.chat.chatLogoImageUrl : 'assets/media/avatar/3.png';
  }
}

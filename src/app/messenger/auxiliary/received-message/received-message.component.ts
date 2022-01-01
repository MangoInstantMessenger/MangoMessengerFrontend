import {Component, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {IMessage} from "../../../../types/models/IMessage";
import {MessagesService} from "../../../services/messages.service";
import {Subscription} from "rxjs";
import {AutoUnsubscribe} from "ngx-auto-unsubscribe";
import {DeleteMessageCommand} from "../../../../types/requests/DeleteMessageCommand";
import {ErrorNotificationService} from "../../../services/error-notification.service";

@AutoUnsubscribe()
@Component({
  selector: 'app-received-message',
  templateUrl: './received-message.component.html',
  styleUrls: ['./received-message.component.scss']
})
export class ReceivedMessageComponent implements OnDestroy {

  constructor(private messageService: MessagesService,
              private errorNotificationService: ErrorNotificationService) {
  }

  protected deleteMessageSub$!: Subscription;

  @Input() message: IMessage = {
    inReplayToAuthor: "",
    inReplayToText: "",
    messageAttachmentUrl: "",
    userId: "",
    chatId: "",
    messageAuthorPictureUrl: "",
    updatedAt: "",
    messageId: "",
    messageText: "",
    self: false,
    createdAt: "",
    userDisplayName: ""
  };

  @Output() notifyParentOnEditMessage = new EventEmitter<any>();
  @Output() notifyParentOnReplayMessage = new EventEmitter<any>();

  isImageOrGif(): boolean {
    let attachmentSplit = this.message.messageAttachmentUrl.split(".");
    let attachmentFileExtension = attachmentSplit[attachmentSplit.length - 1];

    return attachmentFileExtension == "jpg" ||
      attachmentFileExtension == "png" ||
      attachmentFileExtension == "gif";
  }

  deleteMessage(): void {
    const deleteMessageCommand = new DeleteMessageCommand(this.message.messageId, this.message.chatId);


    this.deleteMessageSub$ =
      this.messageService.deleteMessage(deleteMessageCommand).subscribe(_ => {
      }, error => {
        this.errorNotificationService.notifyOnError(error);
      });

  }

  editMessage(): void {
    const body = {
      messageId: this.message.messageId,
      messageText: this.message.messageText
    }

    this.notifyParentOnEditMessage.emit(body);
  }

  replayMessage(): void {
    const body = {
      messageAuthor: this.message.userDisplayName,
      messageText: this.message.messageText,
    }

    this.notifyParentOnReplayMessage.emit(body);
  }

  getMessageText(): string {
    return this.message.messageText;
  }

  ngOnDestroy(): void {
  }
}

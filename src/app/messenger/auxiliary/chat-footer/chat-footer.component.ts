import {Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild} from '@angular/core';
import {MessagesService} from "../../../services/messages.service";
import {SendMessageCommand} from "../../../../types/requests/SendMessageCommand";
import {IChat} from "../../../../types/models/IChat";
import {CommunityType} from "../../../../types/enums/CommunityType";
import {DocumentsService} from "../../../services/documents.service";
import {Subscription} from "rxjs";
import {EditMessageCommand} from "../../../../types/requests/EditMessageCommand";
import {ErrorNotificationService} from "../../../services/error-notification.service";
import {AutoUnsubscribe} from "ngx-auto-unsubscribe";

@AutoUnsubscribe()
@Component({
  selector: 'app-chat-footer',
  templateUrl: './chat-footer.component.html'
})
export class ChatFooterComponent implements OnChanges, OnDestroy {

  constructor(private messageService: MessagesService,
              private documentService: DocumentsService,
              private errorNotificationService: ErrorNotificationService) {
  }

  // @ts-ignore
  @ViewChild('fileInput') fileInput;

  @Input() editMessageRequest: EditMessageCommand | null = null;
  @Input() replayMessageObject: any | null = null;

  currentMessageText: string = '';

  inReplayAuthor: string | null = null;
  inReplayText: string | null = null;

  attachmentName: string | null = '';

  attachment!: File | null;

  isEmojiPickerVisible = false;

  @Input() chat: IChat = {
    lastMessageId: "",
    lastMessageAuthor: "",
    lastMessageText: "",
    lastMessageTime: "",
    updatedAt: "",
    roleId: 1,
    chatId: "",
    chatLogoImageUrl: "",
    communityType: CommunityType.DirectChat,
    description: "",
    isArchived: false,
    isMember: false,
    membersCount: 0,
    title: ""
  }

  private editSub$!: Subscription;
  private uploadSub$!: Subscription;
  private sendSub$!: Subscription;

  onMessageSendClick(event: any): void {
    event.preventDefault();

    if (!this.currentMessageText) {
      alert("Cannot send empty message text.");
      return;
    }

    if (this.editMessageRequest != null) {
      this.editMessage();
      return;
    }

    if (this.attachment) {
      this.sendMessageWithAttachment();
      return;
    }

    this.sendTextMessage();
  }

  private sendTextMessage() {
    const sendMessageCommand = new SendMessageCommand(this.currentMessageText, this.chat.chatId);

    if (this.inReplayText && this.inReplayAuthor) {
      sendMessageCommand.setReplayToAuthor(this.inReplayAuthor);
      sendMessageCommand.setReplayToText(this.inReplayText);
    }

    this.sendSub$ = this.messageService.sendMessage(sendMessageCommand).subscribe(_ => {
      this.clearMessageInput();
      this.clearInReplay();
    }, error => {
      this.errorNotificationService.notifyOnError(error);
    });
  }

  private sendMessageWithAttachment() {
    if (!this.attachment) {
      this.clearMessageInput();
      this.clearInReplay();
      this.clearAttachment();
      return;
    }

    const formData = new FormData();

    formData.append("formFile", this.attachment);

    this.uploadSub$ = this.documentService.uploadDocument(formData).subscribe(response => {
      const fileName = response.fileName;

      const sendMessageCommand = new SendMessageCommand(this.currentMessageText, this.chat.chatId);
      sendMessageCommand.setAttachmentUrl(fileName);

      this.sendSub$ = this.messageService.sendMessage(sendMessageCommand).subscribe(_ => {
        this.clearAttachment();
        this.clearMessageInput();
      }, error => {
        this.errorNotificationService.notifyOnError(error);
      });
    }, error => {
      this.errorNotificationService.notifyOnError(error);
    });
  }

  private editMessage() {
    if (!this.editMessageRequest) {
      this.clearInEdit();
      this.clearMessageInput();
      return;
    }

    this.editMessageRequest.modifiedText = this.currentMessageText;

    this.editSub$ = this.messageService.editMessage(this.editMessageRequest).subscribe(_ => {
      this.editMessageRequest = null;
      this.currentMessageText = '';
    }, error => {
      this.errorNotificationService.notifyOnError(error);
    })
  }

  public addEmoji(event: any): void {
    this.currentMessageText = `${this.currentMessageText}${event.emoji.native}`;
    this.isEmojiPickerVisible = false;
  }

  attachDocument(event: any): void {
    const file: File = event.target.files[0];

    if (file) {
      this.attachment = file;
      this.attachmentName = file.name;
    }
  }

  clearAttachment(): void {
    this.fileInput.nativeElement.value = "";
    this.attachment = null;
    this.attachmentName = null;
  }

  clearInReplay(): void {
    this.inReplayAuthor = null;
    this.inReplayText = null;
  }

  clearInEdit(): void {
    this.editMessageRequest = null;
    this.currentMessageText = '';
  }

  clearMessageInput(): void {
    this.currentMessageText = '';
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.editMessageRequest = changes.editMessageRequest?.currentValue;

    if (this.editMessageRequest != null) {
      this.currentMessageText = this.editMessageRequest.modifiedText;
      return;
    }

    if (changes.replayMessageObject?.currentValue) {
      const author = changes.replayMessageObject?.currentValue.messageAuthor;
      const messageText = changes.replayMessageObject?.currentValue.messageText;
      this.inReplayAuthor = author;
      this.inReplayText = messageText;
    }
  }

  ngOnDestroy(): void {
  }
}

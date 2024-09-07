<?php

namespace App\Notifications;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Channel;
use App\Models\Message;
use App\Models\Workspace;
use Illuminate\Support\Str;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;


class MentionNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Channel $channel, public Workspace $workspace, public User $fromUser, public User $toUser, public Message $message)
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(User $notifiable): array
    {
        return ['database', 'broadcast'];
    }


    /**
     * Get the mail representation of the notification.
     */
    // public function toMail(object $notifiable): MailMessage
    // {
    //     return (new MailMessage)
    //                 ->line('The introduction to the notification.')
    //                 ->action('Notification Action', url('/'))
    //                 ->line('Thank you for using our application!');
    // }
    public function toBroadcast(User $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            "channel" => $this->channel,
            "fromUser" => $this->fromUser,
            "toUser" => $this->toUser,
            "workspace" => $this->workspace,
            "messageId"=>$this->message->id,
            "created_at" => Carbon::now()


        ]);
    }
    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(User $notifiable): array
    {
        return [
            "channel" => $this->channel,
            "fromUser" => $this->fromUser,
            "toUser" => $this->toUser,
            "workspace" => $this->workspace,
            "messageId"=>$this->message->id,


        ];
    }

    /**
     * Get the notification's database type.
     *
     * @return string
     */
    public function databaseType(User $notifiable): string
    {
        return 'MENTION_NOTIFICATION';
    }
}

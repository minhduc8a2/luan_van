<?php

namespace App\Notifications;

use App\Models\User;
use App\Models\Channel;
use App\Models\Workspace;
use Illuminate\Bus\Queueable;
use Illuminate\Support\Carbon;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;

class ChannelsNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public  $fromUser = null, public $toUser = null, public  $channel, public  $workspace = null, public string $changesType, public  $data = null)
    {
        //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
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
            "workspace" => $this->workspace,
            "channel" => $this->channel,
            "fromUser" => $this->fromUser,
            "toUser" => $this->toUser,
            "changesType" => $this->changesType,
            "data" => $this->data,
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
            "workspace" => $this->workspace,
            "channel" => $this->channel,
            "fromUser" => $this->fromUser,
            "toUser" => $this->toUser,
            "changesType" => $this->changesType,
            "data" => $this->data,





        ];
    }

    /**
     * Get the notification's database type.
     *
     * @return string
     */
    public function databaseType(User $notifiable): string
    {
        return 'CHANNELS_NOTIFICATION';
    }
}

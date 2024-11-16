<?php

namespace App\Notifications;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Channel;
use App\Models\Workspace;
use Illuminate\Support\Str;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;


class HuddleInvitationNotification extends Notification
{
    use Queueable;

    public function __construct(public Channel $channel, public Workspace $workspace, public User $byUser, public User $toUser)
    {
        //
    }

    public function via(User $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toBroadcast(User $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            "channel" => $this->channel,
            "byUser" => $this->byUser,
            "toUser" => $this->toUser,
            "workspace" => $this->workspace,
            "created_at" => Carbon::now()


        ]);
    }
    public function toArray(User $notifiable): array
    {
        return [
            "channel" => $this->channel,
            "byUser" => $this->byUser,
            "toUser" => $this->toUser,
            "workspace" => $this->workspace,


        ];
    }

    public function databaseType(User $notifiable): string
    {
        return 'HUDDLE_INVITATION_NOTIFICATION';
    }
}

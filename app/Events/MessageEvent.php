<?php

namespace App\Events;

use App\Models\Channel;
use App\Models\Message;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class MessageEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public Channel $channel, public Message $message, public string $type="newMessageCreated")
    {
        //
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [

            new PresenceChannel('channels.' . $this->channel->id),
            new PrivateChannel('private_channels.' . $this->channel->id),
        ];
    }
    public function broadcastWith(): array
    {
        return ['message' => $this->message, 'type' => $this->type];
    }
}

<?php

namespace App\Events;

use App\Models\Thread;
use App\Models\Channel;
use App\Models\Message;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class ThreadMessageEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public Message $masterMessage, public Message $message, public  $thread, public string $type = "newMessageCreated")
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
            new PresenceChannel('channels.' . $this->masterMessage->messagable_id),
            new PresenceChannel('threads.' . $this->masterMessage->id),
        ];
    }
    public function broadcastWith(): array
    {
        return [
            'masterMessageId' => $this->masterMessage->id,
            'message' => $this->message,
            'thread' => $this->thread,
            "type" => $this->type,
        ];
    }
}

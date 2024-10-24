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

class ThreadMessageEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public Message $threadedMessage, public Message $threadMessage, public string $type = "newMessageCreated", public $temporaryId=null)
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
            new PrivateChannel('private_channels.' . $this->threadedMessage->channel_id),
            new PresenceChannel('threads.' . $this->threadedMessage->id),
        ];
    }
    public function broadcastWith(): array
    {
        return [
            'threadedMessageId' => $this->threadedMessage->id,
            'message' => $this->threadMessage,
            "type" => $this->type,
            "temporaryId"=>$this->temporaryId
        ];
    }
}

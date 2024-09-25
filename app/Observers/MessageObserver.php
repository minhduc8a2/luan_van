<?php

namespace App\Observers;

use App\Models\Message;
use App\Events\MessageEvent;
use App\Events\ThreadMessageEvent;

class MessageObserver
{
    /**
     * Handle the Message "created" event.
     */
    public function created(Message $message): void
    {
       
    }

    /**
     * Handle the Message "updated" event.
     */
    public function updated(Message $message): void
    {
        if ($message->threaded_message_id == null) { //channel Message
            broadcast(new MessageEvent($message->channel, $message->load([
                'files' => function ($query) {
                    $query->withTrashed();
                },
                'reactions',
                
            ])->loadCount('threadMessages'), "messageEdited"));
        } else {
            broadcast(new ThreadMessageEvent($message->threadedMessage, $message->load(['files' => function ($query) {
                $query->withTrashed();
            }, 'reactions']), "messageEdited"));
        }
    }

    /**
     * Handle the Message "deleted" event.
     */
    public function deleted(Message $message): void
    {
        if ($message->threaded_message_id == null) {
            broadcast(new MessageEvent($message->channel, $message, "messageDeleted"));
        } else {
            broadcast(new ThreadMessageEvent($message->threadedMessage, $message, "messageDeleted"));
        }
    }

    /**
     * Handle the Message "restored" event.
     */
    public function restored(Message $message): void
    {
        //
    }

    /**
     * Handle the Message "force deleted" event.
     */
    public function forceDeleted(Message $message): void
    {
        //
    }
}

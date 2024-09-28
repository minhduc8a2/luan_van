<?php

namespace App\Observers;

use App\Models\Channel;
use App\Events\WorkspaceEvent;

class ChannelObserver
{
    /**
     * Handle the Channel "created" event.
     */
    public function created(Channel $channel): void
    {
        broadcast(new WorkspaceEvent(workspace: $channel->workspace, type: "ChannelObserver_storeChannel", fromUserId: $channel->user_id, data:$channel->loadCount('users')));
    }

    /**
     * Handle the Channel "updated" event.
     */
    public function updated(Channel $channel): void
    {
        //
    }

    /**
     * Handle the Channel "deleted" event.
     */
    public function deleted(Channel $channel): void
    {
        broadcast(new WorkspaceEvent(workspace: $channel->workspace, type: 'ChannelObserver_deleteChannel', data: $channel->id));
    }

    /**
     * Handle the Channel "restored" event.
     */
    public function restored(Channel $channel): void
    {
        //
    }

    /**
     * Handle the Channel "force deleted" event.
     */
    public function forceDeleted(Channel $channel): void
    {
        //
    }
}

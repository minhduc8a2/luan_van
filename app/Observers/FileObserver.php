<?php

namespace App\Observers;

use App\Models\File;
use App\Events\ChannelEvent;
use App\Events\WorkspaceEvent;
use App\Helpers\ChannelEventsEnum;
use Illuminate\Support\Facades\Log;

class FileObserver
{
    /**
     * Handle the File "created" event.
     */
    //files created not attached to messages yet!

    /**
     * Handle the File "updated" event.
     */
    public function updated(File $file): void
    {
        //
    }

    /**
     * Handle the File "deleted" event.
     */
    public function deleted(File $file): void
    {
        try {
            $channelIds = $file->messages()->pluck('channel_id')->unique();
            foreach ($channelIds as $channelId) {
                broadcast(new ChannelEvent($channelId, ChannelEventsEnum::FILE_DELETED->name, $file->id));
            }
            //code...
        } catch (\Throwable $th) {
            //throw $th;
        }
    }

    /**
     * Handle the File "restored" event.
     */
    public function restored(File $file): void
    {
        //
    }

    /**
     * Handle the File "force deleted" event.
     */
    public function forceDeleted(File $file): void
    {
        //
    }
}

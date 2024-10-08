<?php

namespace App\Observers;

use App\Models\File;
use App\Events\WorkspaceEvent;

class FileObserver
{
    /**
     * Handle the File "created" event.
     */
    public function created(File $file): void
    {
        try {
            broadcast(new WorkspaceEvent(workspace: $file->workspace, type: "FileObserver_fileCreated", fromUserId: "", data: $file));
            //code...
        } catch (\Throwable $th) {
            //throw $th;
        }
    }

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
            broadcast(new WorkspaceEvent(workspace: $file->workspace, type: "FileObserver_fileDeleted", fromUserId: "", data: $file->id));
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

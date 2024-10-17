<?php

namespace App\Observers;

use App\Events\WorkspaceEvent;
use App\Models\Workspace;

class WorkspaceObserver
{
    /**
     * Handle the Workspace "created" event.
     */
    public function created(Workspace $workspace): void
    {
        //
    }

    /**
     * Handle the Workspace "updated" event.
     */
    public function updated(Workspace $workspace): void
    {
        try {
            //code...
            broadcast(new WorkspaceEvent(workspace: $workspace, type: "WorkspaceObserver_updated", fromUserId: "", data: $workspace));
        } catch (\Throwable $th) {
            //throw $th;
        }
    }

    /**
     * Handle the Workspace "deleted" event.
     */
    public function deleted(Workspace $workspace): void
    {
        //
    }

    /**
     * Handle the Workspace "restored" event.
     */
    public function restored(Workspace $workspace): void
    {
        //
    }

    /**
     * Handle the Workspace "force deleted" event.
     */
    public function forceDeleted(Workspace $workspace): void
    {
        //
    }
}

<?php

namespace App\Observers;

use App\Models\User;
use App\Events\WorkspaceEvent;
use App\Helpers\WorkspaceEventsEnum;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        //
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        $user->workspaces()->each(function ($workspace) use ($user) {
            try {
                //code...
                broadcast(new WorkspaceEvent(
                    $workspace->id,
                    WorkspaceEventsEnum::USER_UPDATED->name,
                    $user
                ));
            } catch (\Throwable $th) {
                //throw $th;
            }
        });
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        //
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $user): void
    {
        //
    }

    /**
     * Handle the User "force deleted" event.
     */
    public function forceDeleted(User $user): void
    {
        //
    }
}

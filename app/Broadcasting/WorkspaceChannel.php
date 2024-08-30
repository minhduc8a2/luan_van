<?php

namespace App\Broadcasting;

use App\Models\User;
use App\Models\Workspace;

class WorkspaceChannel
{
    /**
     * Create a new channel instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Authenticate the user's access to the channel.
     */
    public function join(User $user, Workspace $workspace): array|bool
    {
        if ($user->isWorkspaceMember($workspace))
            return ['id' => $user->id, 'name' => $user->name, 'avatar_url' => $user->avatar_url];
        return false;
    }
}

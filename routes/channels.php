<?php

use App\Broadcasting\HuddleChannel;
use App\Broadcasting\ThreadChannel;
use App\Broadcasting\MessageChannel;
use App\Broadcasting\WorkspaceChannel;
use App\Models\Channel;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
Broadcast::channel('channels.{channel}', MessageChannel::class);
Broadcast::channel('private_channels.{channel}', function (User $user, Channel $channel) {
    return $user->can('view', [Channel::class, $channel]);
});
Broadcast::channel('threads.{message}', ThreadChannel::class);
Broadcast::channel('workspaces.{workspace}', WorkspaceChannel::class);
Broadcast::channel('private_workspaces.{workspace}', function (User $user, Workspace $workspace) {
    return $user->can('view', [Workspace::class, $workspace]);
});

Broadcast::channel('private_workspace_admin.{workspace}', function (User $user, Workspace $workspace) {
    return $user->can('update', [Workspace::class, $workspace]);
});
Broadcast::channel('huddles.{channel}', HuddleChannel::class);

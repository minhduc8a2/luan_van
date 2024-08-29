<?php

use App\Broadcasting\HuddleChannel;
use App\Broadcasting\MessageChannel;
use App\Broadcasting\WorkspaceChannel;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
Broadcast::channel('channels.{channel}', MessageChannel::class);
Broadcast::channel('workspaces.{workspace}', WorkspaceChannel::class);
Broadcast::channel('huddles.{channel}', HuddleChannel::class);

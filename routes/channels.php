<?php

use App\Broadcasting\MessageChannel;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
Broadcast::channel('channels.{channel}', function ($user, $channel) {
    return true;
});
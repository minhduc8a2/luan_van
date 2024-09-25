<?php

namespace App\Policies;

use App\Helpers\ChannelTypes;
use App\Models\User;

use App\Models\Channel;
use App\Models\Message;
use App\Helpers\PermissionTypes;
use Illuminate\Support\Facades\DB;
use Illuminate\Auth\Access\Response;

class MessagePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        //
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Channel $channel): bool {}

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Channel $channel): bool
    {
        if ($channel->is_archived) return false;

        return $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_ALL->name)
            || $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_CHAT->name);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Message $message): bool
    {
        if ($user->id != $message->user_id) return false;
        if ($message->threaded_message_id != null) {

            try {
                $channel = $message->channel;
                if ($channel->is_archived) return false;
                if ($message->is_auto_generated) return false;
                return $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_ALL->name)
                    || $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_CHAT->name);
            } catch (\Throwable $th) {
                return false;
            }
        } else {

            try {
                $channel = $message->channel;
                if ($channel->is_archived) return false;
                if ($message->is_auto_generated) return false;
                return $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_ALL->name)
                    || $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_THREAD->name);
            } catch (\Throwable $th) {
                return false;
            }
        }
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Message $message): bool
    {

        try {

            $channel = $message->channel;
            if ($channel->is_archived) return false;
            if ($channel->type == ChannelTypes::PUBLIC->name) {
                if ($user->workspacePermissionCheck($channel->workspace, PermissionTypes::WORKSPACE_ALL->name))
                    return true;
            } else {
                if ($user->workspacePermissionCheck($channel->workspace, PermissionTypes::WORKSPACE_ALL->name) && $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_VIEW->name))
                    return true;
            }
            return
                $user->id == $message->user_id;
        } catch (\Throwable $th) {
            //throw $th;
        }



        return false;
    }


    public function deleteAnyMessageInChannel(User $user, Channel $channel): bool
    {



        if ($channel->is_archived) return false;
        if ($channel->type == ChannelTypes::PUBLIC->name) {
            if ($user->workspacePermissionCheck($channel->workspace, PermissionTypes::WORKSPACE_ALL->name))
                return true;
        } else {
            if ($user->workspacePermissionCheck($channel->workspace, PermissionTypes::WORKSPACE_ALL->name) && $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_VIEW->name))
                return true;
        }



        return false;
    }

    public function viewThread(User $user, Channel $channel): bool
    {
        if ($channel->type == ChannelTypes::PUBLIC->name) {
            if (
                $user->workspacePermissionCheck($channel->workspace, PermissionTypes::WORKSPACE_ALL->name)
                || $user->channelPermissionCheck($channel->workspace->mainChannel(), PermissionTypes::CHANNEL_VIEW->name)
            )
                return true;
        }
        return $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_ALL->name)
            || $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_VIEW->name);
    }

    public function createThread(User $user, Channel $channel): bool
    {

        if ($channel->is_archived) return false;
        return $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_ALL->name)
            || $user->channelPermissionCheck($channel, PermissionTypes::CHANNEL_THREAD->name);
    }
    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Message $message): bool
    {
        //
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Message $message): bool
    {
        //
    }
}

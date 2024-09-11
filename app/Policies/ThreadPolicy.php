<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Channel;
use Illuminate\Support\Facades\DB;

class ThreadPolicy
{
    /**
     * Create a new policy instance.
     */
    public function view(User $user, Channel $channel): bool
    {
        $exists = DB::table('channel_user')
            ->where('user_id', '=', $user->id)
            ->where('channel_id', '=', $channel->id)
            ->exists();
        return $exists;
    }
}

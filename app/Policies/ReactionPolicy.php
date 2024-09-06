<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Channel;
use Illuminate\Support\Facades\DB;

class ReactionPolicy
{
    public function create(User $user, Channel $channel): bool
    {
        $exists = DB::table('channel_user')
            ->where('user_id', '=', $user->id)
            ->where('channel_id', '=', $channel->id)
            ->count() > 0;
        return $exists;
    }
}

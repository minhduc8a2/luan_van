<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Workspace extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'user_id'
    ];
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }

    public function channels(): HasMany
    {
        return $this->hasMany(Channel::class);
    }
    public function createAndAssignSelfChannelsForUser(User $user)
    {
        $selfChannel = $this->channels()->create(['name' => $user->name, 'type' => 'SELF', 'user_id' => $user->id]);
        $user->channels()->attach($selfChannel->id);
    }
    public  function assignUserToPublicChannels($user)
    {
        $channelIds = $this->channels()->where("type", '=', "PUBLIC")->get();
        foreach ($channelIds as $channelId) {
            if (!$user->isChannelMember($channelId)) {
                $user->channels()->attach($channelId);
            }
        }
    }

    public function addUserToWorkspace($user)
    {
        if ($user->isWorkspaceMember($this)) return;

        $otherUsers = $this->users->pluck('name', 'id');
        $user->workspaces()->attach($this->id);
        $this->assignUserToPublicChannels($user);

        //create private channels
        foreach ($otherUsers as $id => $name) {
            $newChannel = $this->channels()->create(['user_id' => $user->id, 'name' => $user->name . "_" . $name, "type" => "DIRECT"]);
            $user->channels()->attach($newChannel->id);
            $otherUser = User::find($id);
            if ($otherUser) {
                $otherUser->channels()->attach($newChannel->id);
            }
        }
        //create self channel
        $newChannel = $this->channels()->create(['user_id' => $user->id, 'name' => $user->name, "type" => "SELF"]);
        $user->channels()->attach($newChannel->id);
    }
    public   function isWorkspaceMemberByEmail(string $email): bool
    {
        $user = User::where('email', '=', $email)->first();
        if (!isset($user)) return false;
        return User::where('email', '=', $email)->first()->isWorkspaceMember($this);
    }
}

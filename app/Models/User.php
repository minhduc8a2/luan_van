<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Workspace;
use App\Observers\UserObserver;
use Illuminate\Support\Facades\DB;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;


#[ObservedBy([UserObserver::class])]

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'display_name',
        'phone',
        'email',
        'password',
        'social_provider',
        'social_provider_id',
        'social_provider_token',
        'social_provider_refresh_token',
        'avatar_url',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'social_provider',
        'social_provider_id',
        'social_provider_token',
        'social_provider_refresh_token',
    ];

    public function sendEmailVerificationNotification()
    {
        $this->notify(new \App\Notifications\VerifyEmailQueuedNotification);
    }
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function ownWorkspaces(): HasMany
    {
        return $this->hasMany(Workspace::class);
    }

    public function workspaces(): BelongsToMany
    {
        return $this->belongsToMany(Workspace::class)->withPivot(['role_id','is_approved'])->withTimestamps();
    }

    public function ownChannels(): HasMany
    {
        return $this->hasMany(Channel::class);
    }

    public function hiddenUsers()
    {
        return $this->belongsToMany(User::class, 'hidden_users', 'user_id', 'hidden_user_id')
            ->withPivot('workspace_id')
            ->withTimestamps();
    }


    public function hiddenByUsers()
    {
        return $this->belongsToMany(User::class, 'hidden_users', 'hidden_user_id', 'user_id')
            ->withPivot('workspace_id')
            ->withTimestamps();
    }


    public function channels(): BelongsToMany
    {
        return $this->belongsToMany(Channel::class)->withPivot('role_id', 'last_read_at')->withTimestamps();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(File::class);
    }

    public  function isWorkspaceMember(Workspace $workspace): bool
    {
        $exists = DB::table('user_workspace')
            ->where('user_id', '=', $this->id)
            ->where('workspace_id', '=', $workspace->id)
            ->exists();
        return $exists;
    }

    public  function isChannelMember(Channel $channel): bool
    {
        $exists = DB::table('channel_user')
            ->where('user_id', '=', $this->id)
            ->where('channel_id', '=', $channel->id)
            ->exists();
        return $exists;
    }


    public function workspacePermissionCheck(Workspace $workspace, string $permissionType): bool
    {

        try {

            $roleId = $this->workspaces()
                ->where('workspace_id', '=', $workspace->id)
                ->first()
                ?->pivot
                ?->role_id;
            return $workspace->permissions()->where('permission_type', '=', $permissionType)->where('role_id', '=', $roleId)->exists();
        } catch (\Throwable $th) {
            return false;
        }
    }
    public function channelPermissionCheck(Channel $channel, string $permissionType): bool
    {

        try {
            $roleId = $this->channels()
                ->where('channel_id', '=', $channel->id)
                ->first()
                ->pivot
                ->role_id;
            return $channel->permissions()->where('permission_type', '=', $permissionType)->where('role_id', '=', $roleId)->exists();
        } catch (\Throwable $th) {
            // dd($th);
            return false;
        }
    }
}

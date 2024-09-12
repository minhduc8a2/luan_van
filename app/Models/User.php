<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Workspace;
use Illuminate\Support\Facades\DB;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
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
        return $this->belongsToMany(Workspace::class)->withPivot('role_id')->withTimestamps();
    }

    public function ownChannels(): HasMany
    {
        return $this->hasMany(Channel::class);
    }

    public function channels(): BelongsToMany
    {
        return $this->belongsToMany(Channel::class)->withPivot('role_id', 'last_read_at')->withTimestamps();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public  function isWorkspaceMember(Workspace $workspace): bool
    {
        $exists = DB::table('user_workspace')
            ->where('user_id', '=', $this->id)
            ->where('workspace_id', '=', $workspace->id)
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

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Workspace extends Model
{
    use HasFactory;
    public const PERMISSION_TYPES = ['WORKSPACE_ALL', 'CREATE_CHANNEL', 'WORKSPACE_INVITATION', 'SEARCH_CHANNEL'];
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
        return $this->belongsToMany(User::class)->withPivot('role_id');
    }

    public function channels(): HasMany
    {
        return $this->hasMany(Channel::class);
    }

    public function permissions(): MorphMany
    {
        return $this->morphMany(Permission::class, 'permissionable');
    }

    public function createAndAssignSelfChannelForUser(User $user)
    {
        $selfChannel = $this->channels()->create(['name' => $user->name, 'type' => 'SELF', 'user_id' => $user->id]);
        /**
         * @var Channel $selfChannel
         */
        $selfChannel->assignManagerRoleAndManagerPermissions($user);
    }
    public  function assignUserToPublicChannels(User $user, Role $role)
    {
        $channel = $this->channels()->where("type", '=', "PUBLIC")->where("is_main_channel", '=', true)->first();

        if (!$user->isChannelMember($channel->id)) {
            $user->channels()->attach($channel->id, ['role_id' => $role->id]);
        }
    }

    public function addUserToWorkspace($user)
    {
        if ($user->isWorkspaceMember($this)) return;

        $otherUsers = $this->users->pluck('name', 'id');
        $user->workspaces()->attach($this->id);
        $this->assignUserToPublicChannels($user, Role::getRoleByName("MEMBER"));

        //create private channels
        foreach ($otherUsers as $id => $name) {
            $newChannel = $this->channels()->create(['user_id' => $user->id, 'name' => $user->id . "_" . $id, "type" => "DIRECT"]);
            $user->channels()->attach($newChannel->id);
            $otherUser = User::find($id);
            if ($otherUser) {
                $otherUser->channels()->attach($newChannel->id);
            }
        }
        //create self channel
        $newChannel = $this->channels()->create(['user_id' => $user->id, 'name' => $user->name, "description" => "This is your space. Draft messages, list your to-dos, or keep links and files handy. You can also talk to yourself here, but please bear in mind you’ll have to supply both sides of the conversation.", "type" => "SELF"]);
        $user->channels()->attach($newChannel->id);
    }
    public   function isWorkspaceMemberByEmail(string $email): bool
    {
        $user = User::where('email', '=', $email)->first();
        if (!isset($user)) return false;
        return User::where('email', '=', $email)->first()->isWorkspaceMember($this);
    }

    public function createWorkspaceMemberPermissions()
    {
        $memberRole = Role::getRoleByName('MEMBER');

        if ($this->permissions()->where('role_id', '=', $memberRole->id)->count() > 0) return;

        $this->permissions()->createMany([
            [
                'role_id' => $memberRole->id,
                'permissionable_id' => $this->id,
                'permissionable_type' => Workspace::class,
                'permission_type' => 'CREATE_CHANNEL'
            ],
            [
                'role_id' => $memberRole->id,
                'permissionable_id' => $this->id,
                'permissionable_type' => Workspace::class,
                'permission_type' => 'WORKSPACE_INVITATION'
            ],
            [
                'role_id' => $memberRole->id,
                'permissionable_id' => $this->id,
                'permissionable_type' => Workspace::class,
                'permission_type' => 'SEARCH_CHANNEL'
            ],
        ]);
    }

    public function assignAdminRoleAndAdminPermissions(User $user)
    {
        $adminRole = Role::getRoleByName('ADMIN');

        //assign admin role for user
        $user->workspaces()->attach($this->id, ['role_id' => $adminRole->id]);

        $this->permissions()->create(
            [
                'role_id' => $adminRole->id,
                'permissionable_id' => $this->id,
                'permissionable_type' => Workspace::class,
                'permission_type' => 'WORKSPACE_ALL'
            ]
        );
    }

    public function createInitChannels(User $user, string $channelName)
    {

        $channels =   $this->channels()->createMany([
            [
                'name' => $channelName,
                'description' => Channel::createChannelDescription('', $channelName),
                'type' => 'PUBLIC',
                'user_id' => $user->id
            ],
            [
                'name' => "all-" . $this->name,
                'description' => Channel::createChannelDescription('all', ''),
                'type' => 'PUBLIC',
                'user_id' => $user->id,
                'is_main_channel' => true

            ],
            [
                'name' => "social",
                'description' => Channel::createChannelDescription('social', ''),
                'type' => 'PUBLIC',
                'user_id' => $user->id
            ]
        ]);

        foreach ($channels as $channel) {
            /**
             * @var Channel $channel
             */
            $channel->assignManagerRoleAndManagerPermissions($user);
            $channel->initChannelPermissions();
        }
    }
}

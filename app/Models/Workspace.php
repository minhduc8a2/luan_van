<?php

namespace App\Models;

use App\Helpers\BaseRoles;
use App\Helpers\ChannelTypes;
use App\Helpers\PermissionTypes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

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
        return $this->belongsToMany(User::class)->withPivot('role_id')->withTimestamps();
    }

    public function channels(): HasMany
    {
        return $this->hasMany(Channel::class);
    }

    public function permissions(): MorphMany
    {
        return $this->morphMany(Permission::class, 'permissionable');
    }

    public function mainChannel()
    {
        return $this->channels()->where('is_main_channel', true)->first();
    }
    public function createAndAssignSelfChannelForUser(User $user)
    {
        $selfChannel = $this->channels()->create(['name' => $user->name, 'type' => ChannelTypes::SELF->name, 'user_id' => $user->id, 'description' => "This is your space. Draft messages, list your to-dos, or keep links and files handy. You can also talk to yourself here, but please bear in mind you’ll have to supply both sides of the conversation."]);
        /**
         * @var Channel $selfChannel
         */
        $selfChannel->assignManagerRoleAndManagerPermissions($user);
    }
    public  function assignUserToMainChannel(User $user, Role $role)
    {
        $channel = $this->channels()->where("is_main_channel", '=', true)->first();

        if (!$user->isChannelMember($channel)) {
            $user->channels()->attach($channel->id, ['role_id' => $role->id]);
        }
    }

    public function addUserToWorkspace(User $user)
    {
        if ($user->isWorkspaceMember($this)) return;
        $roleId = Role::getRoleByName(BaseRoles::MEMBER->name)->id;
        $otherUsers = $this->users->pluck('name', 'id');
        $user->workspaces()->attach($this->id, ['role_id' => $roleId]);
        $this->assignUserToMainChannel($user, Role::getRoleByName(BaseRoles::MEMBER->name));

        //create private channels
        foreach ($otherUsers as $id => $name) {
            /**
             * @var Channel $newChannel
             */
            $newChannel = $this->channels()->create(['user_id' => $user->id, 'name' => $user->id . "_" . $id, "type" => ChannelTypes::DIRECT->name]);
            $newChannel->initChannelPermissions();
            $user->channels()->attach($newChannel->id, ['role_id' => $roleId]);
            $otherUser = User::find($id);
            if ($otherUser) {
                $otherUser->channels()->attach($newChannel->id, ['role_id' => $roleId]);
            }
        }
        //create self channel
        $newChannel = $this->channels()->create(['user_id' => $user->id, 'name' => $user->name, "description" => "This is your space. Draft messages, list your to-dos, or keep links and files handy. You can also talk to yourself here, but please bear in mind you’ll have to supply both sides of the conversation.", "type" => ChannelTypes::SELF->name]);
        $newChannel->assignManagerRoleAndManagerPermissions($user);
    }
    public   function isWorkspaceMemberByEmail(string $email): bool
    {
        $user = User::where('email', '=', $email)->first();
        if (!isset($user)) return false;
        return User::where('email', '=', $email)->first()->isWorkspaceMember($this);
    }

    public function createWorkspaceMemberPermissions()
    {
        $memberRole = Role::getRoleByName(BaseRoles::MEMBER->name);

        if ($this->permissions()->where('role_id', '=', $memberRole->id)->exists()) return;

        $this->permissions()->createMany([
            [
                'role_id' => $memberRole->id,
                'permissionable_id' => $this->id,
                'permissionable_type' => Workspace::class,
                'permission_type' => PermissionTypes::CREATE_CHANNEL->name
            ],
            [
                'role_id' => $memberRole->id,
                'permissionable_id' => $this->id,
                'permissionable_type' => Workspace::class,
                'permission_type' => PermissionTypes::WORKSPACE_INVITATION->name
            ],
            [
                'role_id' => $memberRole->id,
                'permissionable_id' => $this->id,
                'permissionable_type' => Workspace::class,
                'permission_type' => PermissionTypes::SEARCH_CHANNEL->name
            ],
        ]);
    }

    public function assignAdminRoleAndAdminPermissions(User $user)
    {
        $adminRole = Role::getRoleByName(BaseRoles::ADMIN->name);

        //assign admin role for user
        $user->workspaces()->attach($this->id, ['role_id' => $adminRole->id]);

        $this->permissions()->create(
            [
                'role_id' => $adminRole->id,
                'permissionable_id' => $this->id,
                'permissionable_type' => Workspace::class,
                'permission_type' => PermissionTypes::WORKSPACE_ALL->name
            ]
        );
    }

    public function createInitChannels(User $user, string $channelName)
    {

        $channels =   $this->channels()->createMany([
            [
                'name' => "all-" . $this->name,
                'description' => Channel::createChannelDescription('all', ''),
                'type' => ChannelTypes::PUBLIC->name,
                'user_id' => $user->id,
                'is_main_channel' => true

            ],
            [
                'name' => $channelName,
                'description' => Channel::createChannelDescription('', $channelName),
                'type' => ChannelTypes::PUBLIC->name,
                'user_id' => $user->id
            ],

            [
                'name' => "social",
                'description' => Channel::createChannelDescription('social', ''),
                'type' => ChannelTypes::PUBLIC->name,
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

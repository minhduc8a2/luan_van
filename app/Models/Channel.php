<?php

namespace App\Models;

use App\Helpers\BaseRoles;
use App\Helpers\PermissionTypes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;


class Channel extends Model
{


    use HasFactory;
    protected $fillable = [
        'name',
        'description',
        'type',
        'workspace_id',
        'user_id',
        'is_main_channel',
        'is_archived'
    ];


    public static function createChannelDescription($type, $channelName)
    {
        switch ($type) {
            case 'all':
                return 'Share announcements and updates about company news, upcoming events, or teammates who deserve some kudos.';
            case 'social':
                return "Other channels are for work. This one’s just for fun. Get to know your teammates and show your lighter side. 🎈";

            default:
                return "This channel is for everything #" . $channelName . ". Hold meetings, share docs, and make decisions together with your team.";
        }
    }
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withPivot('role_id', 'last_read_at')->withTimestamps();
    }
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }
    public function permissions(): MorphMany
    {
        return $this->morphMany(Permission::class, 'permissionable');
    }

    public function assignManagerRoleAndManagerPermissions(User $user)
    {
        $managerRole = Role::getRoleByName(BaseRoles::MANAGER->name);

        //assign manager role for user
        $user->channels()->attach($this->id, ['role_id' => $managerRole->id]);
        $this->createChannelManagerPermissions();
    }
    public function initChannelPermissions()
    {
        $this->createChannelGuestPermissions();
        $this->createChannelManagerPermissions();
        $this->createChannelMemberPermissions();
    }

    public function createChannelManagerPermissions($permissionList = null)
    {
        $managerRole = Role::getRoleByName(BaseRoles::MANAGER->name);
        if (isset($permissionList)) {
            if (gettype($permissionList) == 'array') {
                $channelManagerPermissionList = $permissionList;
            } else {
                $channelManagerPermissionList = [$permissionList];
            }
        } else
            $channelManagerPermissionList = [

                PermissionTypes::CHANNEL_ALL->name,

            ];
        foreach ($channelManagerPermissionList as $channelManagerPermission) {

            $this->permissions()->firstOrCreate([
                'role_id' => $managerRole->id,
                'permissionable_id' => $this->id,
                'permissionable_type' => Channel::class,
                'permission_type' => $channelManagerPermission
            ]);
        }
    }
    public function createChannelMemberPermissions($permissionList = null)
    {
        $memberRole = Role::getRoleByName(BaseRoles::MEMBER->name);
        if (isset($permissionList)) {
            if (gettype($permissionList) == 'array') {
                $channelMemberPermissionList = $permissionList;
            } else {
                $channelMemberPermissionList = [$permissionList];
            }
        } else
            $channelMemberPermissionList = [

                PermissionTypes::CHANNEL_VIEW->name,

                PermissionTypes::CHANNEL_CHAT->name,

                PermissionTypes::CHANNEL_THREAD->name,

                PermissionTypes::CHANNEL_HUDDLE->name,

                PermissionTypes::CHANNEL_INVITATION->name,

                PermissionTypes::CHANNEL_EDIT_DESCRIPTION->name


            ];


        foreach ($channelMemberPermissionList as $channelMemberPermission) {

            $this->permissions()->firstOrCreate([
                'role_id' => $memberRole->id,
                'permissionable_id' => $this->id,
                'permissionable_type' => Workspace::class,
                'permission_type' => $channelMemberPermission
            ]);
        }
    }
    public function createChannelGuestPermissions($permissionList = null)
    {
        $guestRole = Role::getRoleByName(BaseRoles::GUEST->name);
        if (isset($permissionList)) {
            if (gettype($permissionList) == 'array') {
                $guestPermissionList = $permissionList;
            } else {
                $guestPermissionList = [$permissionList];
            }
        } else
            $guestPermissionList = [

                PermissionTypes::CHANNEL_VIEW->name,

                PermissionTypes::CHANNEL_CHAT->name,

                PermissionTypes::CHANNEL_THREAD->name,

                PermissionTypes::CHANNEL_HUDDLE->name,

            ];
        foreach ($guestPermissionList as $guestPermission) {

            $this->permissions()->firstOrCreate([
                'role_id' => $guestRole->id,
                'permissionable_id' => $this->id,
                'permissionable_type' => Workspace::class,
                'permission_type' => $guestPermission
            ]);
        }
    }

    public function deleteMemberPermission($permission)
    {
        $this->permissions()->where('role_id', Role::getRoleIdByName(BaseRoles::MEMBER->name))->where('permission_type', $permission)->delete();
    }
    public function deleteGuestPermission($permission)
    {
        $this->permissions()->where('role_id', Role::getRoleIdByName(BaseRoles::GUEST->name))->where('permission_type', $permission)->delete();
    }

    public function memberPermissionExists($permissionName)
    {
        return $this->permissions()->where('role_id', Role::getRoleIdByName(BaseRoles::MEMBER->name))->where('permission_type', $permissionName)->exists();
    }
    public function guestPermissionExists($permissionName)
    {
        return $this->permissions()->where('role_id', Role::getRoleIdByName(BaseRoles::GUEST->name))->where('permission_type', $permissionName)->exists();
    }
    public function chatPermission()
    {
        $memberChatPermission = $this->memberPermissionExists(PermissionTypes::CHANNEL_CHAT->name);
        $guestChatPermission = $this->guestPermissionExists(PermissionTypes::CHANNEL_CHAT->name);
        if ($memberChatPermission && $guestChatPermission) return 'everyone';
        else if ($memberChatPermission) return 'everyone_except_guests';
        return 'channel_managers_only';
    }

    public function addChannelMembersPermission()
    {
        $memberAddChannelMembersPermission = $this->memberPermissionExists(PermissionTypes::CHANNEL_INVITATION->name);
        if ($memberAddChannelMembersPermission) return 'everyone_except_guests';
        return 'channel_managers_only';
    }

    public function allowHuddlePermission()
    {
        return $this->memberPermissionExists(PermissionTypes::CHANNEL_HUDDLE->name) && $this->guestPermissionExists(PermissionTypes::CHANNEL_HUDDLE->name);
    }

    public function allowThreadPermission()
    {
        return $this->memberPermissionExists(PermissionTypes::CHANNEL_THREAD->name) && $this->guestPermissionExists(PermissionTypes::CHANNEL_THREAD->name);
    }
}

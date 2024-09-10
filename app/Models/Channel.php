<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Channel extends Model
{
    static $type = ['PUBLIC', 'PRIVATE', 'DIRECT', 'SELF'];

    use HasFactory;
    protected $fillable = [
        'name',
        'description',
        'type',
        'workspace_id',
        'user_id',
        'is_main_channel'
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
        return $this->belongsToMany(User::class)->withPivot('role_id');
    }
    public function messages(): MorphMany
    {
        return $this->morphMany(Message::class, 'messagable');
    }
    public function permissions(): MorphMany
    {
        return $this->morphMany(Permission::class, 'permissionable');
    }

    public function assignManagerRoleAndManagerPermissions(User $user)
    {
        $managerRole = Role::getRoleByName('MANAGER');

        //assign admin role for user
        $user->channels()->attach($this->id, ['role_id' => $managerRole->id]);
        if ($this->permissions()->where('role_id', '=', $managerRole->id)->count() > 0) return;
        $this->permissions()->create(
            [
                'role_id' => $managerRole->id,
                'permissionable_id' => $this->id,
                'permissionable_type' => Channel::class,
                'permission_type' => 'CHANNEL_ALL'
            ]
        );
    }
    public function initChannelPermissions()
    {
        $this->createChannelGuestPermissions();
        $this->createChannelManagerPermissions();
        $this->createChannelMemberPermissions();
    }

    public function createChannelManagerPermissions()
    {
        $managerRole = Role::getRoleByName('MANAGER');

        if ($this->permissions()->where('role_id', '=', $managerRole->id)->count() > 0) return;

        $this->permissions()->create(
            [
                'role_id' => $managerRole->id,
                'permissionable_id' => $this->id,
                'permissionable_type' => Channel::class,
                'permission_type' => 'CHANNEL_ALL'
            ]
        );
    }
    public function createChannelMemberPermissions()
    {
        $memberRole = Role::getRoleByName('MEMBER');

        if ($this->permissions()->where('role_id', '=', $memberRole->id)->count() > 0) return;

        $this->permissions()->createMany([
            [
                'role_id' => $memberRole->id,
                'permissionable_id' => $this->id,
                'permissionable_type' => Workspace::class,
                'permission_type' => 'CHANNEL_VIEW'
            ],
            [
                'role_id' => $memberRole->id,
                'permissionable_id' => $this->id,
                'permissionable_type' => Workspace::class,
                'permission_type' => 'CHANNEL_CHAT'
            ],
            [
                'role_id' => $memberRole->id,
                'permissionable_id' => $this->id,
                'permissionable_type' => Workspace::class,
                'permission_type' => 'CHANNEL_HUDDLE'
            ],
            [
                'role_id' => $memberRole->id,
                'permissionable_id' => $this->id,
                'permissionable_type' => Workspace::class,
                'permission_type' => 'CHANNEL_INVITATION'
            ],
            [
                'role_id' => $memberRole->id,
                'permissionable_id' => $this->id,
                'permissionable_type' => Workspace::class,
                'permission_type' => 'CHANNEL_EDIT_DESCRIPTION'
            ],
        ]);
    }
    public function createChannelGuestPermissions()
    {
        $guestRole = Role::getRoleByName('GUEST');

        if ($this->permissions()->where('role_id', '=', $guestRole->id)->count() > 0) return;

        $this->permissions()->createMany([
            [
                'role_id' => $guestRole->id,
                'permissionable_id' => $this->id,
                'permissionable_type' => Workspace::class,
                'permission_type' => 'CHANNEL_CHAT'
            ],
            [
                'role_id' => $guestRole->id,
                'permissionable_id' => $this->id,
                'permissionable_type' => Workspace::class,
                'permission_type' => 'CHANNEL_HUDDLE'
            ],

        ]);
    }
}

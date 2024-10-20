<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Invitation extends Model
{
    use HasFactory;
    protected $fillable = [
        'code',
        'workspace_id',
        'user_id',
        'expired_at',
        'email'
    ];
    protected $casts = [
        'expired_at' => 'datetime',
    ];
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }
    public function isExpired()
    {
        return $this->expired_at && $this->expired_at->isPast();
    }

    public function scopeNotExpired($query)
    {
        return $query->where('expired_at', '>', now());
    }


    public static function hasInvitationIn(String $email, Workspace $workspace, User $user, int $minutes)
    {
        $invitation = Invitation::where('email', $email)
            ->where('workspace_id', $workspace->id)
            ->where('user_id', $user->id)
            ->first();

        if ($invitation) {
            return $invitation->created_at->addMinutes($minutes)->greaterThan(Carbon::now());
        }
        return false;
    }
}

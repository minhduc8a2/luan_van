<?php

namespace App\Models;

use App\Observers\FileObserver;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[ObservedBy([FileObserver::class])]
class File extends Model
{
    static $type = ['doc', 'pdf', 'image', 'video', 'other'];
    use HasFactory;
    use SoftDeletes;
    protected $fillable = [
        'type',
        'url',
        'name',
        'path',
        'user_id',
        'workspace_id'
    ];
    protected $hidden = [
        'path'
    ];
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }
    public function messages(): BelongsToMany
    {
        return $this->belongsToMany(Message::class);
    }
}

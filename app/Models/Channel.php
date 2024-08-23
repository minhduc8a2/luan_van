<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Channel extends Model
{
    static $type = ['PUBLIC','PRIVATE'];
    use HasFactory;
    protected $fillable=[
        'name','type','workspace_id','user_id'
    ];
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }
}

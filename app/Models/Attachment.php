<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Attachment extends Model
{
    static $type = ['doc', 'pdf', 'image', 'video', 'other'];
    use HasFactory;
    protected $fillable=[
        'type','url','name','message_id'
    ];
    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }
}

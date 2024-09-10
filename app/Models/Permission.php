<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Permission extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'role_id',
        'permissionable_id',
        'permissionable_type',
        'permission_type'
    ];

    public function permissionable(): MorphTo
    {
        return $this->morphTo();
    }

   
}

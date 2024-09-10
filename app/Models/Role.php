<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory;
    protected $fillable = ["name"];
    public static $baseRole = ["ADMIN", "MANAGER", "MEMBER", "GUEST"];


    public static function getRoleByName(string $name)
    {
        return Role::where('name', '=', $name)->first();
    }
}

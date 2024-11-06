<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory;
    protected $fillable = ["name"];
    public static $baseRole = ["ADMIN", "MANAGER", "MEMBER"];


    public static function getRoleByName(string $name)
    {

        return Role::firstWhere('name', '=', $name);
    }
    public static function getRoleIdByName(string $name)
    {
        $role =  Role::firstWhere('name', '=', $name);
        if ($role) return $role->id;
        return null;
    }
}

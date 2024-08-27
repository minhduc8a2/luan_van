<?php

namespace App\Helpers;

class Helper
{
    public static function nameFromEmail(string $email)
    {
        $parts = explode('@', $email);
        $localPart = $parts[0];
        return  $localPart;
    }
}

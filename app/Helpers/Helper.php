<?php

namespace App\Helpers;

use Tiptap\Editor;

class Helper
{
    public static function nameFromEmail(string $email)
    {
        $parts = explode('@', $email);
        $localPart = $parts[0];
        return  $localPart;
    }

    public static function contentToJSONContent($content)
    {
        $editor = new Editor();
        $content = $editor->sanitize($content);
        return $editor->setContent($content)->getJSON();
    }
}

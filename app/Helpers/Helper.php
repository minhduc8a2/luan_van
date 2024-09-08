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

    public static function sanitizeContent($content)
    {
        $editor = new Editor([
            'extensions' => [
                new \Tiptap\Extensions\StarterKit,
                new CustomMention,
            ]
        ]);
        return  $editor->sanitize($content);
    }
}

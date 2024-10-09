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
    public static function contentToHTML(string $content)
    {
        $editor = new Editor([
            'extensions' => [
                new \Tiptap\Extensions\StarterKit,
                new CustomMention,
            ]
        ]);
        $content = $editor->sanitize($content);
        $editor->setContent($content);
        return  $editor->getHTML();
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

    public static function createErrorResponse($message = "Something went wrong! Please try later!")
    {
        return abort(500, $message);
    }

    public static function createSuccessResponse($message = "ok")
    {
        return ['message' => $message];
    }
}

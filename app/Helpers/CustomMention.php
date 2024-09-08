<?php

namespace App\Helpers;

use Tiptap\Utils\HTML;

class CustomMention extends \Tiptap\Nodes\Mention
{
    public function renderHTML($node, $HTMLAttributes = [])
    {
        
        return [
            'span',
            HTML::mergeAttributes(
                $this->options['HTMLAttributes'],
                ["class" => "mention"],
            ),
            0,
        ];
    }
}

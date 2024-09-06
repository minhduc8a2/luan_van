<?php

namespace App\Http\Controllers;

use App\Models\Channel;
use App\Models\Message;
use App\Models\Reaction;
use Illuminate\Http\Request;

class ReactionController extends Controller
{
    public static function middleware(): array
    {
        return [
            'auth',
        ];
    }
    public function store(Request $request, Channel $channel, Message $message)
    {

        if ($request->user()->cannot('create', [Reaction::class, $channel])) {
            abort(403);
        }
        $validated = $request->validate([
            'emoji_id' => "required:string"
        ]);

        try {
            $message->reactions()->create([
                "emoji_id" => $validated['emoji_id'],
                'user_id' => $request->user()->id
            ]);
            return back();
        } catch (\Throwable $th) {
            return back()->withErrors(["fail" => "Failed to make reaction on the message"]);
        }
    }
}

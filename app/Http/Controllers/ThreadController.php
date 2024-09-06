<?php

namespace App\Http\Controllers;

use App\Models\Thread;
use App\Models\Channel;
use App\Models\Message;
use Illuminate\Http\Request;

class ThreadController extends Controller
{
    public function getMessages(Request $request, Channel $channel, Message $message)
    {

        if ($request->user()->cannot('view', [Thread::class, $channel])) return abort(403);

        $thread = $message->thread;
        if (!$thread) return [];

        return ['messages' => $thread->messages()->with(['attachments','reactions'])->latest()->simplePaginate(10)];
    }
}

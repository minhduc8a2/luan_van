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
        $perPage = 10;

        if ($request->user()->cannot('view', [Thread::class, $channel])) return abort(403);

        $messageId = $request->query('message_id');
        $thread = $message->thread;
        $pageNumber = null;
        if ($messageId) {
            $threadMessage = Message::find($messageId);
            if ($threadMessage) {

                $threadMessagePosition = $thread->messages()
                    ->latest() // Order by latest first
                    ->where('created_at', '>=', $threadMessage->created_at) // Messages that are newer or equal to the mentioned one
                    ->count();
                $pageNumber = ceil($threadMessagePosition / $perPage);
            }
        }

        if (!$thread) return [];

        return [
            'messages' => $messageId ?
                $thread
                ->messages()
                ->withTrashed()
                ->with(['files', 'reactions'])
                ->latest()
                ->simplePaginate($perPage, ['*'], 'page', $pageNumber)
                :
                $thread
                ->messages()
                ->withTrashed()
                ->with(['files', 'reactions'])
                ->latest()
                ->simplePaginate($perPage)
        ];
    }
}

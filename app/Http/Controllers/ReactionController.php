<?php

namespace App\Http\Controllers;

use App\Events\ChannelEvent;
use App\Helpers\ChannelEventsEnum;
use App\Helpers\Helper;
use App\Models\Channel;
use App\Models\Message;
use App\Models\Reaction;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReactionController extends Controller
{

    public function store(Request $request, Workspace $workspace, Channel $channel, Message $message)
    {

        if ($request->user()->cannot('create', [Reaction::class, $channel])) {
            abort(403);
        }
        $validated = $request->validate([
            'emoji_id' => "required|string"
        ]);
        $user = $request->user();
        try {
            DB::beginTransaction();
            $reaction =  Reaction::create([
                "message_id" => $message->id,
                "emoji_id" => $validated['emoji_id'],
                'user_id' => $user->id
            ]);
          
            broadcast(new ChannelEvent(
                $channel->id,
                ChannelEventsEnum::REACTION_CREATED->name,
                $reaction
            ));
            DB::commit();
            return Helper::createSuccessResponse();
        } catch (\Throwable $th) {
            DB::rollBack();
            Helper::createErrorResponse();
        }
    }

    public function delete(Request $request, Workspace $workspace, Channel $channel, Reaction $reaction)
    { {

            if ($request->user()->cannot('delete', [Reaction::class, $channel, $reaction])) {
                abort(403);
            }
            try {
                DB::beginTransaction();
                $reactionId = $reaction->id;
                $message_id = $reaction->message_id;
                $reaction->delete();
                broadcast(new ChannelEvent(
                    $channel->id,
                    ChannelEventsEnum::REACTION_DELETED->name,
                    ['reactionId' => $reactionId, 'message_id' => $message_id]
                ));

                DB::commit();
                return Helper::createSuccessResponse();
            } catch (\Throwable $th) {
                DB::rollBack();
                Helper::createErrorResponse();
            }
        }
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Helpers\Helper;
use App\Models\Channel;
use App\Models\Workspace;
use Illuminate\Http\Request;
use App\Notifications\HuddleInvitationNotification;

class HuddleController extends Controller
{
    public function invite(Request $request,Workspace $workspace, Channel $channel)
    {
        if ($request->user()->cannot('view', $channel)) abort(403);
        try {
            //code...
            $validated = $request->validate(["users" => "required|array"]);
            $users = $validated['users'];
            foreach ($users as $u) {
                $user = User::find($u['id']);
                $user->notify(new HuddleInvitationNotification($channel, $channel->workspace, $request->user(), $user));
            }

            return ["message" => "ok"];
        } catch (\Throwable $th) {
            Helper::createErrorResponse();
        }
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Channel;
use App\Notifications\HuddleInvitationNotification;
use Illuminate\Http\Request;

class HuddleController extends Controller
{
    public function invite(Request $request,Channel $channel){
        if($request->user()->cannot('view',$channel))abort(403);
        $validated = $request->validate(["users"=>"required|array"]);
        $users = $validated['users'];
        foreach($users as $u){
            $user = User::find($u['id']);
            $user->notify(new HuddleInvitationNotification($channel,$request->user(),$user));
        }
    }
}

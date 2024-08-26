<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Models\Invitation;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Routing\Controllers\HasMiddleware;

class InvitationController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            'auth',
        ];
    }
    public function index(Request $request, $code)
    {

        $invitation = Invitation::where('code', '=', $code)->first();
        //check invitation link is exists and valid
        $expirationTime = $invitation->created_at->addDays(30);

        $isExpired = Carbon::now()->greaterThan($expirationTime);

        if ($isExpired) {
            return abort(403);
        }
        //add user to workspace
        $user = $request->user();
        $workspace = Workspace::find($invitation->workspace_id);
        $workspace->addUserToWorkspace($user);
        //
        return redirect(route('workspace.show', $workspace->id));
    }

    public function store(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('create', [Invitation::class, $workspace])) abort(403);

        $validated = $request->validate([
            'code' => 'required|string|max:255',
            'workspace_id' => 'required|integer',
        ]);

        Invitation::create([
            'code' => $validated['code'],
            'workspace_id' => $validated['workspace_id']
        ]);

        return back()->with('invitation_link', env('PUBLIC_APP_URL') . '/invitations/' . $validated['code']);
    }
}

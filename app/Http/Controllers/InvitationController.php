<?php

namespace App\Http\Controllers;

use App\Helpers\Helper;
use App\Models\Workspace;
use App\Models\Invitation;
use App\Mail\InvitationMail;
use Illuminate\Http\Request;
use App\Events\WorkspaceEvent;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Routing\Controllers\HasMiddleware;

class InvitationController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            'auth',
        ];
    }
    public function index(Request $request, string $code)
    {

        try {
            DB::beginTransaction();
            $invitation = Invitation::where('code', '=', $code)->first();
            //check invitation link is exists and valid
            $expirationTime = $invitation->created_at->addDays(30);

            $isExpired = Carbon::now()->greaterThan($expirationTime);

            if ($isExpired) {
                abort(403, 'Expired link');
            }
            //add user to workspace
            $user = $request->user();
            /**
             * @var Workspace $workspace
             */
            $workspace = Workspace::find($invitation->workspace_id);
            $workspace->addUserToWorkspace($user);

            broadcast(new WorkspaceEvent(workspace: $workspace, type: "newUserJoinWorkspace", fromUserId: $request->user()->id, data:$user));
            DB::commit();
            //
            return redirect(route('workspace.show', $workspace->id));
        } catch (\Throwable $th) {
            DB::rollBack();
            return abort(403, 'Invalid link');
        }
    }

    public function store(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('create', [Invitation::class, $workspace])) abort(403);

        $validated = $request->validate([
            'code' => 'required|string|max:255',
            'workspace_id' => 'required|integer',
        ]);
        try {
            DB::beginTransaction();
            Invitation::create([
                'code' => $validated['code'],
                'workspace_id' => $validated['workspace_id']
            ]);
            $invitationLink = env('PUBLIC_APP_URL') . '/invitations/' . $validated['code'];
            DB::commit();
            return back()->with('invitation_link', $invitationLink);
        } catch (\Throwable $th) {
            DB::rollBack();
            return abort(403);
        }
    }

    public function storeAndSendInvitationMail(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('create', [Invitation::class, $workspace])) abort(403);

        $validated = $request->validate([
            'code' => 'required|string|max:255',
            'workspace_id' => 'required|integer',
            'emailList.*' => 'required|email'
        ]);

        try {
            Invitation::create([
                'code' => $validated['code'],
                'workspace_id' => $validated['workspace_id']
            ]);
            $workspace = Workspace::findOrFail($validated['workspace_id']);
            $invitationLink = env('PUBLIC_APP_URL') . '/invitations/' . $validated['code'];
            $emailList = $validated['emailList'];
            $invitatioEmailSent = [];
            foreach ($emailList as $email) {
                if ($workspace->isWorkspaceMemberByEmail($email)) continue;
                $toUserName = Helper::nameFromEmail($email);
                Mail::to($email)->send(new InvitationMail($invitationLink, $workspace->name, $request->user()->name, $toUserName));
                array_push($invitatioEmailSent, $email);
            }
            // $request->session()->flash('invitation_link', $invitationLink);

            return back()->with('invitation_sent', $invitatioEmailSent);
        } catch (\Throwable $th) {
            dd($th);
            return abort(403);
        }
    }
}

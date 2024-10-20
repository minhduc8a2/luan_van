<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Helpers\Helper;
use App\Models\Workspace;
use App\Helpers\BaseRoles;
use App\Models\Invitation;
use Illuminate\Support\Str;
use App\Mail\InvitationMail;
use Illuminate\Http\Request;
use App\Events\WorkspaceEvent;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use function PHPUnit\Framework\throwException;

use Illuminate\Validation\ValidationException;
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

            if ($invitation->isExpired()) {
                abort(403, 'Expired link');
            }
            $user = $request->user();
            if ($invitation->email && $user->email != $invitation->email) abort(401, 'Invalid link');

            $workspace = $invitation->workspace;
            //check already memebers or requested
            if ($user->workspaces()->where('workspaces.id', $workspace->id)->exists()) {
                return redirect(route('workspace.show', $workspace->id));
            }
            if ($workspace->isInvitationToWorkspaceWithAdminApprovalRequired()) {
                $user->workspaces()->attach($workspace->id, ['role_id' => Role::getRoleIdByName(BaseRoles::MEMBER->name), 'invitation_id' => $invitation->id]);
                $user = $workspace->users()->where('users.id', $user->id)->first();
                $user->workspaceRole = Role::find($user->pivot->role_id)->setVisible(["name"]);
                broadcast(new WorkspaceEvent(workspace: $workspace, type: "newUserRequestToJoinWorkspace", fromUserId: $request->user()->id, data: $user));
                DB::commit();
                return redirect(route('workspaces', ['request' => true, 'workspaceId' => $workspace->id]));
            } else {
                $workspace->addUserToWorkspace($user, $invitation->id);
                $user = $workspace->users()->where('users.id', $user->id)->first();
                $user->workspaceRole = Role::find($user->pivot->role_id)->setVisible(["name"]);
                broadcast(new WorkspaceEvent(workspace: $workspace, type: "newUserJoinWorkspace", fromUserId: $request->user()->id, data: $user));
                DB::commit();
                return redirect(route('channels.show', ['workspace' => $workspace->id, 'channel' => $workspace->main_channel_id]));
            }

            //
        } catch (\Throwable $th) {
            DB::rollBack();
            dd($th);
            return abort(403, 'Invalid link');
        }
    }

    public function store(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('create', [Invitation::class, $workspace])) abort(403);
        try {

            DB::beginTransaction();
            $invitation = Invitation::factory()->create([
                'user_id' => $request->user()->id,
                'workspace_id' => $workspace->id,
            ]);
            $invitationLink = env('PUBLIC_APP_URL') . '/invitations/' . $invitation->code;
            DB::commit();
            return ['invitation_link' => $invitationLink];
        } catch (\Throwable $th) {
            DB::rollBack();
            dd($th);
            Helper::createErrorResponse();
        }
    }

    public function storeAndSendInvitationMail(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('create', [Invitation::class, $workspace])) abort(403);

        $validated = $request->validate([
            'emailList.*' => 'required|email'
        ]);
        $requestUser = $request->user();
        try {
            DB::beginTransaction();
            $emailList = $validated['emailList'];
            foreach ($emailList as $email) {
                if ($workspace->isWorkspaceMemberByEmail($email)) continue;
                // if (Invitation::hasInvitationIn($email, $workspace, $requestUser, 1)) continue;
                $toUserName = Helper::nameFromEmail($email);
                $invitation = Invitation::factory()->create([
                    'user_id' => $request->user()->id,
                    'workspace_id' => $workspace->id,
                    'email' => $email,
                ]);
                $invitationLink = env('PUBLIC_APP_URL') . '/invitations/' . $invitation->code;
                Mail::to($email)->send(new InvitationMail($invitationLink, $workspace->name, $request->user()->name, $toUserName));
            }
            DB::commit();
            return Helper::createSuccessResponse();
        } catch (\Throwable $th) {
            DB::rollBack();
            dd($th);
            return Helper::createErrorResponse();
        }
    }
}

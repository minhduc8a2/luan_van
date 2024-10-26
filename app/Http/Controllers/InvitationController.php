<?php

namespace App\Http\Controllers;

use App\Events\WorkspaceAdminEvent;
use App\Models\Role;
use App\Helpers\Helper;
use App\Models\Workspace;
use App\Helpers\BaseRoles;
use App\Models\Invitation;
use Illuminate\Support\Str;
use App\Mail\InvitationMail;
use Illuminate\Http\Request;
use App\Events\WorkspaceEvent;
use App\Helpers\WorkspaceEventsEnum;
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
                broadcast(new WorkspaceEvent($workspace->id, WorkspaceEventsEnum::NEW_USER_REQUEST_TO_JOIN_WORKSPACE->name,  data: ['newUser' => $user, 'byUser' => $request->user()->id]));
                broadcast(new WorkspaceAdminEvent(
                    $workspace->id,
                    $invitation->email != null ?
                        WorkspaceEventsEnum::INVITATION_TYPE_EMAIL_UPDATED->name
                        :
                        WorkspaceEventsEnum::INVITATION_LINK_UPDATED->name,
                    $invitation
                ));
                DB::commit();
                return redirect(route('workspaces', ['request' => true, 'workspaceId' => $workspace->id]));
            } else {
                $workspace->addUserToWorkspace($user, $invitation->id);
                $user = $workspace->users()->where('users.id', $user->id)->first();
                $user->workspaceRole = Role::find($user->pivot->role_id)->setVisible(["name"]);
                broadcast(new WorkspaceEvent($workspace->id, WorkspaceEventsEnum::NEW_USER_JOIN_WORKSPACE->name, data: ['newUser' => $user, 'byUser' => $request->user()->id]));
                broadcast(new WorkspaceAdminEvent(
                    $workspace->id,
                    $invitation->email != null ?
                        WorkspaceEventsEnum::INVITATION_TYPE_EMAIL_UPDATED->name
                        :
                        WorkspaceEventsEnum::INVITATION_LINK_UPDATED->name,
                    $invitation
                ));
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
            broadcast(new WorkspaceAdminEvent($workspace->id, WorkspaceEventsEnum::INVITATION_LINK_CREATED->name, $invitation));
            $invitationLink = env('VITE_PUBLIC_APP_URL') . '/invitations/' . $invitation->code;
            DB::commit();
            return ['invitation_link' => $invitationLink];
        } catch (\Throwable $th) {
            DB::rollBack();
            dd($th);
            Helper::createErrorResponse();
        }
    }

    public function resendInvitation(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('resendInvitation', [Invitation::class, $workspace])) abort(403);
        $validated = $request->validate([
            'id' => 'required|integer'
        ]);
        try {
            $invitation = $workspace->invitations()->where('invitations.id', $validated['id'])->first();
            if ($invitation) {
                $toUserName = Helper::nameFromEmail($invitation->email);
                $invitationLink = env('VITE_PUBLIC_APP_URL') . '/invitations/' . $invitation->code;
                Mail::to($invitation->email)->send(new InvitationMail($invitationLink, $workspace->name, $request->user()->name, $toUserName));

                return Helper::createSuccessResponse();
            }
        } catch (\Throwable $th) {
            throw $th;
        }
        return Helper::createErrorResponse();
    }
    public function storeAndSendInvitationMail(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('create', [Invitation::class, $workspace])) abort(401);

        $validated = $request->validate([
            'emailList.*' => 'required|email'
        ]);

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
                broadcast(new WorkspaceAdminEvent($workspace->id, WorkspaceEventsEnum::INVITATION_TYPE_EMAIL_CREATED->name, $invitation));
                $invitationLink = env('VITE_PUBLIC_APP_URL') . '/invitations/' . $invitation->code;
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

    public function renew(Request $request, Workspace $workspace, Invitation $invitation)
    {
        if ($request->user()->cannot('delete', [Invitation::class, $workspace])) abort(401);
        try {
            DB::beginTransaction();
            $invitation->expired_at = Carbon::now()->addDays(30);
            $invitation->save();
            broadcast(new WorkspaceAdminEvent($workspace->id, WorkspaceEventsEnum::INVITATION_LINK_UPDATED->name, $invitation));
            DB::commit();
            return ['invitation' => $invitation];
        } catch (\Throwable $th) {
            DB::rollBack();
            dd($th);
            return Helper::createErrorResponse();
        }
    }
    public function destroy(Request $request, Workspace $workspace, Invitation $invitation)
    {
        if ($request->user()->cannot('delete', [Invitation::class, $workspace])) abort(401);
        try {
            $copiedInvitation = ['id' => $invitation->id, 'code' => $invitation->code, 'email' => $invitation->email];
            $invitation->delete();

            broadcast(new WorkspaceAdminEvent($workspace->id, $copiedInvitation['email'] ?   WorkspaceEventsEnum::INVITATION_TYPE_EMAIL_DELETED->name : WorkspaceEventsEnum::INVITATION_LINK_DELETED->name, $copiedInvitation));

            return Helper::createSuccessResponse();
        } catch (\Throwable $th) {
            throw $th;
        }
        Helper::createErrorResponse();
    }
}

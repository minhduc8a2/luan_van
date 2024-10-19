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
            if (!$workspace) throw ValidationException::withMessages([
                'message' => 'Invalid link',
            ]);

            //check already memebers or requested
            if ($user->workspaces()->where('workspaces.id', $workspace->id)->exists()) {
                return redirect(route('workspace.show', $workspace->id));
            }


            if ($workspace->isInvitationToWorkspaceWithAdminApprovalRequired()) {
                $user->workspaces()->attach($workspace->id, ['role_id' => Role::getRoleIdByName(BaseRoles::MEMBER->name)]);
                $user = $workspace->users()->where('users.id', $user->id)->first();
                $user->workspaceRole = Role::find($user->pivot->role_id)->setVisible(["name"]);
                broadcast(new WorkspaceEvent(workspace: $workspace, type: "newUserRequestToJoinWorkspace", fromUserId: $request->user()->id, data: $user));
                DB::commit();
                return redirect(route('workspaces', ['request' => true, 'workspaceId' => $workspace->id]));
            } else {

                $workspace->addUserToWorkspace($user);
                $user = $workspace->users()->where('users.id', $user->id)->first();
                $user->workspaceRole = Role::find($user->pivot->role_id)->setVisible(["name"]);
                broadcast(new WorkspaceEvent(workspace: $workspace, type: "newUserJoinWorkspace", fromUserId: $request->user()->id, data: $user));
                DB::commit();
                return redirect(route('workspace.show', $workspace->id));
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

        $validated = $request->validate([

            'workspace_id' => 'required|integer',
        ]);
        try {
            $code = Str::uuid();
            DB::beginTransaction();
            Invitation::create([
                'code' => $code,
                'workspace_id' => $validated['workspace_id']
            ]);
            $invitationLink = env('PUBLIC_APP_URL') . '/invitations/' . $code;
            DB::commit();
            return ['invitation_link' => $invitationLink];
        } catch (\Throwable $th) {
            DB::rollBack();
            Helper::createErrorResponse();
        }
    }

    public function storeAndSendInvitationMail(Request $request, Workspace $workspace)
    {
        if ($request->user()->cannot('create', [Invitation::class, $workspace])) abort(403);

        $validated = $request->validate([

            'workspace_id' => 'required|integer',
            'emailList.*' => 'required|email'
        ]);

        try {
            $code = Str::uuid();
            Invitation::create([
                'code' => $code,
                'workspace_id' => $validated['workspace_id']
            ]);
            $workspace = Workspace::findOrFail($validated['workspace_id']);
            $invitationLink = env('PUBLIC_APP_URL') . '/invitations/' . $code;
            $emailList = $validated['emailList'];
            $invitatioEmailSent = [];
            foreach ($emailList as $email) {
                if ($workspace->isWorkspaceMemberByEmail($email)) continue;
                $toUserName = Helper::nameFromEmail($email);
                Mail::to($email)->send(new InvitationMail($invitationLink, $workspace->name, $request->user()->name, $toUserName));
                array_push($invitatioEmailSent, $email);
            }
            // $request->session()->flash('invitation_link', $invitationLink);

            return ['invitation_sent' => $invitatioEmailSent, 'invitation_link' => $invitationLink];
        } catch (\Throwable $th) {

            return Helper::createErrorResponse();
        }
    }
}

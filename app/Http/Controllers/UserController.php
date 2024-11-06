<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Inertia\Inertia;
use App\Models\Workspace;
use App\Helpers\BaseRoles;
use Illuminate\Http\Request;
use App\Events\WorkspaceEvent;
use App\Helpers\Helper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\ProfileUpdateRequest;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }
    public function browseUsers(Request $request, Workspace $workspace)
    {



        // $page = 2;
        if ($request->expectsJson()) {

            $hiddenUserIds =  $request->user()->hiddenUsers()->wherePivot('workspace_id', $workspace->id)->pluck('hidden_user_id')->toArray();

            $workspaceUsers =  $workspace->users()->get();
            return $workspaceUsers->map(function ($user) use ($hiddenUserIds) {
                if (in_array($user->id, $hiddenUserIds)) $user->is_hidden = true;
                $user->workspaceRole = Role::find($user->pivot->role_id)->setVisible(["name"]);
                return $user;
            });
        }
        return Inertia::render("Workspace/Index");
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        //
    }


    public function updateAvatar(Request $request, User $user)
    {
        if ($request->user()->id !== $user->id) return abort(403);

        $validated = $request->validate([
            'avatarFile' => "max:" . (10 * 1024),
            'workspaceId' => 'integer'
        ]);

        $avatarFile = $validated['avatarFile'];

        $path = $avatarFile->store('public/users_' . $user->id);
        $url = Storage::url($path);
        $oldAvatarFilePath = null;
        try {
            DB::beginTransaction();
            //delete old avatar file
            $oldAvatarFile = $user->files()->where('url', $user->avatar_url)->first();
            if ($oldAvatarFile) {
                $oldAvatarFilePath = $oldAvatarFile->path;
                $oldAvatarFile->delete();
            }
            //
            $user->files()->create(['path' => $path, 'url' => $url, 'type' => $avatarFile->getMimeType(), 'name' => $avatarFile->getClientOriginalName(), 'workspace_id' => $validated['workspaceId']]);
            $user->avatar_url = $url;
            $user->save();
            DB::commit();
        } catch (\Throwable $th) {
            DB::rollBack();
            Storage::delete($path);
            Helper::createErrorResponse();
        }
        if ($oldAvatarFilePath) {
            Storage::delete($oldAvatarFilePath);
        }
        return Helper::createSuccessResponse();
    }
    public function deleteAvatar(Request $request,Workspace $workspace, User $user)
    {
        if ($request->user()->id !== $user->id) return abort(403);
        if ($user->avatar_url == null) return back();
        $oldAvatarFilePath = null;
        try {
            DB::beginTransaction();

            $avatarFile = $user->files()->where('url', $user->avatar_url)->first();
            if ($avatarFile) {
                $oldAvatarFilePath = $avatarFile->path;
                $avatarFile->delete();
            }
            $user->avatar_url = null;
            $user->save();
            DB::commit();
        } catch (\Throwable $th) {
            DB::rollBack();
            Helper::createErrorResponse();
        }
        if ($oldAvatarFilePath) {
            Storage::delete($oldAvatarFilePath);
        }
        return Helper::createSuccessResponse();
    }

    public function hide(Request $request, Workspace $workspace)
    {
        $validated = $request->validate([
            "userId" => "required|integer",
            "mode" => "required|in:hide,unhide",
        ]);
        if ($request->user()->id == $validated["userId"]) return abort(403);


        try {
            DB::beginTransaction();
            if ($validated["mode"] == "hide") {
                DB::table("hidden_users")->insert([
                    'user_id' => $request->user()->id,
                    'hidden_user_id' => $validated["userId"],
                    "workspace_id" => $workspace->id
                ]);
            } else {
                DB::table("hidden_users")
                    ->where('user_id', $request->user()->id)
                    ->where('hidden_user_id', $validated["userId"])
                    ->where('workspace_id', $workspace->id)
                    ->delete();
            }


            DB::commit();
            return Helper::createSuccessResponse();
        } catch (\Throwable $th) {
            DB::rollBack();
            Helper::createErrorResponse();
        }
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        //
    }
}

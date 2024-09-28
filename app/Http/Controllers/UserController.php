<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\ProfileUpdateRequest;
use Inertia\Inertia;

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
        $perPage = 10;

        $name = $request->query('name') ?? "";
        // $page = $request->query('page') ?? 1;
        $last_id = $request->query('last_id');
        $direction = $request->query('direction') ?? "bottom";
        // $page = 2;
        if ($request->expectsJson()) {

            $query = $workspace->users();

            if ($last_id) {
                if ($direction === 'bottom') {
                    $query->where('users.id', '<', $last_id)->orderBy('id', 'desc');
                } else {
                    $query->where('users.id', '>', $last_id)->orderBy('id', 'asc');
                }
            } else {
                $query->orderBy('users.id', 'desc');
            }
            return $query->limit($perPage)->where('users.name', 'like', '%' . $name . '%')->get();
        }
        return Inertia::render("Workspace/BrowseUsers/BrowseUsers");
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

    /**
     * Update the specified resource in storage.
     */
    public function update(ProfileUpdateRequest $request, User $user)
    {
        if ($request->user()->id !== $user->id) return abort(403);
        $name = $request->validated('name');
        $display_name = $request->validated('display_name');
        $email = $request->validated('email');
        $phone = $request->validated('phone');
        try {
            DB::beginTransaction();

            if ($name) $user->name = $name;
            if ($display_name) $user->display_name = $display_name;
            if ($email) $user->email = $email;
            if ($phone) $user->phone = $phone;

            $user->save();
            DB::commit();
            return back();
        } catch (\Throwable $th) {
            DB::rollBack();
            return back()->withErrors(['server' => "Something went wrong! Please try later."]);
        }
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
            return back()->withErrors(['server' => "Something went wrong! Please try later."]);
        }
        if ($oldAvatarFilePath) {
            Storage::delete($oldAvatarFilePath);
        }
        return back();
    }
    public function deleteAvatar(Request $request, User $user)
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
                $user->avatar_url = null;
                $user->save();
            }
            DB::commit();
        } catch (\Throwable $th) {
            DB::rollBack();
            return back()->withErrors(['server' => "Something went wrong! Please try later."]);
        }
        if ($oldAvatarFilePath) {
            Storage::delete($oldAvatarFilePath);
        }
        return back();
    }

    public function hide(Request $request)
    {
        $validated = $request->validate([
            "userId" => "required|integer",
            "workspaceId" => "required|integer",
        ]);
        if ($request->user()->id == $validated["userId"]) return abort(403);


        try {
            DB::beginTransaction();
            $request->user()->hiddenUsers()->attach($validated["userId"], ["workspace_id" => $validated["workspaceId"]]);

            DB::commit();
            return back();
        } catch (\Throwable $th) {
            DB::rollBack();
            return back()->withErrors(['server' => "Something went wrong! Please try later."]);
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

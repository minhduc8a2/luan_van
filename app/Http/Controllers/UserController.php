<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
    public function update(Request $request, User $user)
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
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        //
    }
}

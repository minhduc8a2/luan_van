<?php

use App\Models\User;
use Inertia\Inertia;

use Illuminate\Http\Request;
use App\Jobs\DeleteTemporaryFiles;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FileController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Redirect;
use Laravel\Socialite\Facades\Socialite;
use App\Http\Controllers\HuddleController;
use App\Http\Controllers\ThreadController;
use App\Http\Controllers\ChannelController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReactionController;
use App\Http\Controllers\WorkspaceController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Auth\ProviderController;
use App\Http\Middleware\HandleWorkspaceRequests;
use App\Models\Workspace;


Route::get("/", function () {
    return "homepage";
})->name('home');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');
Route::post("/workspaces", [WorkspaceController::class, 'store'])->name('workspaces.store');
Route::middleware(['auth', HandleWorkspaceRequests::class])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/workspaces', [WorkspaceController::class, 'index'])->name('workspaces');

    Route::prefix('workspaces/{workspace}')->group(function () {

        Route::prefix('channels/{channel}')->group(function () {
            Route::post("/edit_description", [ChannelController::class, 'editDescription'])->name("channel.edit_description");
            Route::post("/edit_name", [ChannelController::class, 'editName'])->name("channel.edit_name");
            Route::post("/change_type", [ChannelController::class, 'changeType'])->name("channel.change_type");
            Route::post("/leave", [ChannelController::class, 'leave'])->name("channel.leave");
            Route::post("/join", [ChannelController::class, 'join'])->name("channels.join");
            Route::post("/add_managers", [ChannelController::class, 'addManagers'])->name("channels.addManagers");
            Route::post("/remove_manager", [ChannelController::class, 'removeManager'])->name("channels.removeManager");
            Route::post("/last_read", [ChannelController::class, 'lastRead'])->name("channel.last_read");
            Route::post("/remove_user_from_channel", [ChannelController::class, 'removeUserFromChannel'])->name("channel.remove_user_from_channel");
            Route::post("/add_users_to_channel", [ChannelController::class, 'addUsersToChannel'])->name("channel.add_users_to_channel");
            Route::post("/update_permissions", [ChannelController::class, 'updatePermissions'])->name("channel.update_permissions");
            Route::post("/archive", [ChannelController::class, 'archive'])->name("channels.archive");
            Route::delete("", [ChannelController::class, 'destroy'])->name("channel.delete");
            Route::post("/messages", [MessageController::class, 'store'])->name('message.store');
            Route::get("", [ChannelController::class, 'show'])->name('channels.show')->missing(function (Workspace $workspace) {
                return Redirect::route('/channels/' . $workspace->mainChannel()->id);
            });
            Route::get("/init_channel_data", [ChannelController::class, 'initChannelData'])->name('channels.initChannelData');
            Route::get("/messages/infinite_messages", [MessageController::class, 'infiniteMessages'])->name('messages.infiniteMessages');
            Route::get("/messages/specific_messages", [MessageController::class, 'getSpecificMessagesById'])->name('messages.getSpecificMessagesById');
            Route::post("/messages/{message}", [MessageController::class, 'storeThreadMessage'])->name('thread_message.store');
            Route::post("/huddle_invitation", [HuddleController::class, 'invite'])->name("huddle.invitation");
            Route::post("/messages/{message}/reactions", [ReactionController::class, 'store'])->name('reaction.store');
            Route::post("/messages/{message}/reactions/delete", [ReactionController::class, 'delete'])->name('reaction.delete');
        });

        Route::post("/invitation_link", [InvitationController::class, 'store'])->name('invitation.store');
        Route::post("/invitation_mail", [InvitationController::class, 'storeAndSendInvitationMail'])->name('invitation.mail');
        Route::get("/notifications", [NotificationController::class, 'get'])->name('notifications.get');
        // Route::get('/mailable', function () {
        //     return new  InvitationMail("https://google.com", "company A", "A", "B");
        // });
        Route::get('/browse_files', [FileController::class, 'index'])->name('files.index');
        Route::delete('/files/{file}', [FileController::class, 'destroy'])->name('files.delete');



        Route::post('/users/hide', [UserController::class, 'hide'])->name("users.hide");
        Route::patch('/users/{user}', [UserController::class, 'update'])->name("users.update");
        Route::post('/users/{user}/updateAvatar', [UserController::class, 'updateAvatar'])->name("users.updateAvatar");
        Route::delete('users/{user}/deleteAvatar', [UserController::class, 'deleteAvatar'])->name("users.deleteAvatar");
        Route::post("/upload_file/{user}", function (Request $request, Workspace $workspace, User $user) {

            $validated = $request->validate([
                'file' => "max:" . (200 * 1024),
            ]);
            // dd($validated['files']);
            $temporaryFileObjects = [];
            $file = $validated['file'];
            $path = $file->store('public/users_' . $user->id);
            array_push($temporaryFileObjects, ['path' => $path, 'type' => $file->getMimeType(), 'name' => $file->getClientOriginalName()]);

            DeleteTemporaryFiles::dispatch($temporaryFileObjects)->delay(now()->addMinutes(30));
            return response()->json($temporaryFileObjects);
        })->name('upload_files');


        Route::get("", [WorkspaceController::class, 'show'])->name('workspace.show')->missing(function () {
            return Redirect::route('workspaces');
        });
        Route::patch("", [WorkspaceController::class, 'update'])->name('workspaces.update');
        Route::patch("/change_member_role", [WorkspaceController::class, 'changeMemberRole'])->name('workspaces.changeMemberRole');
        Route::patch("/deactivate_user", [WorkspaceController::class, 'deactivateUser'])->name('workspaces.deactivateUser');
        Route::patch("/invitation_permission", [WorkspaceController::class, 'updateInvitationPermission'])->name('workspaces.updateInvitationPermission');
        Route::delete("", [WorkspaceController::class, 'destroy'])->name('workspaces.delete')->middleware('throttle');
        Route::get("/admin/settings", [WorkspaceController::class, 'settings'])->name('workspaces.settings');
        Route::get("/admin/about_workspace", [WorkspaceController::class, 'aboutWorkspace'])->name('workspaces.aboutWorkspace');
        Route::get("/admin/account_profile", [WorkspaceController::class, 'accountAndProfile'])->name('workspaces.accountAndProfile');
        Route::get("/admin/home", [WorkspaceController::class, 'settingsHome'])->name('workspaces.settingsHome');
        Route::get("/admin/manage_members", [WorkspaceController::class, 'manageMembers'])->name('workspaces.manageMembers');

        Route::post("/accept_joining_request", [WorkspaceController::class, 'acceptJoiningRequest'])->name('workspaces.acceptJoiningRequest');
        Route::get("/init_workspace_data", [WorkspaceController::class, 'initWorkspaceData'])->name('workspaces.initWorkspaceData');
        Route::get('/browse_users', [UserController::class, 'browseUsers'])->name("users.browseUsers");

        Route::get("/get_regular_channels", [ChannelController::class, 'getRegularChannels'])->name('workspaces.getRegularChannels');
        Route::get("/getChannels", [ChannelController::class, 'getWorkspaceChannels'])->name('workspaces.getChannels');
        Route::get("/direct_channels", [WorkspaceController::class, 'getDirectChannels'])->name('workspace.direct_channels');


        Route::get("/browse_channels", [ChannelController::class, 'browseChannels'])->name('channels.browseChannels');
        Route::post("/channels", [ChannelController::class, 'store'])->name('channel.store');
        Route::get("/channels/check_exists", [ChannelController::class, 'checkChannelExists'])->name('channel.checkExists');


        Route::get("/messages", [MessageController::class, 'getMessage'])->name('messages.getMessage');
        Route::post("/messages/{message}", [MessageController::class, 'update'])->name('message.update');
        Route::delete("/messages/{message}", [MessageController::class, 'destroy'])->name('message.delete');

        Route::get("/messages/{message}/thread_messages", [MessageController::class, 'getThreadMessages'])->name("messages.threadMessages");

        Route::post("/notifications/mark_read", [NotificationController::class, "markRead"])->name("notifications.mark_read");
        Route::post("/notifications/{notificationId}/mark_view", [NotificationController::class, "markView"])->name("notifications.mark_view");
    });
});

require __DIR__ . '/auth.php';


Route::get("/invitations/{code}", [InvitationController::class, 'index'])->name('invitation.index');

<?php

use App\Models\User;
use Inertia\Inertia;
use App\Models\Attachment;
use App\Mail\InvitationMail;
use Illuminate\Http\Request;
use App\Jobs\DeleteTemporaryFiles;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Laravel\Socialite\Facades\Socialite;
use App\Http\Controllers\HuddleController;
use App\Http\Controllers\ThreadController;
use App\Http\Controllers\ChannelController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WorkspaceController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Auth\ProviderController;
use App\Http\Controllers\ReactionController;


Route::get('/auth/redirect', function () {
    return Socialite::driver('github')->redirect();
});

Route::get('/auth/callback', function () {
    $user = Socialite::driver('github')->user();

    // $user->token
});
Route::get('/', function (Request $request) {
    return Inertia::render('Welcome', [
        "workspaces" => $request->user()->workspaces
    ]);
})->middleware('auth')->name('home');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::post("/workspaces", [WorkspaceController::class, 'store'])->name('workspace.store');
    Route::get("/workspaces/{workspace}", [WorkspaceController::class, 'show'])->name('workspace.show');
    Route::get("/workspaces/{workspace}/direct_channels", [WorkspaceController::class, 'getDirectChannels'])->name('workspace.direct_channels');
    Route::post("workspaces/{workspace}/channels", [ChannelController::class, 'store'])->name('channel.store');
    Route::get("/channels/{channel}", [ChannelController::class, 'show'])->name('channel.show');
    Route::post("/channels/{channel}/edit_description", [ChannelController::class, 'editDescription'])->name("channel.edit_description");
    Route::post("/channels/{channel}/edit_name", [ChannelController::class, 'editName'])->name("channel.edit_name");
    Route::post("/channels/{channel}/change_type", [ChannelController::class, 'changeType'])->name("channel.change_type");
    Route::post("/channels/{channel}/leave", [ChannelController::class, 'leave'])->name("channel.leave");
    Route::post("/channels/{channel}/add_managers", [ChannelController::class, 'addManagers'])->name("channel.add_managers");
    Route::post("/channels/{channel}/remove_manager", [ChannelController::class, 'removeManager'])->name("channel.remove_manager");
    Route::post("/channels/{channel}/last_read", [ChannelController::class, 'lastRead'])->name("channel.last_read");
    Route::post("/channels/{channel}/remove_user_from_channel", [ChannelController::class, 'removeUserFromChannel'])->name("channel.remove_user_from_channel");
    Route::post("/channels/{channel}/messages", [MessageController::class, 'store'])->name('message.store');
    Route::post("/channels/{channel}/messages/{message}", [MessageController::class, 'storeThreadMessage'])->name('thread_message.store');
    Route::get("/channels/{channel}/messages/{message}/thread_messages", [ThreadController::class, 'getMessages'])->name("thread.messages");
    Route::post("/channels/{channel}/huddle_invitation", [HuddleController::class, 'invite'])->name("huddle.invitation");
    Route::post("/notifications/mark_read", [NotificationController::class, "markRead"])->name("notifications.mark_read");
    Route::post("/notifications/{notificationId}/mark_view", [NotificationController::class, "markView"])->name("notifications.mark_view");
    Route::post("/upload_file/{user}", function (Request $request, User $user) {

        $validated = $request->validate([
            'file' => "max:" . (200 * 1024),
        ]);
        // dd($validated['files']);
        $temporaryFileObjects = [];
        $file = $validated['file'];
        $path = $file->store('temporary/users_' . $user->id);
        array_push($temporaryFileObjects, ['path' => $path, 'type' => $file->getMimeType(), 'name' => $file->getClientOriginalName()]);

        DeleteTemporaryFiles::dispatch($temporaryFileObjects)->delay(now()->addMinutes(30));
        return response()->json($temporaryFileObjects);
    });
});

Route::get('/auth/{provider}/redirect', [ProviderController::class, 'redirect']);

Route::get('/auth/{provider}/callback', [ProviderController::class, 'callback']);
require __DIR__ . '/auth.php';

Route::post("/{workspace}/invitation_link", [InvitationController::class, 'store'])->name('invitation.store');
Route::post("/{workspace}/invitation_mail", [InvitationController::class, 'storeAndSendInvitationMail'])->name('invitation.mail');
Route::get("/invitations/{code}", [InvitationController::class, 'index'])->name('invitation.index');

Route::post("/channels/{channel}/messages/{message}/reactions", [ReactionController::class, 'store'])->name('reaction.store');
Route::post("/channels/{channel}/messages/{message}/reactions/delete", [ReactionController::class, 'delete'])->name('reaction.delete');

// Route::get('/mailable', function () {
//     return new  InvitationMail("https://google.com", "company A", "A", "B");
// });

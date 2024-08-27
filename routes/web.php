<?php

use App\Models\User;
use Inertia\Inertia;
use App\Models\Attachment;
use App\Mail\InvitationMail;
use Illuminate\Http\Request;

Route::get('/auth/redirect', function () {
    return Socialite::driver('github')->redirect();
});

Route::get('/auth/callback', function () {
    $user = Socialite::driver('github')->user();

    // $user->token
});

use App\Jobs\DeleteTemporaryFiles;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Laravel\Socialite\Facades\Socialite;
use App\Http\Controllers\ChannelController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WorkspaceController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\Auth\ProviderController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::post("/workspaces", [WorkspaceController::class, 'store'])->name('workspace.store');
    Route::get("/workspaces/{workspace}", [WorkspaceController::class, 'show'])->name('workspace.show');
    Route::get("/channels/{channel}", [ChannelController::class, 'show'])->name('channel.show');
    Route::post("/channels/{channel}/message", [MessageController::class, 'store'])->name('message.store');

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
Route::get('/mailable', function () {
    return new  InvitationMail("https://simpcity.su/", "company A", "A", "B");
});

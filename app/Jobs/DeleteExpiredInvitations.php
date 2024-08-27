<?php

namespace App\Jobs;

use App\Models\Invitation;
use Illuminate\Support\Carbon;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class DeleteExpiredInvitations implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $thresholdDate = Carbon::now()->subDays(30);
        // Query and delete expired invitations
        Invitation::where('created_at', '<', $thresholdDate)->delete();
    }
}

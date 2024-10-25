<?php

namespace App\Jobs;

use App\Models\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class DeleteChannel implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public string $id)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Channel::find($this->id)->delete();
    }
}

<?php

namespace App\Jobs;

use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class DeleteTemporaryFiles implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct(public $fileObjects)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $paths = [];
        foreach ($this->fileObjects as $fileObject) {
            array_push($paths, $fileObject['path']);
        }
        Storage::delete($paths);
    }
}
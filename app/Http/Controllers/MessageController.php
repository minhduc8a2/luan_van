<?php

namespace App\Http\Controllers;

use App\Models\Channel;
use App\Models\Message;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Tiptap\Editor;

class MessageController extends Controller
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
    public function store(Request $request, Workspace $workspace, Channel $channel)
    {
        if ($request->user()->cannot('create', [Message::class, $channel])) return abort(403);
        $content = $request->content;

        if (isset($content)) {
            $editor = new Editor();
            $content = $editor->sanitize($content);
            $JSONContent = $editor->setContent($content)->getJSON();
            Message::create(['content' => $JSONContent, 'channel_id' => $channel->id, 'user_id' => $request->user()->id]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Message $message)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Message $message)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Message $message)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Message $message)
    {
        //
    }
}

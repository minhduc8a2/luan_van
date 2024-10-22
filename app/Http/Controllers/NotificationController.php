<?php

namespace App\Http\Controllers;

use App\Helpers\Helper;
use App\Models\User;
use App\Models\Workspace;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
   public function markRead(Request $request, Workspace $workspace)
   {
      try {
         //code...
         $request->user()->unreadNotifications->markAsRead();
         return Helper::createSuccessResponse();
      } catch (\Throwable $th) {
         //throw $th;
         Helper::createErrorResponse();
      }
   }

   public function markView(Request $request, Workspace $workspace, string $notification)
   {
      try {
         DB::beginTransaction();
         $notification = $request->user()->notifications()->find($notification);
         $notification->view_at = Carbon::now();
         $notification->read_at = $notification->read_at ?? Carbon::now();
         $notification->save();
         DB::commit();
         return Helper::createSuccessResponse();
      } catch (\Throwable $th) {
         DB::rollBack();
         Helper::createErrorResponse();
      }
   }

   public function get(Request $request, Workspace $workspace)
   {
      return $request->user()->notifications()->whereJsonContains('data->workspace->id', $workspace->id)->simplePaginate(8);
   }
}

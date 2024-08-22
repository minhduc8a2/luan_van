<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class ProviderController extends Controller
{
    public function redirect(string $provider)
    {
        return Socialite::driver($provider)->redirect();
    }

    public function callback(string $provider)
    {
        try {
            $providerUser = Socialite::driver($provider)->user();
            $user = User::where('email', $providerUser->email)->first();

            if ($user) {

                $user->social_provider_id = $providerUser->id;
                $user->social_provider = $provider;
                $user->name = $providerUser->name;
                $user->social_provider_token = $providerUser->token;
                $user->social_provider_refresh_token = $providerUser->refresh_token;
                $user->avatar_url = $providerUser->avatar;
                $user->save();
            } else {
                $user = User::create([
                    'social_provider_id' => $providerUser->id,
                    'social_provider' => $provider,
                    'name' => $providerUser->name,
                    'email' => $providerUser->email,
                    'avatar_url' => $providerUser->avatar,
                    'social_provider_token' => $providerUser->token,
                    'social_provider_refresh_token' => $providerUser->refreshToken,
                ]);
            }

            Auth::login($user);

            return redirect('/dashboard');
        } catch (\Throwable $th) {
            dd($th);
            return redirect('/login')->withErrors(['fail' => "Failed to login with {$provider}"]);
        }


        // $user->token
    }
}

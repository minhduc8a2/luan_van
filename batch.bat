@echo off
cd /d %~dp0
echo Current Directory: %cd%
start "Laravel Server" cmd /c php artisan serve
start "Reverb Service" cmd /c php artisan reverb:start --debug
start "Queue Worker" cmd /c php artisan queue:work
start "NPM Dev" cmd /c npm run dev

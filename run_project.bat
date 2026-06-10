@echo off
setlocal enabledelayedexpansion

cd /d e:\ExpenseTracker

echo Installing pnpm globally...
call npm install -g pnpm

echo.
echo Installing dependencies...
call pnpm install --prefer-offline

echo.
echo Starting frontend development server...
cd src\frontend
call pnpm dev

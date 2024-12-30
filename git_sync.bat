@echo off


echo Pulling latest changes from %BRANCH% branch...
git pull origin main

echo Adding changes to staging...
git add .

git commit -m "committed by git_sync.bat"

echo Pushing changes to main branch...
git push origin main

echo Git sync complete!
pause

@echo off


git pull origin main

git add .

git commit -m "committed by git_sync.bat"

git push origin main

echo Git sync complete!
pause

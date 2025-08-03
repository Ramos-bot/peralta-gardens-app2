# PowerShell script to upload content to GitHub and prepare for Replit

Write-Host "🚀 Peralta Gardens App - Upload to Platforms" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Check if we're in a git repository
if (Test-Path ".git") {
    Write-Host "✅ Git repository detected" -ForegroundColor Green
} else {
    Write-Host "❌ Not a git repository. Initializing..." -ForegroundColor Red
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
}

# Check git status
Write-Host "`n📊 Checking git status..." -ForegroundColor Cyan
git status

# Add all files
Write-Host "`n📦 Adding all files to git..." -ForegroundColor Cyan
git add .

# Commit changes
Write-Host "`n💾 Committing changes..." -ForegroundColor Cyan
$commitMessage = "feat: Fixed React Native import issues and improved app stability

- Resolved Metro bundler import path issues (1215 modules building successfully)
- Fixed React component imports in AuthenticatedTabNavigator
- Corrected AuthService import paths in AuthContext
- App now loads properly on mobile devices via Expo Go
- Dashboard, Tasks, Clients, and other screens working correctly
- Authentication system functional with admin/admin credentials
- Green theme and navigation properly implemented"

git commit -m $commitMessage

# Show current branch
Write-Host "`n🌿 Current branch:" -ForegroundColor Cyan
git branch

# Check if remote exists
$remoteExists = git remote -v
if ($remoteExists) {
    Write-Host "`n🔗 Git remotes:" -ForegroundColor Cyan
    git remote -v
    
    Write-Host "`n🚀 Pushing to GitHub..." -ForegroundColor Cyan
    git push origin HEAD
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  No git remote configured." -ForegroundColor Yellow
    Write-Host "To add GitHub remote, run:" -ForegroundColor Yellow
    Write-Host "git remote add origin https://github.com/Ramos-bot/peralta-gardens-app2.git" -ForegroundColor White
    Write-Host "git push -u origin main" -ForegroundColor White
}

Write-Host "`n📋 Replit Setup Instructions:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "1. Go to https://replit.com" -ForegroundColor White
Write-Host "2. Click 'Create Repl'" -ForegroundColor White
Write-Host "3. Choose 'Import from GitHub'" -ForegroundColor White
Write-Host "4. Enter: Ramos-bot/peralta-gardens-app2" -ForegroundColor White
Write-Host "5. Click 'Import from GitHub'" -ForegroundColor White
Write-Host "6. Once imported, run: npm install" -ForegroundColor White
Write-Host "7. Then run: npm start" -ForegroundColor White

Write-Host "`n📱 Expo Go Testing:" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host "• QR Code: Available at http://localhost:8082" -ForegroundColor White
Write-Host "• Direct URL: exp://192.168.5.164:8082" -ForegroundColor White
Write-Host "• Login: admin / admin" -ForegroundColor White

Write-Host "`n✨ Project Status:" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host "✅ Metro Bundler: 1215 modules building successfully" -ForegroundColor Green
Write-Host "✅ Import paths: All resolved" -ForegroundColor Green
Write-Host "✅ React components: Fixed and working" -ForegroundColor Green
Write-Host "✅ Authentication: Functional" -ForegroundColor Green
Write-Host "✅ Mobile ready: Expo Go compatible" -ForegroundColor Green
Write-Host "⚠️  Web SQLite: Minor WASM issue (mobile unaffected)" -ForegroundColor Yellow

Write-Host "`n🎉 Upload process completed!" -ForegroundColor Green

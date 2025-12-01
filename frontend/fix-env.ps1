# PowerShell script to fix .env file
# Run this in PowerShell: .\fix-env.ps1

$envFile = ".env"
$envPath = Join-Path $PSScriptRoot $envFile

Write-Host "Checking .env file..." -ForegroundColor Yellow

if (Test-Path $envPath) {
    Write-Host "✓ .env file exists" -ForegroundColor Green
    
    # Read current content
    $content = Get-Content $envPath -Raw
    
    Write-Host "`nCurrent content:" -ForegroundColor Cyan
    Write-Host $content
    
    # Check if REACT_APP_ADMIN_PASSWORD exists
    if ($content -match "REACT_APP_ADMIN_PASSWORD") {
        Write-Host "`n✓ REACT_APP_ADMIN_PASSWORD found" -ForegroundColor Green
        
        # Check if it has a value
        if ($content -match "REACT_APP_ADMIN_PASSWORD\s*=\s*[^\s]") {
            Write-Host "✓ Password is set" -ForegroundColor Green
        } else {
            Write-Host "⚠ Password is empty or has spaces" -ForegroundColor Yellow
            Write-Host "Fixing..." -ForegroundColor Yellow
            
            # Fix the line
            $content = $content -replace "REACT_APP_ADMIN_PASSWORD\s*=.*", "REACT_APP_ADMIN_PASSWORD=SoomB44t33Dee@"
            $content | Set-Content $envPath -NoNewline
            Write-Host "✓ Fixed!" -ForegroundColor Green
        }
    } else {
        Write-Host "`n⚠ REACT_APP_ADMIN_PASSWORD not found" -ForegroundColor Yellow
        Write-Host "Adding it..." -ForegroundColor Yellow
        
        # Add the line
        Add-Content $envPath "`nREACT_APP_ADMIN_PASSWORD=SoomB44t33Dee@"
        Write-Host "✓ Added!" -ForegroundColor Green
    }
} else {
    Write-Host "✗ .env file not found" -ForegroundColor Red
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    
    @"
# Admin Dashboard Password
REACT_APP_ADMIN_PASSWORD=SoomB44t33Dee@

# Admin API Key for Promo Code Management
REACT_APP_ADMIN_API_KEY=

# Backend URL
REACT_APP_BACKEND_URL=https://clickalinks-backend-2.onrender.com

# Stripe Publishable Key
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_51SQ6vQR4gvxMxMMr1oW70IdZypVW4M6cI1m3kAvY36bCyWUsi2sdiZkYPu9JtoOrLcITLZCSXWOVQzdEPPuggL4A00oKIe2Wzj
"@ | Out-File -FilePath $envPath -Encoding utf8
    
    Write-Host "✓ Created!" -ForegroundColor Green
}

Write-Host "`n✅ Done! Now restart your dev server (Ctrl+C then npm start)" -ForegroundColor Green


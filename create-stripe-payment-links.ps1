$ErrorActionPreference = "Stop"

function Require-Env($name) {
  $value = [Environment]::GetEnvironmentVariable($name)
  if ([string]::IsNullOrWhiteSpace($value)) {
    throw "Missing required environment variable: $name"
  }
  return $value
}

function New-StripePaymentLink {
  param(
    [Parameter(Mandatory = $true)][string]$SecretKey,
    [Parameter(Mandatory = $true)][string]$PriceId,
    [Parameter(Mandatory = $true)][string]$RedirectUrl
  )

  $headers = @{
    Authorization = "Bearer $SecretKey"
  }

  $body = @{
    "line_items[0][price]" = $PriceId
    "line_items[0][quantity]" = "1"
    "allow_promotion_codes" = "true"
    "after_completion[type]" = "redirect"
    "after_completion[redirect][url]" = $RedirectUrl
  }

  return Invoke-RestMethod `
    -Method Post `
    -Uri "https://api.stripe.com/v1/payment_links" `
    -Headers $headers `
    -Body $body `
    -ContentType "application/x-www-form-urlencoded"
}

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$scriptJsPath = Join-Path $repoRoot "script.js"
$indexPath = Join-Path $repoRoot "index.html"

$stripeSecretKey = Require-Env "STRIPE_SECRET_KEY"
$siteBaseUrl = Require-Env "SITE_BASE_URL"

$normalizedBaseUrl = $siteBaseUrl.TrimEnd("/")

$offers = @{
  frontEnd = @{
    PriceId = "price_1TJAhqB4uyQdSSUIAxeJUUo9"
    RedirectUrl = "$normalizedBaseUrl/oto1.html"
  }
  oto1 = @{
    PriceId = "price_1TJAhrB4uyQdSSUIepgiPB2h"
    RedirectUrl = "$normalizedBaseUrl/thank-you.html"
  }
  downsell = @{
    PriceId = "price_1TJAhuB4uyQdSSUIBOKFeVHp"
    RedirectUrl = "$normalizedBaseUrl/thank-you.html"
  }
  oto2 = @{
    PriceId = "price_1TJAhtB4uyQdSSUI3QFyPhQ9"
    RedirectUrl = "$normalizedBaseUrl/thank-you.html"
  }
}

$newLinks = @{}

foreach ($offerName in $offers.Keys) {
  $offer = $offers[$offerName]
  Write-Host "Creating payment link for $offerName ..."
  $response = New-StripePaymentLink `
    -SecretKey $stripeSecretKey `
    -PriceId $offer.PriceId `
    -RedirectUrl $offer.RedirectUrl

  $newLinks[$offerName] = $response.url
  Write-Host "  -> $($response.url)"
}

$scriptJs = Get-Content -Raw $scriptJsPath
$scriptJs = [regex]::Replace($scriptJs, 'frontEnd:\s*"[^"]*"', ('frontEnd: "{0}"' -f $newLinks.frontEnd))
$scriptJs = [regex]::Replace($scriptJs, 'oto1:\s*"[^"]*"', ('oto1: "{0}"' -f $newLinks.oto1))
$scriptJs = [regex]::Replace($scriptJs, 'downsell:\s*"[^"]*"', ('downsell: "{0}"' -f $newLinks.downsell))
$scriptJs = [regex]::Replace($scriptJs, 'oto2:\s*"[^"]*"', ('oto2: "{0}"' -f $newLinks.oto2))
Set-Content -Path $scriptJsPath -Value $scriptJs

$indexHtml = Get-Content -Raw $indexPath
$indexHtml = [regex]::Replace(
  $indexHtml,
  'href="https://buy\.stripe\.com/[^"]*">Get The System<',
  ('href="{0}">Get The System<' -f $newLinks.frontEnd)
)
$indexHtml = [regex]::Replace(
  $indexHtml,
  'href="https://buy\.stripe\.com/[^"]*">Get The System For \$27<',
  ('href="{0}">Get The System For $27<' -f $newLinks.frontEnd)
)
$indexHtml = [regex]::Replace(
  $indexHtml,
  'href="https://buy\.stripe\.com/[^"]*">Continue To Secure Checkout<',
  ('href="{0}">Continue To Secure Checkout<' -f $newLinks.frontEnd)
)
Set-Content -Path $indexPath -Value $indexHtml

Write-Host ""
Write-Host "Done. New links:"
Write-Host "frontEnd : $($newLinks.frontEnd)"
Write-Host "oto1     : $($newLinks.oto1)"
Write-Host "downsell : $($newLinks.downsell)"
Write-Host "oto2     : $($newLinks.oto2)"
Write-Host ""
Write-Host "Updated:"
Write-Host " - $scriptJsPath"
Write-Host " - $indexPath"

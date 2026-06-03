# Renders store-assets/html/*.html to compliant 1280x800, 24-bit PNGs (no alpha).
# Requires headless Edge or Chrome (Chromium). No npm installs.
#   1) node store-assets/gen-screenshots.mjs   (writes the HTML)
#   2) ./store-assets/render.ps1               (this script)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

# Locate a Chromium browser.
$candidates = @(
  "C:\Program Files\Google\Chrome\Application\chrome.exe",
  "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
)
$browser = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $browser) { throw "No Chrome/Edge found. Edit `$candidates in render.ps1." }

$base  = Join-Path $PSScriptRoot ""
$html  = Join-Path $base "html"
$raw   = Join-Path $base "raw"
$final = Join-Path $base "screenshots"
New-Item -ItemType Directory -Force $raw, $final | Out-Null

$i = 0
Get-ChildItem $html -Filter *.html | Sort-Object Name | ForEach-Object {
  $i++
  $rawPng = Join-Path $raw ($_.BaseName + ".png")
  $url = "file:///" + ($_.FullName -replace '\\', '/')
  $tmp = Join-Path $env:TEMP ("dsf_shot_$i")
  $a = @(
    "--headless=new", "--disable-gpu", "--hide-scrollbars",
    "--force-device-scale-factor=1", "--window-size=1280,800",
    "--no-first-run", "--no-default-browser-check",
    "--user-data-dir=$tmp", "--virtual-time-budget=3000",
    "--screenshot=$rawPng", $url
  )
  Start-Process -FilePath $browser -ArgumentList $a -Wait -NoNewWindow | Out-Null

  # Flatten onto white, force 24bpp RGB (drops the alpha channel), exact size.
  $src = [System.Drawing.Image]::FromFile($rawPng)
  $bmp = New-Object System.Drawing.Bitmap 1280, 800, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::White)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($src, 0, 0, 1280, 800)
  $dst = Join-Path $final $_.Name
  $bmp.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose(); $src.Dispose()
  Write-Host ("OK  {0}  (1280x800, 24-bit, no alpha)" -f $_.Name)
}
Write-Host "`nDone. Upload the PNGs in: $final"

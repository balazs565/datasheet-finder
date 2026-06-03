# Renders store-assets/html/marquee.html to a compliant 1400x560, 24-bit PNG
# (no alpha) — the Chrome Web Store "marquee promo tile".
#   1) node store-assets/gen-marquee.mjs   (writes the HTML)
#   2) ./store-assets/render-marquee.ps1   (this script)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$candidates = @(
  "C:\Program Files\Google\Chrome\Application\chrome.exe",
  "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
)
$browser = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $browser) { throw "No Chrome/Edge found. Edit `$candidates in render-marquee.ps1." }

$base   = $PSScriptRoot
$htmlIn = Join-Path $base "html\marquee.html"
$raw    = Join-Path $base "raw"
$out    = Join-Path $base "marquee"
New-Item -ItemType Directory -Force $raw, $out | Out-Null

$rawPng = Join-Path $raw "marquee.png"
$url = "file:///" + ($htmlIn -replace '\\', '/')
$tmp = Join-Path $env:TEMP "dsf_marquee"
$a = @(
  "--headless=new", "--disable-gpu", "--hide-scrollbars",
  "--force-device-scale-factor=1", "--window-size=1400,560",
  "--no-first-run", "--no-default-browser-check",
  "--user-data-dir=$tmp", "--virtual-time-budget=3000",
  "--screenshot=$rawPng", $url
)
Start-Process -FilePath $browser -ArgumentList $a -Wait -NoNewWindow | Out-Null

# Flatten onto white, force 24bpp RGB (no alpha), exact 1400x560.
$src = [System.Drawing.Image]::FromFile($rawPng)
$bmp = New-Object System.Drawing.Bitmap 1400, 560, ([System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::White)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($src, 0, 0, 1400, 560)
$dst = Join-Path $out "marquee.png"
$bmp.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose(); $src.Dispose()
Write-Host "OK  marquee.png  (1400x560, 24-bit, no alpha)  ->  $dst"

param(
  [string]$ResultPath = $(if ($env:AUTH_COOKIES_RESULT) { $env:AUTH_COOKIES_RESULT } else { "result.txt" }),
  [string]$OutputPath = $(if ($env:AUTH_COOKIES_OUTPUT) { $env:AUTH_COOKIES_OUTPUT } else { "auth-cookies.local.json" })
)

$ErrorActionPreference = "Stop"

$StartMarker = "AUTH_COOKIES_JSON_START"
$EndMarker = "AUTH_COOKIES_JSON_END"

try {
  $ResolvedResultPath = (Resolve-Path -LiteralPath $ResultPath).Path
} catch {
  Write-Error "Could not read $ResultPath."
  exit 1
}

$ResultText = Get-Content -LiteralPath $ResolvedResultPath -Raw
$NormalizedLines = foreach ($Line in ($ResultText -split "`n")) {
  $MessageMatch = [regex]::Match($Line, '\bmsg=(?:"((?:\\"|[^"])*)"|([^ ]+))')

  if (-not $MessageMatch.Success) {
    $Line
    continue
  }

  $Message = if ($MessageMatch.Groups[1].Success) {
    $MessageMatch.Groups[1].Value
  } else {
    $MessageMatch.Groups[2].Value
  }

  $Message -replace '\\"', '"'
}

$NormalizedResultText = $NormalizedLines -join "`n"
$StartIndex = $NormalizedResultText.IndexOf($StartMarker)
$EndIndex = $NormalizedResultText.IndexOf($EndMarker)

if ($StartIndex -lt 0 -or $EndIndex -lt 0 -or $EndIndex -le $StartIndex) {
  Write-Error "Could not find $StartMarker/$EndMarker in $ResolvedResultPath."
  exit 1
}

$JsonStart = $StartIndex + $StartMarker.Length
$JsonText = $NormalizedResultText.Substring($JsonStart, $EndIndex - $JsonStart).Trim()

if (-not $JsonText.StartsWith("[")) {
  Write-Error "Failed to extract auth cookies: captured JSON is not an array."
  exit 1
}

try {
  $ParsedCookies = $JsonText | ConvertFrom-Json
  $CookieCount = @($ParsedCookies).Count
  $OutputDirectory = Split-Path -Parent $OutputPath

  if ($OutputDirectory) {
    New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
  }

  $Utf8NoBom = New-Object System.Text.UTF8Encoding -ArgumentList $false
  [System.IO.File]::WriteAllText($OutputPath, "$JsonText`n", $Utf8NoBom)
  Write-Output "Saved $CookieCount cookies to $OutputPath"
} catch {
  Write-Error "Failed to extract auth cookies: $($_.Exception.Message)"
  exit 1
}

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$port = 8031

$types = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'text/javascript; charset=utf-8'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.png'  = 'image/png'
  '.svg'  = 'image/svg+xml'
  '.ico'  = 'image/x-icon'
}

$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $port)
$listener.Start()
Start-Sleep -Milliseconds 500
Start-Process ("http://127.0.0.1:{0}/" -f $port)

function Send-Bytes($stream, [int]$code, [string]$status, [string]$ctype, [byte[]]$bytes, [bool]$isHead) {
  $head = "HTTP/1.1 $code $status`r`nContent-Type: $ctype`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`nCache-Control: no-cache`r`n`r`n"
  $hb = [System.Text.Encoding]::ASCII.GetBytes($head)
  $stream.Write($hb, 0, $hb.Length)
  if (-not $isHead) { $stream.Write($bytes, 0, $bytes.Length) }
}

while ($true) {
  $client = $null
  $stream = $null
  try { $client = $listener.AcceptTcpClient() } catch { break }
  try {
    $stream = $client.GetStream()
    $stream.ReadTimeout = 3000
    $stream.WriteTimeout = 15000
    try {
      $reader = New-Object System.IO.StreamReader($stream)
      $requestLine = $reader.ReadLine()
      if ($requestLine) {
        $parts = $requestLine -split ' '
        if ($parts.Count -ge 2) {
          $isHead = ($parts[0].ToUpperInvariant() -eq 'HEAD')
          $path = ([string]$parts[1]) -split '\?' | Select-Object -First 1
          try { $path = [Uri]::UnescapeDataString($path) } catch { }
          if ($path -eq '/') { $path = '/index.html' }
          $file = Join-Path $root ($path -replace '/', '\')
          $served = $false
          try {
            $full = [System.IO.Path]::GetFullPath($file)
            if ($full.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $full -PathType Leaf)) {
              $ext = [System.IO.Path]::GetExtension($full).ToLowerInvariant()
              if ($types.ContainsKey($ext)) { $ctype = $types[$ext] } else { $ctype = 'application/octet-stream' }
              Send-Bytes $stream 200 'OK' $ctype ([System.IO.File]::ReadAllBytes($full)) $isHead
              $served = $true
            }
          } catch { $served = $false }
          if (-not $served) {
            Send-Bytes $stream 404 'Not Found' 'text/plain' ([System.Text.Encoding]::ASCII.GetBytes('404')) $isHead
          }
        }
      }
    } catch { }
    try { if ($stream) { $stream.Close() } } catch { }
  } catch { }
  try { if ($client) { $client.Close() } } catch { }
}

# ============================================================
# Swagger Endpoint Tester
# ============================================================

$swaggerUrl       = "https://05-api.imfint.local/TimWebApiClaim_v2/swagger/v1/swagger.json"
$swaggerLocalPath = ""   # e.g. "D:\SQL\SQL\swagger.json" - if set, uses local file instead of URL
$baseUrl          = "https://05-api.imfint.local/TimWebApiClaim_v2"
$outputCsv        = "D:\SQL\SQL\swagger-test-results.csv"

# --- Which methods to test ---
$methodsToTest = @("get", "post")   # possible: "get", "post", "put", "patch", "delete"

# --- Limit returned data ---
# $true  = appends ?$top=1 to GET requests (fast, small payload, only checks if endpoint responds)
# $false = sends requests without changes (real data, may be slow)
$limitResults = $true
$limitTop     = 1   # how many records to fetch when $limitResults = $true

# --- Example values for URL path parameters ---
# If URL contains {claimId}, it will be replaced with the value below
$paramValues = @{
    "key"                        = "15"
    "claimId"                    = "15"
    "id"                         = "15"
    "fromDate"                   = "2024-01-01"
    "toDate"                     = "2025-12-31"
    "businessAccountPartyNo"     = "15438"
    "mainBusinessAccountPartyNo" = "15438"
    "businessAccountNo"          = "15438"
    "baNo"                       = "15438"
    "requestDate"                = "2024-01-01"
    "isResolved"                 = "false"
    "settlementId"               = "173793"
    "includedTypes"              = "1"      # <-- provide real type value if known
    "excludedTypes"              = ""       # <-- provide real type value if known
}
# Default value for unknown parameters
$defaultParamValue = "1"

# --- Authorization ---
$bearerToken = "ADE9608015449D842EB92DC8AC99E51AAF37CAF68A0E69CFD2A5E3E233094A56-1"
# $credential = Get-Credential  # uncomment for Windows Auth

$headers = @{}
if ($bearerToken -ne "") {
    $headers["Authorization"] = "Bearer $bearerToken"
}

# --- Skip certificate errors (self-signed) ---
add-type @"
    using System.Net;
    using System.Security.Cryptography.X509Certificates;
    public class TrustAllCertsPolicy : ICertificatePolicy {
        public bool CheckValidationResult(
            ServicePoint srvPoint, X509Certificate certificate,
            WebRequest request, int certificateProblem) { return true; }
    }
"@
[System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertsPolicy
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

# --- Load swagger.json ---
if ($swaggerLocalPath -ne "" -and (Test-Path $swaggerLocalPath)) {
    Write-Host "Loading swagger.json from file: $swaggerLocalPath" -ForegroundColor Cyan
    try {
        $swaggerJson = Get-Content $swaggerLocalPath -Raw | ConvertFrom-Json
        Write-Host "Swagger loaded. Number of endpoints: $(($swaggerJson.paths.PSObject.Properties | Measure-Object).Count)" -ForegroundColor Green
    } catch {
        Write-Host "Cannot load swagger.json file: $_" -ForegroundColor Red
        exit
    }
} else {
    Write-Host "Fetching swagger.json from URL: $swaggerUrl" -ForegroundColor Cyan
    try {
        $swaggerJson = Invoke-RestMethod -Uri $swaggerUrl -Headers $headers
        Write-Host "Swagger fetched. Number of endpoints: $(($swaggerJson.paths.PSObject.Properties | Measure-Object).Count)" -ForegroundColor Green
    } catch {
        Write-Host "Cannot fetch swagger.json: $_" -ForegroundColor Red
        exit
    }
}

# --- Test endpoints ---
$results = @()
$total   = 0
$ok      = 0
$errors  = 0

foreach ($path in $swaggerJson.paths.PSObject.Properties) {
    $url = "$baseUrl$($path.Name)"

    foreach ($method in $path.Value.PSObject.Properties.Name) {
        if ($method -notin $methodsToTest) { continue }

        # Replace path parameters with example values
        $resolvedUrl = $url
        $isParametrized = $false
        if ($url -match "\{[^}]+\}") {
            $isParametrized = $true
            $resolvedUrl = $url
            foreach ($param in $paramValues.Keys) {
                $resolvedUrl = $resolvedUrl -replace "\{$param\}", $paramValues[$param]
            }
            # Replace remaining unknown parameters with default value
            $resolvedUrl = $resolvedUrl -replace "\{[^}]+\}", $defaultParamValue
        }

        $total++
        $status = $null
        $result = $null
        $label  = if ($isParametrized) { "PARAM" } else { "     " }

        $requestHeaders = $headers.Clone()
        if ($method -eq "post") {
            $requestHeaders["Content-Type"] = "application/json"
        }

        # Append $top=1 to GET if limit is enabled (only for non-parametrized URLs)
        $finalUrl = $resolvedUrl
        if ($limitResults -and $method -eq "get" -and -not $isParametrized) {
            $separator = if ($resolvedUrl -match "\?") { "&" } else { "?" }
            $finalUrl = "$resolvedUrl$($separator)`$top=$limitTop"
        }

        try {
            $response = Invoke-WebRequest -Uri $finalUrl -Method $method -Headers $requestHeaders `
                        -UseBasicParsing -ErrorAction Stop
            $status = $response.StatusCode
            $result = "OK"
            $ok++
            Write-Host "OK    $label $($method.ToUpper()) $finalUrl -> $status" -ForegroundColor Green
        } catch {
            $status = $_.Exception.Response.StatusCode.value__
            $result = "ERROR: $($_.Exception.Message.Split([Environment]::NewLine)[0])"
            $errors++
            Write-Host "ERROR $label $($method.ToUpper()) $finalUrl -> $status" -ForegroundColor Red
        }

        $results += [PSCustomObject]@{
            Method       = $method.ToUpper()
            Url          = $finalUrl
            OriginalUrl  = $url
            Parametrized = $isParametrized
            Status       = $status
            Result       = $result
        }
    }
}

# --- Podsumowanie ---
$allMethods = @{}
foreach ($path in $swaggerJson.paths.PSObject.Properties) {
    foreach ($method in $path.Value.PSObject.Properties.Name) {
        if (-not $allMethods[$method]) { $allMethods[$method] = 0 }
        $allMethods[$method]++
    }
}
$totalEndpoints = ($swaggerJson.paths.PSObject.Properties | ForEach-Object { $_.Value.PSObject.Properties.Name } | Measure-Object).Count

Write-Host "`nSUMMARY:" -ForegroundColor Cyan
Write-Host "   Paths in swagger    : $(($swaggerJson.paths.PSObject.Properties | Measure-Object).Count)"
Write-Host "   Total methods       : $totalEndpoints"
foreach ($m in ($allMethods.Keys | Sort-Object)) {
    $tested = if ($m -in $methodsToTest) { " (tested)" } else { " (skipped)" }
    Write-Host "      $($m.ToUpper()): $($allMethods[$m])$tested"
}
Write-Host "   Total tests run     : $total"
Write-Host "   OK                  : $ok"   -ForegroundColor Green
Write-Host "   Errors              : $errors" -ForegroundColor Red

# --- Export to CSV ---
$results | Export-Csv -Path $outputCsv -NoTypeInformation -Encoding UTF8
Write-Host "`nResults saved to: $outputCsv" -ForegroundColor Cyan

# --- Show errors in console ---
if ($errors -gt 0) {
    # Categorize errors automatically
    $critical   = $results | Where-Object { $_.Status -eq 500 }
    $deprecated = $results | Where-Object { $_.Status -eq 410 }
    $needsRealId= $results | Where-Object { $_.Status -eq 404 -and $_.Parametrized -eq $true }
    $needsParams= $results | Where-Object { $_.Status -eq 400 }
    $getFile    = $results | Where-Object { $_.Status -eq 404 -and $_.Parametrized -eq $false -and $_.Url -match "GetFile|GetImplementedActions" }
    $other404   = $results | Where-Object { $_.Status -eq 404 -and $_.Parametrized -eq $false -and $_.Url -notmatch "GetFile|GetImplementedActions" }
    $forbidden  = $results | Where-Object { $_.Status -eq 403 }

    if ($critical.Count -gt 0) {
        Write-Host "`n[500 - SERVER ERROR] Real bugs - require investigation:" -ForegroundColor Red
        $critical | ForEach-Object { Write-Host "   $($_.Method) $($_.Url)" -ForegroundColor Red }
    }

    if ($deprecated.Count -gt 0) {
        Write-Host "`n[410 - GONE] Deprecated endpoints - should be removed from swagger:" -ForegroundColor DarkYellow
        $deprecated | Select-Object -Unique Url | ForEach-Object { Write-Host "   GET $($_.Url)" -ForegroundColor DarkYellow }
    }

    if ($forbidden.Count -gt 0) {
        Write-Host "`n[403 - FORBIDDEN] No permissions for current token:" -ForegroundColor Yellow
        $forbidden | ForEach-Object { Write-Host "   $($_.Method) $($_.Url)" -ForegroundColor Yellow }
    }

    if ($needsRealId.Count -gt 0) {
        Write-Host "`n[404 - PARAM] Record not found - ID=1 does not exist, provide real IDs in `$paramValues:" -ForegroundColor DarkCyan
        $needsRealId | Select-Object -Unique Url | ForEach-Object { Write-Host "   GET $($_.Url)" -ForegroundColor DarkCyan }
    }

    if ($needsParams.Count -gt 0) {
        Write-Host "`n[400 - BAD REQUEST] Export endpoints - require mandatory query parameters, cannot test without them:" -ForegroundColor DarkGray
        $needsParams | ForEach-Object { Write-Host "   $($_.Method) $($_.Url)" -ForegroundColor DarkGray }
    }

    if ($getFile.Count -gt 0) {
        Write-Host "`n[404 - NOT FOUND] Endpoints requiring specific query params (GetFile etc.):" -ForegroundColor DarkGray
        $getFile | ForEach-Object { Write-Host "   $($_.Method) $($_.Url)" -ForegroundColor DarkGray }
    }

    if ($other404.Count -gt 0) {
        Write-Host "`n[404 - OTHER] Potentially removed or misconfigured endpoints:" -ForegroundColor Magenta
        $other404 | ForEach-Object { Write-Host "   $($_.Method) $($_.Url)" -ForegroundColor Magenta }
    }

    Write-Host "`n--- ERROR CATEGORY SUMMARY ---" -ForegroundColor Cyan
    Write-Host "   500 Server Error     : $($critical.Count)   <-- INVESTIGATE THESE" -ForegroundColor Red
    Write-Host "   410 Deprecated       : $(($deprecated | Select-Object -Unique Url).Count)"
    Write-Host "   403 Forbidden        : $($forbidden.Count)"
    Write-Host "   404 Needs real ID    : $(($needsRealId | Select-Object -Unique Url).Count)   <-- provide real IDs in `$paramValues"
    Write-Host "   400 Export (no params): $($needsParams.Count)   <-- expected, needs mandatory params"
    Write-Host "   404 GetFile/other    : $($getFile.Count + $other404.Count)"
}

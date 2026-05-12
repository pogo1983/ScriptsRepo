# ============================================================
#  [SKRYPT 1/2]  Generate-TA-Report.ps1
# ============================================================
#  CEL: Bootstrap - tworzy TA_Inventory.xlsx od zera.
#       Uruchamiaj tylko gdy chcesz odbudowac cala baze
#       (np. po zmianach w $mapping / $extraTCs).
#
#  CO ROBI:
#    - Czyta TestAutomation_tests_list.xlsx (81 TC ze zrodla)
#    - Skanuje repo w poszukiwaniu .feature files
#    - Laczy dane wg $mapping + $extraTCs (1 feature = 1 TC)
#    - Jezeli TC ma feature -> status = DONE (automatycznie)
#    - Zapisuje TA_Inventory.xlsx (nadpisuje poprzedni)
#
#  KIEDY UZYWAC:
#    1. Pierwsze uruchomienie na nowym srodowisku
#    2. Po dodaniu/zmianie wpisow w $mapping lub $extraTCs
#    3. Po zmianach struktury kolumn / ref sheetow
#
#  UWAGA: Nadpisuje TA_Inventory.xlsx bezpowrotnie!
#         Recznie zmienione statusy/osoby zostana UTRACONE.
#         Do codziennego update uzywaj Skryptu 2.
#
#  Uzycie:
#    & .\Generate-TA-Report.ps1             # generuj pelny raport
#    & .\Generate-TA-Report.ps1 -DiffOnly   # pokaz niezamapowane feature files
# ============================================================
param([switch]$DiffOnly)

$RepoRoot     = "d:\git\TimTestAutomation\AutomationTests"
$OutputXlsx   = "d:\SQL\SQL\TA_LIST_Sanity_Smoke\TA_Inventory.xlsx"
$ExcelFile    = "d:\SQL\SQL\TA_LIST_Sanity_Smoke\TestAutomation_tests_list.xlsx"

# ============================================================
# 1. Czytaj Excel (arkusz TA_List)
# ============================================================
Write-Host "Czytam Excel..." -ForegroundColor Cyan
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$wb = $excel.Workbooks.Open($ExcelFile)
$sheet = $wb.Sheets.Item("TA_List")
$rows  = $sheet.UsedRange.Rows.Count

$tcList = [System.Collections.Generic.List[PSCustomObject]]::new()
for ($r = 2; $r -le $rows; $r++) {
    $id       = $sheet.Cells.Item($r, 1).Value2
    $name     = $sheet.Cells.Item($r, 2).Value2
    $domain   = $sheet.Cells.Item($r, 3).Value2
    $person   = $sheet.Cells.Item($r, 4).Value2
    $status   = $sheet.Cells.Item($r, 5).Value2
    $prio     = $sheet.Cells.Item($r, 6).Value2
    $devId    = $sheet.Cells.Item($r, 9).Value2
    $intId    = $sheet.Cells.Item($r, 10).Value2
    $devUrl   = $sheet.Cells.Item($r, 11).Value2
    $intUrl   = $sheet.Cells.Item($r, 12).Value2
    $notes    = $sheet.Cells.Item($r, 13).Value2

    if ($id -and $name) {
        $tcList.Add([PSCustomObject]@{
            TC_ID    = $id
            Name     = $name
            Domain   = $domain
            Person   = $person
            Status   = $status
            Priority = $prio
            DevId    = if ($devId) { [int]$devId } else { $null }
            IntId    = if ($intId) { [int]$intId } else { $null }
            DevUrl   = $devUrl
            IntUrl   = $intUrl
            Notes    = $notes
        })
    }
}
$wb.Close($false)
$excel.Quit()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
Write-Host "  -> Wczytano $($tcList.Count) TC z Excela" -ForegroundColor Green

# ============================================================
# 2. Skanuj wszystkie .feature files w repo
# ============================================================
Write-Host "Skanuję repo..." -ForegroundColor Cyan
$features = Get-ChildItem -Path $RepoRoot -Recurse -Filter "*.feature" `
    | Where-Object { $_.FullName -notmatch "\\Prepare\\" -and $_.FullName -notmatch "\.feature\.cs" }

$featureData = foreach ($f in $features) {
    $content = Get-Content $f.FullName -Raw
    $lines   = Get-Content $f.FullName -TotalCount 25
    $allTags = ($lines | Where-Object { $_ -match "^\s*@" }) -join " "
    $featLine = ($lines | Where-Object { $_ -match "^\s*Feature:" } | Select-Object -First 1) -replace ".*Feature:\s*", ""
    $suite   = if ($allTags -match "@Suite:(\w+)")   { $Matches[1] } else { "" }
    $domain  = if ($allTags -match "@Domain:(\S+)")  { $Matches[1] -replace "@.*", "" } else { "" }
    $actor   = if ($allTags -match "@Actor:(\w+)")   { $Matches[1] } else { "" }
    $ignored = $allTags -match "@Ignore"
    $rel     = $f.FullName -replace [regex]::Escape($RepoRoot + "\"), "" `
                           -replace [regex]::Escape($RepoRoot.ToUpper() + "\"), ""
    [PSCustomObject]@{
        RelPath     = $rel
        FeatureName = $featLine.Trim()
        Domain      = $domain
        Actor       = $actor
        Suite       = $suite
        IsIgnored   = $ignored
        FullPath    = $f.FullName
        FileNameNoExt = $f.BaseName.ToLower()
        AllTags     = $allTags
    }
}
Write-Host "  -> Znaleziono $($featureData.Count) .feature files" -ForegroundColor Green

# ============================================================
# 3a. Mapping: TC ID -> Actor (zgodnie ze struktura repo: Agent/Provider/Patient/Admin/System)
# ============================================================
$actorMapping = @{
    "S01"  = "Provider"   # Stop on Claim in Inzicht
    "S02"  = "Agent"      # Stop on Claim in TIM
    "S03"  = "Agent"      # Full Stop on unpaid Claim in TIM
    "S04"  = "Agent"      # Full Stop on paid Claim in TIM
    "S05"  = "Provider"   # Redelivery on a Claim (Inzicht)
    "S06"  = "Agent"      # Closing stop TIM UI
    "S07"  = "Provider"   # Closing stop Inzicht
    "S08"  = "Agent"      # Resurrect a Claim
    "S09"  = "Agent"      # Send claim to Clearing (IA)
    "S10"  = "Agent"      # Match Payment
    "S11"  = "Agent"      # Automatch Payment
    "S12"  = "Patient"    # Create Payment Agreement (Payment Page)
    "S13"  = "Patient"    # Download PDF (Payment Page)
    "S14"  = "Patient"    # Pay a claim (Payment Page)
    "S15"  = "Agent"      # Unmatch Payment
    "S16"  = "Agent"      # Make a Payback
    "S17"  = "Agent"      # Small open amount tests
    "S18"  = "Agent"      # Create IA 100%
    "S19"  = "Agent"      # Create IA 0%
    "S20"  = "Agent"      # Create IA with IRCR
    "S21"  = "Agent"      # IA IRCR Result print
    "S22"  = "Agent"      # IA IRCR Result Stop
    "S23"  = "Agent"      # IA IRCR Result SSP Action
    "S24"  = "Agent"      # Push through action
    "S25"  = "Agent"      # Add/Change IRCR Code
    "S26"  = "Agent"      # Add Message to BA from TIM
    "S27"  = "Provider"   # Add Message to Agent from Inzicht
    "S28"  = "Agent"      # Settle any settlement
    "S29"  = "Agent"      # Settle any settlement CHA
    "S30"  = "Patient"    # Create Copy of printed document (Payment Page)
    "S31"  = "Agent"      # Create BA and process claimfile (Prepare)
    "S32"  = "Agent"      # Change settle date Ledger View
    "S33"  = "Agent"      # Add Correction to Settlement
    "S34"  = "Agent"      # Login (TIM/Inzicht/IAM - primary Agent)
    "S35"  = "Agent"      # Change Password
    "S36"  = "Agent"      # Create Ticket HelpDesk
    "S37"  = "Agent"      # Resolve Ticket HelpDesk
    "S38"  = "Agent"      # Create Approval
    "S39"  = "Agent"      # Resolve Approval
    "S40"  = "Provider"   # Check Ledger View Inzicht
    "S41"  = "Provider"   # Upload claim file by Inzicht
    "S42"  = "Agent"      # Upload claim file by TIM UI
    "S43"  = "System"     # Upload claim file by Folder/IMD
    "S44"  = "Agent"      # Change Follow UP on interpretation
    "S45"  = "Agent"      # Check UBO feature
    "S46"  = "Agent"      # Complaint
    "S47"  = "Agent"      # Create Address Change
    "S48"  = "Patient"    # CMIB Deal (Payment Page)
    "S49"  = "Agent"      # DPAY Process
    "S50"  = "Agent"      # Create/Resolve Complaint Action
    "SM01" = "Agent"      # Settle Settlement for BA
    "SM02" = "Agent"      # Settle ROBP Settlement
    "SM03" = "Agent"      # Generate PDP XML
    "SM04" = "System"     # Generate CSV XML
    "SM05" = "Patient"    # PA with DD and matching (Payment Page)
    "SM06" = "Patient"    # PA with DD reject matching (Payment Page)
    "SM07" = "System"     # Send Claim to Bailiff full flow (automated)
    "SM08" = "Patient"    # Create BA Invoice DD matching (Payment Page)
    "SM09" = "Agent"      # DPAY WS scenarios
    "SM10" = "Agent"      # Create IA with different IRCR
    "SM11" = "Agent"      # Create Address Change - Change Address
    "SM12" = "Agent"      # Create Address Change - Resume without change
    "SM13" = "Agent"      # Create Address Change - redelivery one claim
    "SM14" = "Agent"      # Create Address Change - redelivery all claims
    "S51"  = "Admin"      # Export KET users IAM
    "S52"  = "Patient"    # Check Bailiff statuses Payment Page
    "S53"  = "Provider"   # Accept First Delivery
    "S54"  = "Provider"   # Reject First Delivery
    "S55"  = "Agent"      # Claim To Do View
    "S56"  = "Provider"   # Check wrong ClaimFile Provider tab
    "S57"  = "Agent"      # Full Stop Claim File TIM
    "S58"  = "Provider"   # Ledger Connector - Enable Ledger
    "S59"  = "Provider"   # Ledger Connector - Set Ledger Accounts
    "S60"  = "Provider"   # Ledger Connector - Authorize Exact
    "S61"  = "Provider"   # Ledger Connector - Authorize Twinfield
    "S62"  = "Provider"   # Ledger Connector - Authorize Problem
    "S63"  = "Provider"   # Ledger Connector - Missing Account
    "S64"  = "Provider"   # Ledger Connector - Incorrect account number
    "S65"  = "Provider"   # Ledger Connector - Send Document
    "S66"  = "Agent"      # DoubleValidation - Approve
    "S67"  = "Agent"      # DoubleValidation - Reject
}

# ============================================================
# 3b. Mapping: TC ID -> znane sciezki feature files
#    (recznie uzupelnione na podstawie analizy repo)
# ============================================================
$mapping = @{
    "S01"  = @("Provider\Claim\Stop\FullStop.feature")

    "S02"  = @()  # Stop on Claim in TIM - Tim\ dir jest pusty, brak feature
    "S03"  = @()  # Full Stop on unpaid Claim in TIM - brak feature
    "S04"  = @()  # Full Stop on paid Claim in TIM - brak feature
    "S05"  = @()  # Redelivery on a Claim - brak feature
    "S06"  = @()  # Closing stop TIM UI - brak feature
    "S07"  = @()  # Closing stop Inzicht - brak feature
    "S08"  = @()  # Resurrect a Claim - brak feature

    "S09"  = @("Agent\Clearing\CreateIA100PercentPromise.feature")

    "S10"  = @("Agent\\ToDo\\Matching\\ManualMatchAndUnmatchPaymentWithClaim.feature")
    "S11"  = @("Agent\ToDo\Matching\AutomatchPaymentWithClaim.feature")
    "S12"  = @("Patient\Claim\PaymentAgreement\CreatePaymentAgreementDD.feature")
    "S13"  = @("Patient\Claim\Download\DownloadPublicInvoiceDocument.feature")
    "S14"  = @("Patient\Claim\Pay\PayForInvoiceUsingIDEAL.feature")
    "S15"  = @("Agent\ToDo\Matching\ManualMatchAndUnmatchPaymentWithClaim.feature")
    "S16"  = @("Agent\\ToDo\\Matching\\PaybackReminder.feature")  # Make a Payback
    "S17"  = @()  # Small open amount tests - brak feature

    "S18"  = @("Agent\Clearing\CreateIA100PercentPromise.feature")
    "S19"  = @("Agent\Clearing\CreateIA0PercentPromise.feature")
    "S20"  = @("Agent\Clearing\CreateIA50PercentPromiseWithIrcrPrinted.feature")
    "S21"  = @("Agent\Clearing\CreateIA50PercentPromiseWithIrcrPrinted.feature")
    "S22"  = @("Agent\Clearing\CreateIA50PercentPromiseWithIrcrRejected.feature")
    "S23"  = @("Agent\Clearing\CreateIA50PercentPromiseWithIrcrSspAction.feature")
    "S24"  = @()  # Push through action - brak feature
    "S25"  = @()  # Add/Change IRCR Code - brak dedykowanego feature (jest w IA flows?)

    "S26"  = @("Agent\Contact\MessageToBaFromTim.feature")
    "S27"  = @("Provider\Contact\MessageToAgentFromInzicht.feature")
    "S28"  = @("Agent\Settlement\SettlementSend.feature")
    "S29"  = @()  # Settle CHA - brak feature
    "S30"  = @("Patient\Claim\CreateCopy\CopyPaperInvoice.feature")
    "S31"  = @()  # Create BA and process - to Prepare testy
    "S32"  = @("Agent\Settlement\SettlementSetToToday.feature")
    "S33"  = @()  # Add Correction to Settlement - brak feature
    "S34"  = @("Agent\Login\LoginToTIM.feature")
    "S35"  = @()  # Change Password - brak feature
    "S36"  = @("Agent\HelpdeskTOFIXPREPAREFOREMPTYENVIRONMENT\CreateTicket.feature")
    "S37"  = @()  # Resolve Ticket - brak dedykowanego (MyTicketsPage?)
    "S38"  = @("Agent\ToDo\Approvals\CreateResolveApproval-trzeba_rozdzielic.feature")
    "S39"  = @("Agent\ToDo\Approvals\CreateResolveApproval-trzeba_rozdzielic.feature")
    "S40"  = @()  # Ledger View Inzicht - brak feature
    "S41"  = @("Provider\ClaimFile\UploadFile\SuccessfulUploadFileFromDeclarationsPage.feature")
    "S42"  = @("Agent\BusinessAccount\ClaimFile\UploadFileFromUI.feature")
    "S43"  = @()  # Upload by Folder/IMD - brak feature
    "S44"  = @()  # Change Follow Up - brak feature
    "S45"  = @("Agent\ClaimFile\UploadFile\ProcessClaimWhenUBOBlocked.feature")
    "S46"  = @("Agent\Claim\Complaint\ResolveComplaint.feature")
    "S47"  = @("Agent\Claim\AddAddressChange\AddAddressChange.feature")
    "S48"  = @("Patient\\Claim\\ExtendDueDate\\PostponeInvoiceDueDateInCMIB.feature")
    "S49"  = @("Agent\ClaimFile\ProcessFile\GDS801v2withDPayWS.feature")
    "S50"  = @()  # Create/Resolve Complaint Action - brak feature

    "SM01" = @("Agent\Settlement\SettlementSend.feature")  # @Suite:Smoke
    "SM02" = @()  # Settle ROBP - brak feature
    "SM03" = @("Agent\Maintenance\PDP\RegeneratePDPFiles.feature")
    "SM04" = @()  # Generate CSV XML - brak feature
    "SM05" = @("Patient\Claim\PaymentAgreement\CreatePaymentAgreementDD.feature")
    "SM06" = @()  # PA DD reject matching - brak feature
    "SM07" = @()  # Bailiff full flow - brak feature
    "SM08" = @()  # BA Invoice DD matching - brak feature
    "SM09" = @()  # DPAY WS - brak feature
    "SM10" = @("Agent\Clearing\CreateIA50PercentPromiseWithIrcrPrinted.feature")
    "SM11" = @("Provider\\Claim\\AddressChange\\ChangeAddressAndStoreDataOnly.feature")
    "SM12" = @()  # Resume Address Change without change - brak feature
    "SM13" = @("Provider\Claim\AddressChange\ChangeAddressAndRedeliverClaimByPost.feature")
    "SM14" = @("Provider\Claim\AddressChange\ChangeAddressAndRedeliverClaimByEmail.feature")

    "S51"  = @()  # Export KET users IAM - brak feature
    "S52"  = @("Patient\Claim\ShowClaim\OpenPaymentPageForInvoiceInBailiff.feature")
    "S53"  = @("Provider\ClaimFile\ProcessFile\MZ301.feature")
    "S54"  = @("Provider\ClaimFile\UploadFile\FailedUploadFileFromDeclarationsPage.feature")
    "S55"  = @()  # Claim To Do View - brak feature
    "S56"  = @("Provider\ClaimFile\UploadFile\FailedUploadFileFromDeclarationsPage.feature")
    "S57"  = @("Agent\BusinessAccount\ClaimFile\StopClaimFile.feature")
    "S58"  = @()  # Ledger Enable - brak feature
    "S59"  = @()  # Ledger Set Accounts - brak feature
    "S60"  = @("Provider\LedgerConnector\ConnectToExactLedgerConnector.feature")
    "S61"  = @()  # Ledger Twinfield - brak feature
    "S62"  = @()  # Ledger Auth Problem - brak feature
    "S63"  = @()  # Ledger Missing Account - brak feature
    "S64"  = @()  # Ledger Incorrect account number - brak feature
    "S65"  = @()  # Ledger Send Document - brak feature
    "S66"  = @("Agent\ToDo\Approvals\StopClaimFileApproval.feature")
    "S67"  = @("Agent\ToDo\Approvals\StopClaimFileApproval.feature")
}

# ============================================================# 3c. Extra TCs - feature files nie w source Excel
#     Dodawane na koncu raportu z kolejnymi TC-NNN numerami
# ============================================================
$extraTCs = [System.Collections.Generic.List[PSCustomObject]]::new()

# --- Auth & User Management (from S34) ---
$extraTCs.Add([PSCustomObject]@{ Actor="Provider"; Name="Login to Inzicht";                                    Domain="Auth & User Management"; Priority="High";   Status="TODO"; Person=""; Files=@("Provider\Login\LoginToInzicht.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Provider"; Name="Login to Inzicht - Authenticator";                   Domain="Auth & User Management"; Priority="Medium"; Status="TODO"; Person=""; Files=@("Provider\\Login\\AuthenticatorLogin.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Provider"; Name="Login to Inzicht - Email";                           Domain="Auth & User Management"; Priority="Medium"; Status="TODO"; Person=""; Files=@("Provider\\Login\\EmailLogin.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Provider"; Name="Login to Inzicht - SMS";                             Domain="Auth & User Management"; Priority="Medium"; Status="TODO"; Person=""; Files=@("Provider\\Login\\SMSLogin.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Admin";    Name="Login to IAM";                                       Domain="Auth & User Management"; Priority="High";   Status="TODO"; Person=""; Files=@("Admin\LoginToIAM.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Admin";    Name="Delete User";                                        Domain="Auth & User Management"; Priority="Medium"; Status="TODO"; Person=""; Files=@("Admin\\User\\DeleteUser.feature") })

# --- Claim Orchestration ---
$extraTCs.Add([PSCustomObject]@{ Actor="Provider"; Name="Stop - Partial Stop Claim Lines";                    Domain="Claim Orchestration";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Provider\Claim\Stop\PartialStopClaimLines.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Provider"; Name="Stop - Leniency Stop";                               Domain="Claim Orchestration";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Provider\Claim\Stop\LeniencyStop.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Provider"; Name="Stop - Outstanding Amount Stop";                     Domain="Claim Orchestration";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Provider\Claim\Stop\OutstandingAmountStop.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Provider"; Name="Stop - Leniency Fixed Amount Stop";                  Domain="Claim Orchestration";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Provider\Claim\Stop\LeniencyFixedAmountStop.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Provider"; Name="Stop - Leniency Percentage Amount Stop";             Domain="Claim Orchestration";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Provider\Claim\Stop\LeniencyPercentageAmountStop.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Process Claim When UBO Not Blocked";                 Domain="Claim Orchestration";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\ClaimFile\UploadFile\ProcessClaimWhenUBONotBlocked.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Process Claim Without Changing UBO Status";          Domain="Claim Orchestration";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\ClaimFile\UploadFile\ProcessClaimWithoutChangingUBOStatusInDB.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Provider"; Name="Process Claim in Inzicht When UBO Blocked";          Domain="Claim Orchestration";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Provider\ClaimFile\UploadFile\ProcessClaimInInzichtWhenUBOIsBlocked.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Add Custom Objection to Claim";                      Domain="Claim Orchestration";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\Claim\Complaint\AddCustomObjectionToClaim.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Claim Search - From Form";                           Domain="Claim Orchestration";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\Claim\\Search\\ClaimSearchFromForm.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Claim Search - From URI";                            Domain="Claim Orchestration";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\Claim\\Search\\ClaimSearchFromUri.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Objection Reason Management";                        Domain="Claim Orchestration";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\Maintenance\\ObjectionReason.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Rule Interpretation Details";                        Domain="Claim Orchestration";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\RuleInterpreter\\RuleInterpretationDetails.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Rule Interpreter";                                   Domain="Claim Orchestration";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\RuleInterpreter\\RuleInterpreter.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Add New Rule";                                       Domain="Claim Orchestration";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\Rules\\AddNewRule.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Delete Rule";                                        Domain="Claim Orchestration";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\Rules\\DeleteRule.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Update Rule";                                        Domain="Claim Orchestration";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\Rules\\UpdateRule.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Provider"; Name="Block Claim Redelivery After 3 Address Changes";     Domain="Claim Orchestration";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Provider\\Claim\\AddressChange\\BlockClaimRedeliveryByPostAfter3AddressChanges.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Provider"; Name="Correct Incorrect Post Code";                        Domain="Claim Orchestration";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Provider\\Claim\\AddressChange\\CorrectIncorrectPostCode.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Provider"; Name="Retrocessions - Add Retrocession";                   Domain="Claim Orchestration";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Provider\\Claim\\Retrocessions\\AddRetrocession.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Provider"; Name="Retrocessions - View Retrocessions";                 Domain="Claim Orchestration";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Provider\\Claim\\Retrocessions\\ViewRetrocessions.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="HelpDesk - My Tickets";                              Domain="Claim Orchestration";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\HelpdeskTOFIXPREPAREFOREMPTYENVIRONMENT\\MyTicketsPage.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="HelpDesk - Open Tickets";                            Domain="Claim Orchestration";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\HelpdeskTOFIXPREPAREFOREMPTYENVIRONMENT\\OpenTicketsPage.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="HelpDesk - Ticket Page";                             Domain="Claim Orchestration";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\HelpdeskTOFIXPREPAREFOREMPTYENVIRONMENT\\TicketPage.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Provider"; Name="[TO REMOVE] Navigate to Incorrect Claims and Back";  Domain="Claim Orchestration";    Priority="Low";    Status="TODO"; Person=""; Files=@("Provider\\NavigationTOREMOVEMAYBE\\NavigateToIncorrectClaimsAndBack.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Provider"; Name="[TO REMOVE] Navigate from BA Overview";              Domain="Claim Orchestration";    Priority="Low";    Status="TODO"; Person=""; Files=@("Provider\\NavigationTOREMOVEMAYBE\\NavigateToIncorrectClaimsFromBAOverview.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Provider"; Name="[TO REMOVE] Navigate from First Row";                Domain="Claim Orchestration";    Priority="Low";    Status="TODO"; Person=""; Files=@("Provider\\NavigationTOREMOVEMAYBE\\NavigateToIncorrectClaimsFromFirstRow.feature") })

# --- Costs & Tariffs ---
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Approve Bulk Fee";                                   Domain="Costs & Tariffs";        Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\BulkFee\\ApproveFee.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Decline Bulk Fee";                                   Domain="Costs & Tariffs";        Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\BulkFee\\DeclineFee.feature") })

# --- Customer Configuration ---
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Special Agreement Note";                             Domain="Customer Configuration"; Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\BusinessAccount\\SpecialAgreementNote.feature") })

# --- Invoicing & Dunning ---
$extraTCs.Add([PSCustomObject]@{ Actor="Patient";  Name="Copy Digital Invoice from Download Popup";           Domain="Invoicing & Dunning";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Patient\Claim\CreateCopy\CopyDigitalInvoiceFromDownloadInvoicePopup.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Patient";  Name="Postpone Invoice Due Date";                          Domain="Invoicing & Dunning";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Patient\\Claim\\ExtendDueDate\\PostponeInvoiceDueDate.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Patient";  Name="Open Payment Page - Pharmaceutical Invoice";         Domain="Invoicing & Dunning";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Patient\\Claim\\ShowClaim\\OpenPaymentPageForPharmaceuticalInvoice.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Patient";  Name="Open Payment Page - From Fallback Page";             Domain="Invoicing & Dunning";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Patient\\Claim\\ShowClaim\\OpenPaymentPageFromFallbackPage.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Patient";  Name="Open Payment Page - From URL";                       Domain="Invoicing & Dunning";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Patient\\Claim\\ShowClaim\\OpenPaymentPageFromUrl.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Patient";  Name="Open Payment Page - Invalid Invoice Number";         Domain="Invoicing & Dunning";    Priority="Medium"; Status="TODO"; Person=""; Files=@("Patient\\Claim\\ShowClaim\\OpenPaymentPageWithInvalidInvoiceNumber.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="System";   Name="Invoice Expiration - Basic Claim After CIR";         Domain="Invoicing & Dunning";    Priority="High";   Status="TODO"; Person=""; Files=@("Automated\\InvoiceExpiration\\Basic\\ClaimHandledAfterCIR.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="System";   Name="Invoice Expiration - Basic Digital After CIR";       Domain="Invoicing & Dunning";    Priority="High";   Status="TODO"; Person=""; Files=@("Automated\\InvoiceExpiration\\Basic\\DigitalClaimHandledAfterCIR.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="System";   Name="Invoice Expiration - Complete Claim to Bailiff";     Domain="Invoicing & Dunning";    Priority="High";   Status="TODO"; Person=""; Files=@("Automated\\InvoiceExpiration\\Complete\\ClaimSentToBailiffAfterCIR.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="System";   Name="Invoice Expiration - Complete Digital to Bailiff";   Domain="Invoicing & Dunning";    Priority="High";   Status="TODO"; Person=""; Files=@("Automated\\InvoiceExpiration\\Complete\\DigitalClaimSentToBailiffAfterCIR.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="System";   Name="Invoice Expiration - Extended Claim to Bailiff";     Domain="Invoicing & Dunning";    Priority="High";   Status="TODO"; Person=""; Files=@("Automated\\InvoiceExpiration\\Extended\\ClaimSentToBailiffAfterCIR.feature") })

# --- Payment Matching ---
$extraTCs.Add([PSCustomObject]@{ Actor="Patient";  Name="Confirm IDEAL Payment Manually";                     Domain="Payment Matching";       Priority="Medium"; Status="TODO"; Person=""; Files=@("Patient\Claim\Pay\ConfirmIDEALPaymentManually.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Patient";  Name="Confirm Payment Agreement DD Manually";              Domain="Payment Matching";       Priority="Medium"; Status="TODO"; Person=""; Files=@("Patient\Claim\PaymentAgreement\ConfirmPaymentAgreementDDManually.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Matching - Assign Payments To Myself";               Domain="Payment Matching";       Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\ToDo\\Matching\\AssignPaymentsToMyself.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Matching - Assign Selected Payments Summary";        Domain="Payment Matching";       Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\ToDo\\Matching\\AssignSelectedPaymentsSummaryDialog.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Matching - Duplicated Payments Buttons";             Domain="Payment Matching";       Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\ToDo\\Matching\\DuplicatedPaymentsButtons.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Matching - Filter Payments";                         Domain="Payment Matching";       Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\ToDo\\Matching\\FilterPayments.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Matching - Full Text Search";                        Domain="Payment Matching";       Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\ToDo\\Matching\\FullTextSearch.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Matching - Sort Payments";                           Domain="Payment Matching";       Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\ToDo\\Matching\\SortPayments.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Matching - Start Matching Button";                   Domain="Payment Matching";       Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\ToDo\\Matching\\StartMatchingButton.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Matching - Forward Payment";                         Domain="Payment Matching";       Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\ToDo\\Matching\\ForwardPayment.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Matching - Take Remaining as Profit";                Domain="Payment Matching";       Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\ToDo\\Matching\\TakeRemainingAsProfit.feature") })

# --- Reception ---
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Admin Code in GDS File Name";                        Domain="Reception";              Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\ClaimFile\\AdminCode\\AdminCodeGDSFileName.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Admin Code in GDS Declaration No";                   Domain="Reception";              Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\ClaimFile\\AdminCode\\AdminCodeInGDSDeclarationNo.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Admin Code in LH File Name";                         Domain="Reception";              Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\ClaimFile\\AdminCode\\AdminCodeInLHFileName.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="No Admin Code in LH File Name";                      Domain="Reception";              Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\ClaimFile\\AdminCode\\NoAdminCodeInLHFileName.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="GDS Claim File with Correct BSN";                    Domain="Reception";              Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\ClaimFile\\BSN\\GDSWithCorrectBSN.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="GDS Claim File with Incorrect BSN";                  Domain="Reception";              Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\ClaimFile\\BSN\\GDSWithIncorrectBSN.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="MZ Claim File with Correct BSN";                     Domain="Reception";              Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\ClaimFile\\BSN\\MZWithCorrectBSN.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="MZ Claim File with Incorrect BSN";                   Domain="Reception";              Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\ClaimFile\\BSN\\MZWithIncorrectBSN.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Process CHA Claim File - Agent (IM001)";             Domain="Reception";              Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\ClaimFile\\ProcessFile\\CHA_IM001.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Provider"; Name="Process Claim File Inzicht - GDS801v1";              Domain="Reception";              Priority="Medium"; Status="TODO"; Person=""; Files=@("Provider\ClaimFile\ProcessFile\GDS801v1.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Process Claim File - CHA_IM001";                    Domain="Reception";              Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\ClaimFile\ProcessFile\CHA_IM001.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Provider"; Name="Process Claim File Inzicht - CHA_IM002";             Domain="Reception";              Priority="Medium"; Status="TODO"; Person=""; Files=@("Provider\ClaimFile\ProcessFile\CHA_IM002.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Provider"; Name="Upload Claim File from Home Page";                   Domain="Reception";              Priority="Medium"; Status="TODO"; Person=""; Files=@("Provider\ClaimFile\UploadFile\SuccessfulUploadFileFromHomePage.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Provider"; Name="Failed Upload Claim File from Home Page";            Domain="Reception";              Priority="Medium"; Status="TODO"; Person=""; Files=@("Provider\ClaimFile\UploadFile\FailedUploadFileFromHomePage.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Provider"; Name="Download All Claim Files Report";                    Domain="Reception";              Priority="Medium"; Status="TODO"; Person=""; Files=@("Provider\\Report\\DownloadAllClaimFiles.feature") })

# --- Templating & Messaging ---
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="Notification CSV Export";                            Domain="Templating & Messaging"; Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\Maintenance\\NotificationCSV.feature") })
$extraTCs.Add([PSCustomObject]@{ Actor="Agent";    Name="TIM-Inzicht Notification Integration";               Domain="Templating & Messaging"; Priority="Medium"; Status="TODO"; Person=""; Files=@("Agent\\Maintenance\\NotificationTIMInzichtIntegration.feature") })

# ============================================================
# 3d. Tryb DiffOnly - wyswietl niezamapowane feature files i zakoncz
# ============================================================
if ($DiffOnly) {
    Write-Host ""
    Write-Host "=== DIFF MODE: feature files bez TC w inventory ===" -ForegroundColor Yellow
    $allMappedFiles = [System.Collections.Generic.List[string]]::new()
    foreach ($paths in $mapping.Values) {
        foreach ($p in $paths) { $allMappedFiles.Add([IO.Path]::GetFileNameWithoutExtension($p).ToLower()) }
    }
    foreach ($etc in $extraTCs) {
        foreach ($p in $etc.Files) { $allMappedFiles.Add([IO.Path]::GetFileNameWithoutExtension($p).ToLower()) }
    }
    $features = Get-ChildItem -Path $RepoRoot -Recurse -Filter "*.feature" |
        Where-Object { $_.FullName -notmatch "\\Prepare\\" }
    $unmapped = $features | Where-Object { $allMappedFiles -notcontains $_.BaseName.ToLower() } |
        ForEach-Object { $_.FullName -replace [regex]::Escape($RepoRoot+"\\"),"" } | Sort-Object
    if ($unmapped.Count -eq 0) {
        Write-Host "  Brak niezamapowanych plikow - wszystko w inventory!" -ForegroundColor Green
    } else {
        Write-Host "  Znaleziono $($unmapped.Count) plikow bez TC:" -ForegroundColor Red
        $unmapped | ForEach-Object { Write-Host "    $_" }
    }
    Write-Host ""
    exit
}

# ============================================================
# 4. Buduj wiersze raportu
# ============================================================
Write-Host "Generuję raport..." -ForegroundColor Cyan

$featurePathSet = $featureData | Group-Object { $_.RelPath.ToLower() -replace "\\", "\" }

function Get-FeatureInfo([string]$path) {
    $norm = $path.ToLower()
    $match = $featureData | Where-Object { $_.RelPath.ToLower() -eq $norm } | Select-Object -First 1
    if ($match) { return $match }
    # fallback: fuzzy filename match
    $name = [System.IO.Path]::GetFileNameWithoutExtension($path).ToLower()
    return $featureData | Where-Object { $_.FileNameNoExt -eq $name } | Select-Object -First 1
}

# Normalizacja starych skrotow do pelnych nazwisk
$personNormalize = @{
    "CezaryF"  = "Cezary Frączkowski"
    "KamilM"   = "Kamil Małysiak"
    "KamilK"   = "Kamil Kosko"
    "TomaszS"  = "Tomasz Statkowski"
    "Sylwia"   = "Sylwia Kulig"
}

$report = [System.Collections.Generic.List[PSCustomObject]]::new()

$tcIndex = 1
foreach ($tc in $tcList) {
    $tcId   = "TC-{0:000}" -f $tcIndex
    $tcIndex++
    $paths = $mapping[$tc.TC_ID]
    $actor = if ($actorMapping.ContainsKey($tc.TC_ID)) { $actorMapping[$tc.TC_ID] } else { "?" }
    $person = if ($tc.Person -and $personNormalize.ContainsKey($tc.Person)) { $personNormalize[$tc.Person] } else { $tc.Person }

    if ($null -eq $paths) {
        # TC nie ma w mapping - spróbuj keyword search
        $keywords = ($tc.Name -split "[\s/\-]+" | Where-Object { $_.Length -gt 3 })
        $paths = @()
    }

    $matchedFiles = [System.Collections.Generic.List[string]]::new()
    $suiteTags = [System.Collections.Generic.List[string]]::new()
    $hasFeature = $false

    foreach ($p in $paths) {
        $p = $p -replace '\\\\', '\'
        $info = Get-FeatureInfo $p
        if ($info) {
            $hasFeature = $true
            $matchedFiles.Add($info.RelPath)
            if ($info.Suite) { $suiteTags.Add($info.Suite) }
        } else {
            # Sciezka w mapping ale plik nie istnieje w repo
            $matchedFiles.Add("BRAK: $p")
        }
    }

    # Jesli feature istnieje ale Excel mowi TODO -> nadpisz na DONE
    $effectiveStatus = if ($hasFeature -and $tc.Status -eq "TODO") { "DONE" } else { $tc.Status }

    # Okresl gap/action
    $action = switch ($effectiveStatus) {
        "DONE"        { if ($hasFeature) { "OK" } else { "SPRAWDZ - brak feature mimo DONE" } }
        "IN PROGRESS" { if ($hasFeature) { "W trakcie" } else { "DO STWORZENIA (in progress)" } }
        "ALMOST"      { if ($hasFeature) { "Prawie gotowe" } else { "DO DOKONCZENIA" } }
        "TODO"        { "DO ZROBIENIA" }
        default       { if ($effectiveStatus) { $effectiveStatus } else { "BRAK STATUSU" } }
    }

    $suiteStr = ($suiteTags | Select-Object -Unique) -join "; "
    $testType = if     ($suiteStr -eq "Sanity") { "Sanity" }
                elseif ($suiteStr -eq "Smoke")  { "Smoke" }
                else                            { "" }
    $filesStr = if ($matchedFiles.Count -gt 0) { $matchedFiles -join "`n" } else { "" }

    $report.Add([PSCustomObject]@{
        Actor          = $actor
        TC_ID          = $tcId
        Test_Name      = $tc.Name
        Domain         = $tc.Domain
        Test_Type      = $testType
        Excel_Status   = $effectiveStatus
        Person         = $person
        Priority       = $tc.Priority
        Feature_Files  = $filesStr
        Notes          = $tc.Notes
        ADO_Dev_ID     = $tc.DevId
        ADO_Dev_URL    = $tc.DevUrl
        ADO_Int_ID     = $tc.IntId
        ADO_Int_URL    = $tc.IntUrl
    })
}

# Extra TCs (nie w source Excel) - doklejane po wierszach z Excela
foreach ($etc in $extraTCs) {
    $tcId    = "TC-{0:000}" -f $tcIndex
    $tcIndex++

    $matchedFiles = [System.Collections.Generic.List[string]]::new()
    $suiteTags    = [System.Collections.Generic.List[string]]::new()
    foreach ($fp in $etc.Files) {
        $fp = $fp -replace '\\\\', '\'
        $info = Get-FeatureInfo $fp
        $matchedFiles.Add($fp)
        if ($info -and $info.Suite) { $suiteTags.Add($info.Suite) }
    }
    $suiteStr = ($suiteTags | Select-Object -Unique) -join "; "
    $testType = if     ($suiteStr -eq "Sanity") { "Sanity" }
                elseif ($suiteStr -eq "Smoke")  { "Smoke" }
                else                            { "" }

    $report.Add([PSCustomObject]@{
        Actor          = $etc.Actor
        TC_ID          = $tcId
        Test_Name      = $etc.Name
        Domain         = $etc.Domain
        Test_Type      = $testType
        Excel_Status   = if ($etc.Files.Count -gt 0) { "DONE" } else { $etc.Status }
        Person         = $etc.Person
        Priority       = $etc.Priority
        Feature_Files  = $matchedFiles -join "`n"
        Notes          = ""
        ADO_Dev_ID     = $null
        ADO_Dev_URL    = $null
        ADO_Int_ID     = $null
        ADO_Int_URL    = $null
    })
}

# ============================================================
# 5. Eksport do XLSX z formatowaniem
# ============================================================
Write-Host "Zapisuję Excel..." -ForegroundColor Cyan

$xlApp = New-Object -ComObject Excel.Application
$xlApp.Visible = $false
$xlApp.DisplayAlerts = $false
$wb2 = $xlApp.Workbooks.Add()
$ws  = $wb2.Sheets.Item(1)
$ws.Name = "TA_Report"

# Kolory statusow (RGB -> Excel ColorIndex via OLE)
$colorDone       = 0xC6EFCE  # zielony
$colorInProgress = 0xFFEB9C  # zolty
$colorAlmost     = 0xFFEB9C  # zolty (jak IN PROGRESS)
$colorTodo       = 0xFFC7CE  # czerwony/rozowy
$colorNoFeature  = 0xF2DCDB  # blady rozowy
$colorHeader     = 0x4472C4  # niebieski naglowek

# Naglowki
$headers = @("Actor","TC_ID","Test_Name","Domain","Test_Type","Excel_Status","Person","Priority","Feature_Files","Notes","ADO_Dev","ADO_Int","Related_TC")
for ($c = 1; $c -le $headers.Count; $c++) {
    $cell = $ws.Cells.Item(1, $c)
    $cell.Value2 = $headers[$c - 1]
    $cell.Font.Bold = $true
    $cell.Font.Color = 0xFFFFFF
    $cell.Interior.Color = $colorHeader
}

# Dane
$rowIdx = 2
foreach ($rec in $report) {
    $values = @($rec.Actor, $rec.TC_ID, $rec.Test_Name, $rec.Domain, $rec.Test_Type, $rec.Excel_Status,
                $rec.Person, $rec.Priority, $rec.Feature_Files, $rec.Notes)
    for ($c = 1; $c -le $values.Count; $c++) {
        $ws.Cells.Item($rowIdx, $c).Value2 = "$($values[$c - 1])"
    }

    # ADO_Dev hyperlink (col 11)
    if ($rec.ADO_Dev_URL) {
        $devCell = $ws.Cells.Item($rowIdx, 11)
        $ws.Hyperlinks.Add($devCell, $rec.ADO_Dev_URL, "", "ADO DEV: $($rec.ADO_Dev_ID)", "$($rec.ADO_Dev_ID)") | Out-Null
    } elseif ($rec.ADO_Dev_ID) {
        $ws.Cells.Item($rowIdx, 11).Value2 = "$($rec.ADO_Dev_ID)"
    }

    # ADO_Int hyperlink (col 12)
    if ($rec.ADO_Int_URL) {
        $intCell = $ws.Cells.Item($rowIdx, 12)
        $ws.Hyperlinks.Add($intCell, $rec.ADO_Int_URL, "", "ADO INT: $($rec.ADO_Int_ID)", "$($rec.ADO_Int_ID)") | Out-Null
    } elseif ($rec.ADO_Int_ID) {
        $ws.Cells.Item($rowIdx, 12).Value2 = "$($rec.ADO_Int_ID)"
    }

    # Kolor tylko komórki Excel_Status (col 6)
    $rowColor = switch ($rec.Excel_Status) {
        "DONE"        { $colorDone }
        "IN PROGRESS" { $colorInProgress }
        "ALMOST"      { $colorAlmost }
        "TODO"        { $colorTodo }
        default       { $null }
    }
    if ($rowColor) {
        $ws.Cells.Item($rowIdx, 6).Interior.Color = $rowColor
    }


    $rowIdx++
}

# AutoFilter na wierszu naglowkowym
$ws.Rows.Item(1).AutoFilter() | Out-Null

# Zamroz pierwszy wiersz
$ws.Application.ActiveWindow.SplitRow = 1
$ws.Application.ActiveWindow.FreezePanes = $true

# Dopasuj szerokosc kolumn (z wyjatkiem Feature_Files ktora moze byc dluga)
$usedRange = $ws.UsedRange
$usedRange.Columns.AutoFit() | Out-Null
# Ogranicz max szerokosc kolumny Feature_Files (col 9) i Notes (col 10)
$ws.Columns.Item(9).ColumnWidth = 60
$ws.Columns.Item(10).ColumnWidth = 40
# WrapText tylko na zakresie z danymi (nie na calej kolumnie - bug COM przy SaveAs)
$ws.Range($ws.Cells.Item(2, 9), $ws.Cells.Item($dataRows + 1, 9)).WrapText = $true
# ADO link columns
$ws.Columns.Item(11).ColumnWidth = 12
$ws.Columns.Item(12).ColumnWidth = 12
# Related_TC
$ws.Columns.Item(13).ColumnWidth = 20

# ============================================================
# Zakładki słownikowe (Actors, Statuses, Priorities, Domains, Team_Members)
# ============================================================
$refSheetColor = 0xF2F2F2  # jasno-szary nagłówek

function Add-RefSheet {
    param($wb, [string]$name, [string[]]$headers, [object[][]]$data, [int]$headerColor)
    $sheet = $wb.Sheets.Add([System.Type]::Missing, $wb.Sheets.Item($wb.Sheets.Count))
    $sheet.Name = $name
    for ($c = 1; $c -le $headers.Count; $c++) {
        $cell = $sheet.Cells.Item(1, $c)
        $cell.Value2 = $headers[$c - 1]
        $cell.Font.Bold = $true
        $cell.Interior.Color = $headerColor
    }
    for ($r = 0; $r -lt $data.Count; $r++) {
        for ($c = 0; $c -lt $data[$r].Count; $c++) {
            $sheet.Cells.Item($r + 2, $c + 1).Value2 = $data[$r][$c]
        }
    }
    $sheet.UsedRange.Columns.AutoFit() | Out-Null
    return $sheet
}

# Test_Types
Add-RefSheet -wb $wb2 -name "Test_Types" -headerColor $refSheetColor `
    -headers @("Test_Type") `
    -data @(
        @("Sanity"),
        @("Smoke"),
        @("Functional"),
        @("Regression"),
        @("E2E")
    ) | Out-Null

# Actors
Add-RefSheet -wb $wb2 -name "Actors" -headerColor $refSheetColor `
    -headers @("Actor","Description") `
    -data @(
        @("Agent",    "Agent TIM — pracownik biura"),
        @("Provider", "Provider Inzicht — placówka/lekarz"),
        @("Patient",  "Patient — Payment Page"),
        @("Admin",    "Admin — IAM / zarządzanie użytkownikami"),
        @("System",   "System — testy automatyczne bez UI")
    ) | Out-Null

# Status_Options
Add-RefSheet -wb $wb2 -name "Status_Options" -headerColor $refSheetColor `
    -headers @("Status","Description") `
    -data @(
        @("TODO",        "Nie zaczęty"),
        @("IN PROGRESS", "W trakcie implementacji"),
        @("ALMOST",      "Prawie gotowy — drobne poprawki"),
        @("DONE",        "Zaimplementowany i działa"),
        @("BLOCKED",     "Zablokowany — czeka na zewnętrzną zależność"),
        @("ON HOLD",     "Wstrzymany")
    ) | Out-Null

# Priorities
Add-RefSheet -wb $wb2 -name "Priorities" -headerColor $refSheetColor `
    -headers @("Priority","Suite") `
    -data @(
        @("Low",      ""),
        @("Medium",   ""),
        @("High",     "SANITY"),
        @("Critical", "SMOKE")
    ) | Out-Null

# Domains
Add-RefSheet -wb $wb2 -name "Domains" -headerColor $refSheetColor `
    -headers @("Domain") `
    -data @(
        @("Factoring (w. Risk & CHA)"),
        @("Costs & Tariffs"),
        @("Customer Configuration"),
        @("Reception"),
        @("Vendor API"),
        @("Claim Orchestration"),
        @("Insurers"),
        @("Templating & Messaging"),
        @("Invoicing & Dunning"),
        @("Bailiff"),
        @("Banking"),
        @("Payment Matching"),
        @("Accounting (w. Ledger Connector)"),
        @("Auth & User Management"),
        @("Frontend Infrastructure")
    ) | Out-Null

# Team_Members
Add-RefSheet -wb $wb2 -name "Team_Members" -headerColor $refSheetColor `
    -headers @("Name") `
    -data @(
        @("Adam Kolassa"),            @("Adam Szmielak"),
        @("Andrzej Woźniak"),          @("Bartłomiej Smykowski"),
        @("Bartosz Jonik"),            @("Bartosz Uscinowicz"),
        @("Beata Żurawska"),           @("Błażej Skopnik"),
        @("Cezary Frączkowski"),       @("Cezary Hodun"),
        @("Damian Liminowicz"),        @("Dorota Kobryńska"),
        @("Grzegorz Cieszyński"),      @("Grzegorz Tomaszewicz"),
        @("Jacek Nowicki"),            @("Jakub Tryniszewski"),
        @("Kamil Kosko"),              @("Kamil Małysiak"),
        @("Kamil Radosz"),             @("Kamil Stróżyk"),
        @("Karol Czoska"),             @("Karol Dziki"),
        @("Karol Ulanowski"),          @("Konrad Siwiński"),
        @("Krzysztof Kisiel"),         @("Krzysztof Makulec"),
        @("Krzysztof Rybaczyk"),       @("Łukasz Wierejko"),
        @("Małgorzata Andruszkiewicz"),@("Marcin Boniecki"),
        @("Marcin Pogorzelski"),       @("Marcin Rodziewicz"),
        @("Marek Ulanowski"),          @("Marek Zięba"),
        @("Mariusz Gogół"),            @("Mateusz Chodyla"),
        @("Michał Annis"),             @("Michał Baranowski"),
        @("Michał Gotowicz"),          @("Michał Miś"),
        @("Michał Smiatacz"),          @("Michał Szmeja"),
        @("Patryk Wiśniewski"),        @("Paweł Durczak"),
        @("Paweł Wańczura"),           @("Paweł Wiszniewski"),
        @("Piotr Kołpa"),              @("Przemysław Klejno"),
        @("Ryszard Różański"),         @("Sławomir Dropiewski"),
        @("Sylwia Kulig"),             @("Szymon Szeremeta"),
        @("Tomasz Czołba"),            @("Tomasz Nowak"),
        @("Tomasz Smerdzyński"),       @("Tomasz Statkowski")
    ) | Out-Null

# ============================================================
# Data Validation dropdowns na zakładce TA_Report
# ============================================================
$dataRows = $report.Count
if ($dataRows -gt 0) {
    $xlValidateList    = 3
    $xlBetween         = 1
    $xlValidAlertStop  = 1

    # Kolumna 1 = Actor (odwołanie do zakresu w zakładce Actors)
    $actorRange = $ws.Range($ws.Cells.Item(2,1), $ws.Cells.Item($dataRows+1, 1))
    $actorRange.Validation.Delete()
    $actorRange.Validation.Add($xlValidateList, $xlValidAlertStop, $xlBetween, "=Actors!`$A`$2:`$A`$6") | Out-Null
    $actorRange.Validation.ShowInput = $false

    # Kolumna 4 = Domain (odwołanie do zakresu w zakładce Domains)
    $domainRange = $ws.Range($ws.Cells.Item(2,4), $ws.Cells.Item($dataRows+1, 4))
    $domainRange.Validation.Delete()
    $domainRange.Validation.Add($xlValidateList, $xlValidAlertStop, $xlBetween, "=Domains!`$A`$2:`$A`$16") | Out-Null
    $domainRange.Validation.ShowInput = $false

    # Kolumna 5 = Test_Type (odwołanie do zakresu w zakładce Test_Types)
    $typeRange = $ws.Range($ws.Cells.Item(2,5), $ws.Cells.Item($dataRows+1, 5))
    $typeRange.Validation.Delete()
    $typeRange.Validation.Add($xlValidateList, $xlValidAlertStop, $xlBetween, "=Test_Types!`$A`$2:`$A`$6") | Out-Null
    $typeRange.Validation.ShowInput = $false

    # Kolumna 6 = Excel_Status (odwołanie do zakresu w zakładce Status_Options)
    $statusRange = $ws.Range($ws.Cells.Item(2,6), $ws.Cells.Item($dataRows+1, 6))
    $statusRange.Validation.Delete()
    $statusRange.Validation.Add($xlValidateList, $xlValidAlertStop, $xlBetween, "=Status_Options!`$A`$1:`$A`$6") | Out-Null
    $statusRange.Validation.ShowInput = $false

    # Kolumna 7 = Person (odwołanie do zakresu w zakładce Team_Members)
    $personRange = $ws.Range($ws.Cells.Item(2,7), $ws.Cells.Item($dataRows+1, 7))
    $personRange.Validation.Delete()
    $personRange.Validation.Add($xlValidateList, $xlValidAlertStop, $xlBetween, "=Team_Members!`$A`$2:`$A`$57") | Out-Null
    $personRange.Validation.ShowInput = $false

    # Kolumna 8 = Priority (odwołanie do zakresu w zakładce Priorities)
    $prioRange = $ws.Range($ws.Cells.Item(2,8), $ws.Cells.Item($dataRows+1, 8))
    $prioRange.Validation.Delete()
    $prioRange.Validation.Add($xlValidateList, $xlValidAlertStop, $xlBetween, "=Priorities!`$A`$2:`$A`$5") | Out-Null
    $prioRange.Validation.ShowInput = $false
}

# Aktywuj zakładkę TA_Report przy otwieraniu
$ws.Activate()

# Zapisz
try {
    $wb2.SaveAs($OutputXlsx, 51)  # 51 = xlOpenXMLWorkbook (.xlsx)
} finally {
    $wb2.Close($false)
    $xlApp.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($xlApp) | Out-Null
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " RAPORT GOTOWY: $OutputXlsx" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Podsumowanie globalne
$done       = $report | Where-Object { $_.Excel_Status -eq "DONE" }
$inProgress = $report | Where-Object { $_.Excel_Status -eq "IN PROGRESS" }
$todo       = $report | Where-Object { $_.Excel_Status -eq "TODO" }
$almost     = $report | Where-Object { $_.Excel_Status -eq "ALMOST" }
$withType   = $report | Where-Object { $_.Test_Type -ne "" }

Write-Host "PODSUMOWANIE GLOBALNE:" -ForegroundColor Yellow
Write-Host "  Wszystkich TC w Excelu:          $($report.Count)"
Write-Host "  DONE:                             $($done.Count)"
Write-Host "  IN PROGRESS:                      $($inProgress.Count)"
Write-Host "  ALMOST:                           $($almost.Count)"
Write-Host "  TODO:                             $($todo.Count)"
Write-Host "  Ma Test_Type (Sanity/Smoke/...):  $($withType.Count)"
Write-Host ""

# Podsumowanie per Aktor
Write-Host "PODSUMOWANIE PER AKTOR:" -ForegroundColor Cyan
$actors = @("Agent", "Provider", "Patient", "Admin", "System", "?")
foreach ($a in $actors) {
    $group = $report | Where-Object { $_.Actor -eq $a }
    if ($group.Count -eq 0) { continue }
    $gDone  = ($group | Where-Object { $_.Excel_Status -eq "DONE" }).Count
    $gIP    = ($group | Where-Object { $_.Excel_Status -eq "IN PROGRESS" }).Count
    $gTodo  = ($group | Where-Object { $_.Excel_Status -eq "TODO" }).Count
    Write-Host ("  {0,-10}  Total={1,2}  DONE={2,2}  IN PROGRESS={3,2}  TODO={4,2}" -f `
        $a, $group.Count, $gDone, $gIP, $gTodo) -ForegroundColor White
}
Write-Host ""

Write-Host "TODO - TC do zrobienia (bez Low prio):" -ForegroundColor Yellow
$todo | Where-Object { $_.Priority -ne "Low" } | ForEach-Object {
    Write-Host ("  {0,-7} [{1,-8}]  {2,-50}  Osoba: {3}" -f $_.TC_ID, $_.Actor, $_.Test_Name, $_.Person) -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Gotowe! Otworz: $OutputXlsx" -ForegroundColor Cyan

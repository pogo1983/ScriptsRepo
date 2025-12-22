/*

Run on all servers:
$hosts = 'imfint04-db01.imfint.local', 'imfint05-db01.imfint.local', 'imfint06-app01.imfint.local', 'imfint07-db01.imfint.local', 'imfint08-db01.imfint.local', 'imfint10-db01.imfint.local', 'imfint11-db01.imfint.local', 'imfint12-db01.imfint.local', 'imfint14-app01.imfint.local', 'imfint15-app01.imfint.local', 'imfint16-app01.imfint.local', 'imfint17-app01.imfint.local', 'imfint99-db01.imfint.local', 'imfint99-db02.imfint.local'
$sqlFilePath='D:\projects\git\DevOps\main\Databases\SQLs\IdentityProvider\CreateBasic_TIMTokens.sql'
$hosts | %{
  $serverInstance = "$_"
  Write-Output $serverInstance
  Invoke-Sqlcmd -ServerInstance $serverInstance -Database 'master' -InputFile $sqlFilePath -QueryTimeout 10000 -ConnectionTimeout 10000 -OutputSqlErrors $true -OutputAs DataSet -verbose
}
  
*/

use IdentityProvider

declare @imdToken_Id varchar(100) = '7ecf4762-f94b-42a5-a9fc-263b37233f8a'
declare @guiToken_Id varchar(100) = '5ca1da75-c94f-44df-a82b-a2b1af005e86'
declare @CustCreditUIToken_Id varchar(100) = 'd0d2b458-18d9-46e7-a3f2-0bdc353ebc84'
declare @timsspToken_Id varchar(100) = '42ac2c99-4b41-4490-b2e0-65aa0b479bab'

delete IdentityProvider.dbo.Tokens
where [Key] in (@imdToken_Id, @guiToken_Id , @CustCreditUIToken_Id, @timsspToken_Id);

declare @dateNow varchar(1000) = convert(varchar(500),getdate(),23)

insert IdentityProvider.dbo.Tokens([Key],[TokenType],[SubjectId],[ClientId],[JsonCode],[Expiry],[CDate],[CBy])
select 
  @guiToken_Id [Key]
  ,2 [TokenType]
  ,'09524e2f-3089-4558-941b-9e515773cde0' [SubjectId]
  ,'gui' [ClientId]
  ,'{"Audience":"InfomedicsIdentityProviderCert/resources","Issuer":"InfomedicsIdentityProviderCert","CreationTime":"'+@dateNow+'T00:00:00.0Z","Lifetime":3600000,"Type":"access_token","Client":{"ClientId":"gui"},"Claims":[{"Type":"client_id","Value":"gui"},{"Type":"scope","Value":"gui"},{"Type":"sub","Value":"09524e2f-3089-4558-941b-9e515773cde0"},{"Type":"amr","Value":"password"},{"Type":"auth_time","Value":"1661979564"},{"Type":"idp","Value":"idsrv"},{"Type":"name","Value":"Agent"},{"Type":"user_groups","Value":"[0,1,2,3,4,5,6,7,8,11,12,15,16,17,18,19,20,29,30],{"Type":"UserGroups","Value":"[0,1,2,3,4,5,6,7,8,11,12,15,16,17,18,19,20,29,30]","ValueType":"json"},{"Type":"BusinessGroup","Value":"Agent"},{"Type":"CanAcceptRejectClaimFiles","Value":""},{"Type":"CanAcceptRejectRisk","Value":""},{"Type":"CanAddFinancialCorrection","Value":""},{"Type":"CanApproveChanges","Value":""},{"Type":"CanApproveRejectCreditApplication","Value":""},{"Type":"CanApproveSettlements","Value":""},{"Type":"CanApproveTermsAndConditions","Value":""},{"Type":"CanAssignPayments","Value":""},{"Type":"CanBlockPayOut","Value":""},{"Type":"CanCancelDigitalDunning","Value":""},{"Type":"CanChangeMatchableItemStatus","Value":""},{"Type":"CanCMIBDeal","Value":""},{"Type":"CanCreatePaymentOutgoingFile","Value":""},{"Type":"CanDeleteDebtorData","Value":""},{"Type":"CanDeleteDocuments","Value":""},{"Type":"CanDownloadClaimFiles","Value":""},{"Type":"CanExtendClaimDueDate","Value":""},{"Type":"CanMatchPayments","Value":""},{"Type":"CanOverrideTickets","Value":""},{"Type":"CanPostponeClaim","Value":""},{"Type":"CanReadAllGroups","Value":""},{"Type":"CanReadAnnotationTemplates","Value":""},{"Type":"CanReadAuthUsers","Value":""},{"Type":"CanReadClaimFiles","Value":""},{"Type":"CanReadClaims","Value":""},{"Type":"CanReadClearingRules","Value":""},{"Type":"CanReadContracts","Value":""},{"Type":"CanReadDocuments","Value":""},{"Type":"CanReadHolidays","Value":""},{"Type":"CanReadICParties","Value":""},{"Type":"CanReadICResultCodes","Value":""},{"Type":"CanReadIRIA","Value":""},{"Type":"CanReadLocalDunningDocuments","Value":""},{"Type":"CanReadParties","Value":""},{"Type":"CanReadPartyAnnotations","Value":""},{"Type":"CanReadPayments","Value":""},{"Type":"CanReadRetrocessions","Value":""},{"Type":"CanReadSettlements","Value":""},{"Type":"CanReadTermsAndConditions","Value":""},{"Type":"CanReadTickets","Value":""},{"Type":"CanReadValidationRules","Value":""},{"Type":"CanRedeliverClaims","Value":""},{"Type":"CanResumeBailiffs","Value":""},{"Type":"CanResumeClaims","Value":""},{"Type":"CanResurrectClaims","Value":""},{"Type":"CanReverseRejection","Value":""},{"Type":"CanReviewCustomerApplications","Value":""},{"Type":"CanSentCreditPayment","Value":""},{"Type":"CanSkipChangeApproval","Value":""},{"Type":"CanStopBailiffs","Value":""},{"Type":"CanStopClaimFiles","Value":""},{"Type":"CanStopClaims","Value":""},{"Type":"CanUpdateAnnotationContent","Value":""},{"Type":"CanUpdateAnnotationTags","Value":""},{"Type":"CanUpdateBadClaimFileAnnotations","Value":""},{"Type":"CanUpdateClaimAnnotations","Value":""},{"Type":"CanUpdateClaimFileAnnotations","Value":""},{"Type":"CanUpdateClaims","Value":""},{"Type":"CanUpdateClearingRules","Value":""},{"Type":"CanUpdateCMIBParties","Value":""},{"Type":"CanUpdateContracts","Value":""},{"Type":"CanUpdateHolidays","Value":""},{"Type":"CanUpdateICParties","Value":""},{"Type":"CanUpdateIRIA","Value":""},{"Type":"CanUpdatePA","Value":""},{"Type":"CanUpdateParticipants","Value":""},{"Type":"CanUpdateParties","Value":""},{"Type":"CanUpdatePartyAnnotations","Value":""},{"Type":"CanUpdatePayment","Value":""},{"Type":"CanUpdatePaymentAnnotationContent","Value":""},{"Type":"CanUpdatePaymentAnnotations","Value":""},{"Type":"CanUpdatePaymentAnnotationTags","Value":""},{"Type":"CanUpdateSettlementAnnotations","Value":""},{"Type":"CanUpdateSettlements","Value":""},{"Type":"CanUpdateTermsAndConditions","Value":""},{"Type":"CanUpdateTickets","Value":""},{"Type":"CanUpdateValidationRules","Value":""},{"Type":"CanUploadClaimFiles","Value":""},{"Type":"CanUploadDocuments","Value":""},{"Type":"CanViewMdmaResponses","Value":""},{"Type":"CanViewPaymentOutgoingFiles","Value":""},{"Type":"UserOwnershipPathsLeaves","Value":"{\"S\":[],\"M\":[],\"B\":[],\"PP\":[],\"P\":[]}"},{"Type":"OwnershipPathsLeaves","Value":"{\"S\":[],\"M\":[],\"B\":[],\"PP\":[],\"P\":[]}","ValueType":"json"}],"SubjectId":"09524e2f-3089-4558-941b-9e515773cde0","ClientId":"gui","Scopes":["gui"],"Expires":"2032-09-01T06:59:25.2220915Z"}' [JsonCode]
  ,dateadd(year,10,getdate()) [Expiry]
  ,getdate() [CDate]
 ,'TestingScript' [CBy]

insert IdentityProvider.dbo.Tokens([Key],[TokenType],[SubjectId],[ClientId],[JsonCode],[Expiry],[CDate],[CBy])
select 
  @imdToken_Id [Key]
  ,2 [TokenType]
  ,'01524e2f-3089-4558-941b-9e515773cde0' [SubjectId]
  ,'imd' [ClientId]
  ,'{"Audience":"InfomedicsIdentityProviderCert/resources","Issuer":"InfomedicsIdentityProviderCert","CreationTime":"'+@dateNow+'T00:00:00.0Z","Lifetime":3600000,"Type":"access_token","Client":{"ClientId":"imd"},"Claims":[{"Type":"client_id","Value":"imd"},{"Type":"scope","Value":"imd"},{"Type":"sub","Value":"09524e2f-3089-4558-941b-9e515773cde0"},{"Type":"amr","Value":"password"},{"Type":"auth_time","Value":"1661978595"},{"Type":"idp","Value":"idsrv"},{"Type":"name","Value":"Agent"},{"Type":"CanManageIMDRules","Value":""},{"Type":"CanViewIMDRules","Value":""}],"SubjectId":"09524e2f-3089-4558-941b-9e515773cde0","ClientId":"imd","Scopes":["imd"],"Expires":"2032-09-01T06:43:15.178176Z"}' [JsonCode]
  ,dateadd(year,10,getdate()) [Expiry]
  ,getdate() [CDate]
 ,'TestingScript' [CBy]

insert IdentityProvider.dbo.Tokens([Key],[TokenType],[SubjectId],[ClientId],[JsonCode],[Expiry],[CDate],[CBy])
select 
  @timsspToken_Id [Key]
  ,2 [TokenType]
  ,'9924d7a7-0aa9-47b0-9ee7-0614054a0366' [SubjectId]
  ,'timssp' [ClientId]
  ,'{"Audience":"InfomedicsIdentityProviderCert/resources","Issuer":"InfomedicsIdentityProviderCert","CreationTime":"'+@dateNow+'T00:00:00.0Z","Lifetime":3600000,"Type":"access_token","Client":{"ClientId":"timssp"},"Claims":[{"Type":"client_id","Value":"timssp"},{"Type":"scope","Value":"timssp"},{"Type":"sub","Value":"9924d7a7-0aa9-47b0-9ee7-0614054a0366"},{"Type":"amr","Value":"password"},{"Type":"auth_time","Value":"1647698375"},{"Type":"idp","Value":"idsrv"},{"Type":"name","Value":"Provider"},{"Type":"allowed_systems","Value":"[{\"Id\":\"timssp\",\"Priority\":2},{\"Id\":\"clp\",\"Priority\":0},{\"Id\":\"contract\",\"Priority\":0},{\"Id\":\"gui\",\"Priority\":0},{\"Id\":\"idmgr\",\"Priority\":0}]"},{"Type":"AllowedSystems","Value":"[{\"Id\":\"timssp\",\"Priority\":2},{\"Id\":\"clp\",\"Priority\":0},{\"Id\":\"contract\",\"Priority\":0},{\"Id\":\"gui\",\"Priority\":0},{\"Id\":\"idmgr\",\"Priority\":0}]","ValueType":"json"},{"Type":"BusinessGroup","Value":"Agent"},{"Type":"ServiceBureauPartyNo","Value":"[\"1120001\"]"},{"Type":"ServiceBureauNo","Value":"[\"1120001\"]","ValueType":"json"},{"Type":"BusinessAccountPartyNo","Value":"[\"70558\",\"70737\",\"1020222\",\"15190\",\"15196\",\"53571\",\"70610\",\"70468\",\"15413\"]"},{"Type":"BusinessAccountNo","Value":"[\"70558\",\"70737\",\"1020222\",\"15190\",\"15196\",\"53571\",\"70610\",\"70468\",\"15413\"]","ValueType":"json"},{"Type":"UserOwnershipPathsLeaves","Value":"{\"S\":[],\"M\":[],\"B\":[\"1020222\",\"15190\",\"15196\",\"15413\",\"53571\",\"70468\",\"70558\",\"70610\",\"70737\"],\"PP\":[],\"P\":[]}"},{"Type":"OwnershipPathsLeaves","Value":"{\"S\":[],\"M\":[],\"B\":[\"1020222\",\"15190\",\"15196\",\"15413\",\"53571\",\"70468\",\"70558\",\"70610\",\"70737\"],\"PP\":[],\"P\":[]}","ValueType":"json"},{"Type":"CanApproveTermsAndConditions","Value":""},{"Type":"CanDownloadClaimFiles","Value":""},{"Type":"CanMarkClaims","Value":""},{"Type":"CanMarkPatients","Value":""},{"Type":"CanMarkRetrocessions","Value":""},{"Type":"CanPostponeClaim","Value":""},{"Type":"CanReadAuthUsers","Value":""},{"Type":"CanReadClaimFiles","Value":""},{"Type":"CanReadClaims","Value":""},{"Type":"CanReadClearingRules","Value":""},{"Type":"CanReadCodelists","Value":""},{"Type":"CanReadContracts","Value":""},{"Type":"CanReadDocuments","Value":""},{"Type":"CanReadHolidays","Value":""},{"Type":"CanReadICParties","Value":""},{"Type":"CanReadICResultCodes","Value":""},{"Type":"CanReadLocalDunningDocuments","Value":""},{"Type":"CanReadParties","Value":""},{"Type":"CanReadPartyAnnotations","Value":""},{"Type":"CanReadRetrocessions","Value":""},{"Type":"CanReadSettlements","Value":""},{"Type":"CanReadTermsAndConditions","Value":""},{"Type":"CanReadValidationRules","Value":""},{"Type":"CanResetPassword","Value":""},{"Type":"CanResumeClaims","Value":""},{"Type":"CanReverseRejection","Value":""},{"Type":"CanStopClaims","Value":""},{"Type":"CanUpdateAuthUsers","Value":""},{"Type":"CanUpdateClaimAnnotations","Value":""},{"Type":"CanUpdateClaims","Value":""},{"Type":"CanUpdateClearingRules","Value":""},{"Type":"CanUpdateHolidays","Value":""},{"Type":"CanUpdatePartyAnnotations","Value":""},{"Type":"CanUpdateSettlementAnnotations","Value":""},{"Type":"CanUploadClaimFiles","Value":""},{"Type":"CanUseLedgerConnector","Value":""},{"Type":"CanViewLedgerConnector","Value":""}],"SubjectId":"9924d7a7-0aa9-47b0-9ee7-0614054a0366","ClientId":"timssp","Scopes":["timssp"],"Expires":"2032-03-20T00:00:26.6297348Z"}' [JsonCode]
  ,dateadd(year,10,getdate()) [Expiry]
  ,getdate() [CDate]
 ,'TestingScript' [CBy]

insert IdentityProvider.dbo.Tokens([Key],[TokenType],[SubjectId],[ClientId],[JsonCode],[Expiry],[CDate],[CBy])
select 
  @CustCreditUIToken_Id [Key]
  ,2 [TokenType]
  ,'9fc2e6d5-0f81-403d-bcd3-dfb1b42fee4c' [SubjectId]
  ,'CustCreditUI' [ClientId]
  ,'{"Audience":"InfomedicsIdentityProviderCert/resources","Issuer":"InfomedicsIdentityProviderCert","CreationTime":"'+@dateNow+'T00:00:00.0Z","Lifetime":3600000,"Type":"access_token","Client":{"ClientId":"CustCreditUI"},"Claims":[{"Type":"client_id","Value":"CustCreditUI"},{"Type":"scope","Value":"CustCreditUI"},{"Type":"sub","Value":"9fc2e6d5-0f81-403d-bcd3-dfb1b42fee4c"},{"Type":"amr","Value":"password"},{"Type":"auth_time","Value":"1647699388"},{"Type":"idp","Value":"idsrv"},{"Type":"name","Value":"CreditAgent"},{"Type":"CanViewPaymentOutgoingFiles","Value":""},{"Type":"CanReadCustomerApplications","Value":""},{"Type":"CanCreatePaymentOutgoingFile","Value":""},{"Type":"CanReadAuthClaims","Value":""},{"Type":"CanReadPayments","Value":""},{"Type":"UserOwnershipPathsLeaves","Value":"{\"S\":[],\"M\":[],\"B\":[],\"PP\":[],\"P\":[]}"},{"Type":"OwnershipPathsLeaves","Value":"{\"S\":[],\"M\":[],\"B\":[],\"PP\":[],\"P\":[]}","ValueType":"json"},{"Type":"CanReadDocuments","Value":""},{"Type":"CanApproveRejectCreditApplication","Value":""},{"Type":"CanMatchPayments","Value":""},{"Type":"CanChangeMatchableItemStatus","Value":""},{"Type":"CanUpdatePaymentAnnotations","Value":""},{"Type":"CanSentCreditPayment","Value":""},{"Type":"CanReviewCustomerApplications","Value":""},{"Type":"CanUpdatePaymentAnnotationContent","Value":""},{"Type":"CanAssignPayments","Value":""},{"Type":"CanReadAuthUsers","Value":""},{"Type":"CanReadLocalDunningDocuments","Value":""},{"Type":"CanUpdatePayment","Value":""},{"Type":"CanUpdatePaymentAnnotationTags","Value":""}],"SubjectId":"9fc2e6d5-0f81-403d-bcd3-dfb1b42fee4c","ClientId":"CustCreditUI","Scopes":["CustCreditUI"],"Expires":"2033-03-20T00:16:28.4075959Z"}' [JsonCode]
  ,dateadd(year,10,getdate()) [Expiry]
  ,getdate() [CDate]
 ,'TestingScript' [CBy]

SET QUOTED_IDENTIFIER ON
if not exists(select * from TIM_Mediation.dbo.BlobRawFilesStore where [ID] = convert(uniqueidentifier,'00000000-0000-0000-0000-111111111111'))
begin 
  update TIM_Mediation.dbo.BlobRawFilesStore set ID = convert(uniqueidentifier,'00000000-0000-0000-0000-111111111111') 
  where [ID] = (select [ID] from TIM_Mediation.dbo.blobrawfiles where IdPrimaryKey = (select min(IdPrimaryKey) from TIM_Mediation.dbo.blobrawfiles))
end

if not exists(select * from [TIM_Mediation].[dbo].[blobrawfiles] where [ID] = convert(uniqueidentifier,'00000000-0000-0000-0000-111111111111'))
begin 
  update [TIM_Mediation].[dbo].[blobrawfiles] set [ID] = convert(uniqueidentifier,'00000000-0000-0000-0000-111111111111') 
  where [IdPrimaryKey] = (select min([IdPrimaryKey]) from [TIM_Mediation].[dbo].[blobrawfiles])
end
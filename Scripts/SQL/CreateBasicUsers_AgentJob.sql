/*

  
Run on all servers:
$hosts = 'imfint04-db01.imfint.local', 'imfint05-db01.imfint.local', 'imfint06-app01.imfint.local', 'imfint07-db01.imfint.local', 'imfint08-db01.imfint.local', 'imfint10-db01.imfint.local', 'imfint11-db01.imfint.local', 'imfint12-db01.imfint.local', 'imfint14-app01.imfint.local', 'imfint15-app01.imfint.local', 'imfint16-app01.imfint.local', 'imfint17-app01.imfint.local', 'imfint99-db01.imfint.local', 'imfint99-db02.imfint.local'
$sqlFilePath='D:\projects\git\DevOps\main\Databases\SQLs\IdentityProvider\CreateBasicUsers_AgentJob.sql'
$hosts | %{
  $serverInstance = "$_"
  Write-Output $serverInstance
  Invoke-Sqlcmd -ServerInstance $serverInstance -Database 'master' -InputFile $sqlFilePath -QueryTimeout 10000 -ConnectionTimeout 10000 -OutputSqlErrors $true -OutputAs DataSet -verbose
}
  
*/
USE [msdb]

GO
begin try
EXEC msdb.dbo.sp_add_operator @name=N'devops', 
                               @enabled=1, 
                               @weekday_pager_start_time=90000, 
                               @weekday_pager_end_time=180000, 
                               @saturday_pager_start_time=90000, 
                               @saturday_pager_end_time=180000, 
                               @sunday_pager_start_time=90000, 
                               @sunday_pager_end_time=180000, 
                               @pager_days=0, 
                               @email_address=N'tfs_infomedics_devops@infoprojekt.pl', 
                               @category_name=N'[Uncategorized]'
end try
begin catch
end catch

GO
declare @job_id uniqueidentifier = null
SELECT @job_id = convert(uniqueidentifier,job_id) FROM msdb.dbo.sysjobs where name = 'CreateBasicUsers'
if (@job_id is not null) begin
  EXEC msdb.dbo.sp_delete_job @job_id=@job_id, @delete_unused_schedule=1
end

GO

/****** Object:  Job [CreateBasicUsers]    Script Date: 22/05/2025 15:39:11 ******/
BEGIN TRANSACTION
DECLARE @ReturnCode INT
SELECT @ReturnCode = 0
/****** Object:  JobCategory [[Uncategorized (Local)]]    Script Date: 22/05/2025 15:39:11 ******/
IF NOT EXISTS (SELECT name FROM msdb.dbo.syscategories WHERE name=N'[Uncategorized (Local)]' AND category_class=1)
BEGIN
EXEC @ReturnCode = msdb.dbo.sp_add_category @class=N'JOB', @type=N'LOCAL', @name=N'[Uncategorized (Local)]'
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback

END

DECLARE @jobId BINARY(16)
EXEC @ReturnCode =  msdb.dbo.sp_add_job @job_name=N'CreateBasicUsers', 
		@enabled=1, 
		@notify_level_eventlog=0, 
		@notify_level_email=2, 
		@notify_level_netsend=0, 
		@notify_level_page=0, 
		@delete_level=0, 
		@description=N'No description available.', 
		@category_name=N'[Uncategorized (Local)]', 
		@owner_login_name=N'sa', 
		@notify_email_operator_name=N'devops', @job_id = @jobId OUTPUT
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [IPCreateAdmin]    Script Date: 22/05/2025 15:39:12 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'IPCreateAdmin', 
		@step_id=1, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=3, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'use IdentityProvider

delete dbo.ClientsUsers where CustomUser_Id in (select id from AspNetUsers  where UserName = ''admin'')
delete AspNetUsers  where UserName = ''admin''

declare @CustomUser_Id varchar(100) = ''03F59150-B184-4F70-864C-26B34A34CAF8''
MERGE INTO [dbo].[AspNetUsers] AS TARGET
USING(VALUES
(@CustomUser_Id, ''608310A7-E2E6-4EE2-A946-9393D6E25A63'', ''ImfMonitoring@infoprojekt.pl'', 1, ''AIHgs9IkZxn1/e2rekHKDZQbiTThPCmzWlc1aplo7nk3ny1REXn6ZD4IR+rtEPWhoA=='', ''33644647-fe68-481e-bd29-e0b547e97e5d'', NULL, 0, 0, NULL, 1, 0, ''Admin'', getdate(), ''createFromJob'', getdate(), NULL, NULL)
)AS SOURCE (
   [Id]
  ,[Origin_Id]
  ,[Email]
  ,[EmailConfirmed]
  ,[PasswordHash]
  ,[SecurityStamp]
  ,[PhoneNumber]
  ,[PhoneNumberConfirmed]
  ,[TwoFactorEnabled]
  ,[LockoutEndDateUtc]
  ,[LockoutEnabled]
  ,[AccessFailedCount]
  ,[UserName]
  ,[CDate]
  ,[CBy]
  ,[UDate]
  ,[DDate]
  ,[DBy]
)
ON TARGET.Id = SOURCE.Id
WHEN MATCHED THEN
UPDATE SET 
   [Origin_Id] = Source.[Origin_Id]
  ,[Email] = Source.[Email]
  ,[EmailConfirmed] = Source.[EmailConfirmed]
  ,[PasswordHash] = Source.[PasswordHash]
  ,[SecurityStamp] = Source.[SecurityStamp]
  ,[PhoneNumber] = Source.[PhoneNumber]
  ,[PhoneNumberConfirmed] = Source.[PhoneNumberConfirmed]
  ,[TwoFactorEnabled] = Source.[TwoFactorEnabled]
  ,[LockoutEndDateUtc] = Source.[LockoutEndDateUtc]
  ,[LockoutEnabled] = Source.[LockoutEnabled]
  ,[AccessFailedCount] = Source.[AccessFailedCount]
  ,[UserName] = Source.[UserName]
  ,[CDate]= Source.[CDate]
  ,[CBy]=Source.[CBy]
  ,[UDate]=Source.[UDate]
  ,[DDate] = Source.[DDate]
  ,[DBy] = Source.[DBy]
WHEN NOT MATCHED BY TARGET THEN
INSERT (
   [Id]
  ,[Origin_Id]
  ,[Email]
  ,[EmailConfirmed]
  ,[PasswordHash]
  ,[SecurityStamp]
  ,[PhoneNumber]
  ,[PhoneNumberConfirmed]
  ,[TwoFactorEnabled]
  ,[LockoutEndDateUtc]
  ,[LockoutEnabled]
  ,[AccessFailedCount]
  ,[UserName]
  ,[CDate]
  ,[CBy]
  ,[UDate]
  ,[DDate]
  ,[DBy]    
)
VALUES (
  [Id]
  ,[Origin_Id]
  ,[Email]
  ,[EmailConfirmed]
  ,[PasswordHash]
  ,[SecurityStamp]
  ,[PhoneNumber]
  ,[PhoneNumberConfirmed]
  ,[TwoFactorEnabled]
  ,[LockoutEndDateUtc]
  ,[LockoutEnabled]
  ,[AccessFailedCount]
  ,[UserName]
  ,[CDate]
  ,[CBy]
  ,[UDate]
  ,[DDate]
  ,[DBy]   
);

DELETE from [dbo].[ClientsUsers] where CustomUser_Id = @CustomUser_Id

MERGE INTO [dbo].[ClientsUsers] AS TARGET
USING(VALUES
  (''6B68C9EF-F6BA-E711-81FC-00155D0C6414'', ''idmgr'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
  (''6668C9EF-F6BA-E711-81FC-00155D0C6415'', ''clp'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
  (''4A322352-D01B-E811-9671-00155D0C9AF4'', ''timssp'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
  (''5248C65A-A022-E811-9671-00155D0C9AF4'', ''iboa'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''), 
  (''6968C9EF-F6BA-E711-81FC-00155D0C6416'', ''gui'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob'')
) AS SOURCE ([Id],[CustomClient_Id],[CustomUser_Id],[CDate],[UDate],[CBy],[UBy])
ON TARGET.[Id] = SOURCE.[Id]
WHEN MATCHED THEN
UPDATE SET [CustomClient_Id] = Source.[CustomClient_Id],
[CustomUser_Id] = Source.[CustomUser_Id],
[CDate]=Source.[CDate],
[UDate]=Source.[UDate],
[CBy]=Source.[CBy],
[UBy]=Source.[UBy]
WHEN NOT MATCHED BY TARGET THEN
INSERT ([Id],[CustomClient_Id],[CustomUser_Id],[CDate],[UDate],[CBy],[UBy])
VALUES ([Id],[CustomClient_Id],[CustomUser_Id],[CDate],[UDate],[CBy],[UBy]);

delete from [dbo].[AspNetUserClaims] where UserId = @CustomUser_Id

MERGE INTO [dbo].[AspNetUserClaims] AS TARGET
USING(

select
  name [ClaimType]
  ,@CustomUser_Id [UserId]
  ,'''' [ClaimValue]
  ,getdate()  [CDate]
  ,''createFromJob''  [CBy]
  ,getdate()  [UDate]
  ,''createFromJob''  [UBy]
from ClaimTypes where name = ''CanAccessAllData'' 
union 
select 
   ''OwnershipPathsLeaves'' [ClaimType]
  ,@CustomUser_Id [UserId]
  ,''{"S":[],"M":[],"B":[],"PP":[],"P":[]}'' [ClaimValue]
  ,getdate() [CDate]
  ,''createFromJob'' [CBy]
  ,getdate() [UDate]
  ,''createFromJob'' [UBy]
union all
select distinct c.CustomClaimTypeName ClaimType,@CustomUser_Id,'''',getdate(),''createFromJob'',getdate(),''createFromJob''
from ClaimTypesGroups c
join Groups g on g.ID = c.CustomGroupId 
where g.Mnemonic in (''Calamiteiten'',''ApplicationManager'')

) AS SOURCE ([ClaimType],[UserId],[ClaimValue],[CDate],[CBy],[UDate],[UBy])
ON TARGET.[ClaimType] = SOURCE.[ClaimType] AND TARGET.[UserId] = SOURCE.[UserId]
WHEN MATCHED THEN
UPDATE SET 
   [ClaimType] = Source.[ClaimType]
  ,[UserId] = Source.[UserId]
  ,[CDate] = Source.[CDate]
  ,[CBy]= Source.[CBy]
  ,[UDate]=source.[UDate]
  ,[UBy]=source.[UBy]
WHEN NOT MATCHED BY TARGET THEN
INSERT ([ClaimType],[UserId],[ClaimValue],[CDate],[CBy],[UDate],[UBy])
VALUES ([ClaimType],[UserId],[ClaimValue],[CDate],[CBy],[UDate],[UBy]);', 
		@database_name=N'master', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [IPCreateAgent]    Script Date: 22/05/2025 15:39:12 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'IPCreateAgent', 
		@step_id=2, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=3, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'use IdentityProvider

declare @CustomUser_Id varchar(100) = ''09524E2F-3089-4558-941B-9E515773CDE0''
MERGE INTO [dbo].[AspNetUsers] AS TARGET USING(
  select 
   @CustomUser_Id [Id]
  ,''608310A7-E2E6-4EE2-A946-9393D6E25A63''[Origin_Id]
  ,''imfmonitoring@infoprojekt.pl'' [Email]
  ,1 [EmailConfirmed]
  ,''AIHgs9IkZxn1/e2rekHKDZQbiTThPCmzWlc1aplo7nk3ny1REXn6ZD4IR+rtEPWhoA=='' [PasswordHash]
  ,''e4325971-dec6-4692-b00d-ab09111d2941'' [SecurityStamp]
  ,NULL [PhoneNumber]
  ,0 [PhoneNumberConfirmed]
  ,0 [TwoFactorEnabled]
  ,NULL [LockoutEndDateUtc]
  ,1 [LockoutEnabled]
  ,0 [AccessFailedCount]
  ,''Agent'' [UserName]
  ,getdate() [CDate]
  ,''createFromJob'' [CBy]
  ,getdate() [UDate]
  ,NULL [DDate]
  ,NULL [DBy]
) AS SOURCE 
ON TARGET.Id = SOURCE.Id
WHEN MATCHED THEN
UPDATE SET 
   [Origin_Id] = Source.[Origin_Id]
  ,[Email] = Source.[Email]
  ,[EmailConfirmed] = Source.[EmailConfirmed]
  ,[PasswordHash] = Source.[PasswordHash]
  ,[SecurityStamp] = Source.[SecurityStamp]
  ,[PhoneNumber] = Source.[PhoneNumber]
  ,[PhoneNumberConfirmed] = Source.[PhoneNumberConfirmed]
  ,[TwoFactorEnabled] = Source.[TwoFactorEnabled]
  ,[LockoutEndDateUtc] = Source.[LockoutEndDateUtc]
  ,[LockoutEnabled] = Source.[LockoutEnabled]
  ,[AccessFailedCount] = Source.[AccessFailedCount]
  ,[UserName] = Source.[UserName]
  ,[CDate]= Source.[CDate]
  ,[CBy]=Source.[CBy]
  ,[UDate]=Source.[UDate]
  ,[DDate] = Source.[DDate]
  ,[DBy]   = Source.[DBy]
WHEN NOT MATCHED BY TARGET THEN
INSERT ([Id],[Origin_Id],[Email],[EmailConfirmed],[PasswordHash],[SecurityStamp],[PhoneNumber],[PhoneNumberConfirmed],[TwoFactorEnabled],[LockoutEndDateUtc],[LockoutEnabled],[AccessFailedCount],[UserName],[CDate],[CBy],[UDate],[DDate],[DBy])
VALUES ([Id],[Origin_Id],[Email],[EmailConfirmed],[PasswordHash],[SecurityStamp],[PhoneNumber],[PhoneNumberConfirmed],[TwoFactorEnabled],[LockoutEndDateUtc],[LockoutEnabled],[AccessFailedCount],[UserName],[CDate],[CBy],[UDate],[DDate],[DBy]);

DELETE [dbo].[ClientsUsers] where CustomUser_Id = @CustomUser_Id

MERGE INTO [dbo].[ClientsUsers] AS TARGET
USING(VALUES
(''idmgr'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''clp'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''gui'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''PienQualityTool'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''iboa'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''timssp'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''imd'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob'')
) 
AS SOURCE ([CustomClient_Id],[CustomUser_Id],[CDate],[UDate],[CBy],[UBy])
ON TARGET.[CustomClient_Id] = SOURCE.[CustomClient_Id] and TARGET.[CustomUser_Id] = SOURCE.[CustomUser_Id]
WHEN NOT MATCHED BY TARGET THEN
INSERT ([CustomClient_Id], [CustomUser_Id],[CDate],[UDate],[CBy],[UBy])
VALUES ([CustomClient_Id], [CustomUser_Id],[CDate],[UDate],[CBy],[UBy]);

delete from [dbo].[AspNetUserClaims] where UserId = @CustomUser_Id

MERGE INTO [dbo].[AspNetUserClaims] AS TARGET USING (

select
  name [ClaimType]
  ,@CustomUser_Id [UserId]
  ,'''' [ClaimValue]
  ,getdate()  [CDate]
  ,''createFromJob''  [CBy]
  ,getdate()  [UDate]
  ,''createFromJob''  [UBy]
from ClaimTypes where name = ''CanAccessAllData'' 
union 
select 
  ''OwnershipPathsLeaves'' [ClaimType]
  ,@CustomUser_Id [UserId]
  ,''{"S":[],"M":[],"B":[],"PP":[],"P":[]}'' [ClaimValue]
  ,getdate() [CDate]
  ,''createFromJob'' [CBy]
  ,getdate() [UDate]
  ,''createFromJob'' [UBy]
union all
select distinct c.CustomClaimTypeName ClaimType,@CustomUser_Id,'''',getdate(),''createFromJob'',getdate(),''createFromJob''
from ClaimTypesGroups c
join Groups g on g.ID = c.CustomGroupId 
where g.Mnemonic in (''DebtorServiceDeskManager'',''Calamiteiten'',''IMD - Rules Viewer'',''IMD - Rules Administrator'',''SeniorContractSalesRep'',''ContractSalesRep'',''CustomerNotificationsManager'')

) AS SOURCE 
ON TARGET.[ClaimType] = SOURCE.[ClaimType] AND TARGET.[UserId] = SOURCE.[UserId]
WHEN MATCHED THEN
UPDATE SET [ClaimType] = Source.[ClaimType] ,[UserId] = Source.[UserId] ,[CDate] = Source.[CDate] ,[CBy]= Source.[CBy] ,[UDate]=source.[UDate] ,[UBy]=source.[UBy]
WHEN NOT MATCHED BY TARGET THEN
INSERT ([ClaimType],[UserId],[ClaimValue],[CDate],[CBy],[UDate],[UBy])
VALUES ([ClaimType],[UserId],[ClaimValue],[CDate],[CBy],[UDate],[UBy]);

', 
		@database_name=N'master', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [IPCreateAgentApprove]    Script Date: 22/05/2025 15:39:12 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'IPCreateAgentApprove', 
		@step_id=3, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=3, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'use IdentityProvider
declare @CustomUser_Id varchar(100) = ''FD5BEAC6-8A8E-4ADB-BC8C-448335E55E18''
MERGE INTO [dbo].[AspNetUsers] AS TARGET USING(
  select 
   @CustomUser_Id [Id]
  ,''608310A7-E2E6-4EE2-A946-9393D6E25A63''[Origin_Id]
  ,''imfmonitoring@infoprojekt.pl'' [Email]
  ,1 [EmailConfirmed]
  ,''AIHgs9IkZxn1/e2rekHKDZQbiTThPCmzWlc1aplo7nk3ny1REXn6ZD4IR+rtEPWhoA=='' [PasswordHash]
  ,''e4325971-dec6-4692-b00d-ab09111d2941'' [SecurityStamp]
  ,NULL [PhoneNumber]
  ,0 [PhoneNumberConfirmed]
  ,0 [TwoFactorEnabled]
  ,NULL [LockoutEndDateUtc]
  ,1 [LockoutEnabled]
  ,0 [AccessFailedCount]
  ,''AgentApprove'' [UserName]
  ,getdate() [CDate]
  ,''createFromJob'' [CBy]
  ,getdate() [UDate]
  ,NULL [DDate]
  ,NULL [DBy]
) AS SOURCE 
ON TARGET.Id = SOURCE.Id
WHEN MATCHED THEN
UPDATE SET 
   [Origin_Id] = Source.[Origin_Id]
  ,[Email] = Source.[Email]
  ,[EmailConfirmed] = Source.[EmailConfirmed]
  ,[PasswordHash] = Source.[PasswordHash]
  ,[SecurityStamp] = Source.[SecurityStamp]
  ,[PhoneNumber] = Source.[PhoneNumber]
  ,[PhoneNumberConfirmed] = Source.[PhoneNumberConfirmed]
  ,[TwoFactorEnabled] = Source.[TwoFactorEnabled]
  ,[LockoutEndDateUtc] = Source.[LockoutEndDateUtc]
  ,[LockoutEnabled] = Source.[LockoutEnabled]
  ,[AccessFailedCount] = Source.[AccessFailedCount]
  ,[UserName] = Source.[UserName]
  ,[CDate]= Source.[CDate]
  ,[CBy]=Source.[CBy]
  ,[UDate]=Source.[UDate]
  ,[DDate] = Source.[DDate]
  ,[DBy]   = Source.[DBy]
WHEN NOT MATCHED BY TARGET THEN
INSERT ([Id],[Origin_Id],[Email],[EmailConfirmed],[PasswordHash],[SecurityStamp],[PhoneNumber],[PhoneNumberConfirmed],[TwoFactorEnabled],[LockoutEndDateUtc],[LockoutEnabled],[AccessFailedCount],[UserName],[CDate],[CBy],[UDate],[DDate],[DBy])
VALUES ([Id],[Origin_Id],[Email],[EmailConfirmed],[PasswordHash],[SecurityStamp],[PhoneNumber],[PhoneNumberConfirmed],[TwoFactorEnabled],[LockoutEndDateUtc],[LockoutEnabled],[AccessFailedCount],[UserName],[CDate],[CBy],[UDate],[DDate],[DBy]);

DELETE [dbo].[ClientsUsers] where CustomUser_Id = @CustomUser_Id

MERGE INTO [dbo].[ClientsUsers] AS TARGET
USING(VALUES
(''clp'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''gui'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''iboa'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''timssp'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob'')
) 
AS SOURCE ([CustomClient_Id],[CustomUser_Id],[CDate],[UDate],[CBy],[UBy])
ON TARGET.[CustomClient_Id] = SOURCE.[CustomClient_Id] and TARGET.[CustomUser_Id] = SOURCE.[CustomUser_Id]
WHEN NOT MATCHED BY TARGET THEN
INSERT ([CustomClient_Id], [CustomUser_Id],[CDate],[UDate],[CBy],[UBy])
VALUES ([CustomClient_Id], [CustomUser_Id],[CDate],[UDate],[CBy],[UBy]);

delete from [dbo].[AspNetUserClaims] where UserId = @CustomUser_Id

MERGE INTO [dbo].[AspNetUserClaims] AS TARGET USING (

select
  name [ClaimType]
  ,@CustomUser_Id [UserId]
  ,'''' [ClaimValue]
  ,getdate()  [CDate]
  ,''createFromJob''  [CBy]
  ,getdate()  [UDate]
  ,''createFromJob''  [UBy]
from ClaimTypes where name = ''CanAccessAllData'' 
union 
select 
  ''OwnershipPathsLeaves'' [ClaimType]
  ,@CustomUser_Id [UserId]
  ,''{"S":[],"M":[],"B":[],"PP":[],"P":[]}'' [ClaimValue]
  ,getdate() [CDate]
  ,''createFromJob'' [CBy]
  ,getdate() [UDate]
  ,''createFromJob'' [UBy]
union all
select distinct c.CustomClaimTypeName ClaimType,@CustomUser_Id,'''',getdate(),''createFromJob'',getdate(),''createFromJob''
from ClaimTypesGroups c
join Groups g on g.ID = c.CustomGroupId 
where g.Mnemonic in (''CustomerServiceDesk2ndLine'')

) AS SOURCE 
ON TARGET.[ClaimType] = SOURCE.[ClaimType] AND TARGET.[UserId] = SOURCE.[UserId]
WHEN MATCHED THEN
UPDATE SET [ClaimType] = Source.[ClaimType] ,[UserId] = Source.[UserId] ,[CDate] = Source.[CDate] ,[CBy]= Source.[CBy] ,[UDate]=source.[UDate] ,[UBy]=source.[UBy]
WHEN NOT MATCHED BY TARGET THEN
INSERT ([ClaimType],[UserId],[ClaimValue],[CDate],[CBy],[UDate],[UBy])
VALUES ([ClaimType],[UserId],[ClaimValue],[CDate],[CBy],[UDate],[UBy]);

', 
		@database_name=N'master', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [IPCreateProvider]    Script Date: 22/05/2025 15:39:12 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'IPCreateProvider', 
		@step_id=4, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=3, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'use IdentityProvider

declare @CustomUser_Id varchar(100) = ''9924D7A7-0AA9-47B0-9EE7-0614054A0366''

MERGE INTO [dbo].[AspNetUsers] AS TARGET
USING(VALUES
(@CustomUser_Id,''608310A7-E2E6-4EE2-A946-9393D6E25A63'',''ImfMonitoring@infoprojekt.pl'', 1,''AIHgs9IkZxn1/e2rekHKDZQbiTThPCmzWlc1aplo7nk3ny1REXn6ZD4IR+rtEPWhoA=='',''33644647-fe68-481e-bd29-e0b547e97e5d'', NULL, 0,            0,            NULL,    1,            0,                ''Provider'',getdate(),''createFromJob'',getdate(),Null,null)
) AS SOURCE (
   [Id]
  ,[Origin_Id]
  ,[Email]
  ,[EmailConfirmed]
  ,[PasswordHash]
  ,[SecurityStamp]
  ,[PhoneNumber]
  ,[PhoneNumberConfirmed]
  ,[TwoFactorEnabled]
  ,[LockoutEndDateUtc]
  ,[LockoutEnabled]
  ,[AccessFailedCount]
  ,[UserName]
  ,[CDate]
  ,[CBy]
  ,[UDate]
  ,[DDate]
  ,[DBy]
)
ON TARGET.Id = SOURCE.Id
WHEN MATCHED THEN
UPDATE SET [Origin_Id] = Source.[Origin_Id]
  ,[Email] = Source.[Email]
  ,[EmailConfirmed] = Source.[EmailConfirmed]
  ,[PasswordHash] = Source.[PasswordHash]
  ,[SecurityStamp] = Source.[SecurityStamp]
  ,[PhoneNumber] = Source.[PhoneNumber]
  ,[PhoneNumberConfirmed] = Source.[PhoneNumberConfirmed]
  ,[TwoFactorEnabled] = Source.[TwoFactorEnabled]
  ,[LockoutEndDateUtc] = Source.[LockoutEndDateUtc]
  ,[LockoutEnabled] = Source.[LockoutEnabled]
  ,[AccessFailedCount] = Source.[AccessFailedCount]
  ,[UserName] = Source.[UserName]
  ,[CDate]= Source.[CDate]
  ,[CBy]=Source.[CBy]
  ,[UDate]=Source.[UDate]
  ,[DDate] = Source.[DDate]
  ,[DBy]   = Source.[DBy]
WHEN NOT MATCHED BY TARGET THEN
INSERT (
   [Id]
  ,[Origin_Id]
  ,[Email]
  ,[EmailConfirmed]
  ,[PasswordHash]
  ,[SecurityStamp]
  ,[PhoneNumber]
  ,[PhoneNumberConfirmed]
  ,[TwoFactorEnabled]
  ,[LockoutEndDateUtc]
  ,[LockoutEnabled]
  ,[AccessFailedCount]
  ,[UserName]
  ,[CDate]
  ,[CBy]
  ,[UDate]
  ,[DDate]
  ,[DBy]  
)
VALUES (
   [Id]
  ,[Origin_Id]
  ,[Email]
  ,[EmailConfirmed]
  ,[PasswordHash]
  ,[SecurityStamp]
  ,[PhoneNumber]
  ,[PhoneNumberConfirmed]
  ,[TwoFactorEnabled]
  ,[LockoutEndDateUtc]
  ,[LockoutEnabled]
  ,[AccessFailedCount]
  ,[UserName]
  ,[CDate]
  ,[CBy]
  ,[UDate]
  ,[DDate]
  ,[DBy]  
);

DELETE from [dbo].[ClientsUsers] where CustomUser_Id = @CustomUser_Id

MERGE INTO [dbo].[ClientsUsers] AS TARGET
USING(VALUES
(newid(), ''idmgr'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(newid(), ''clp'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(newid(), ''gui'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(newid(), ''Acousoft'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(newid(), ''externapp'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(newid(), ''timssp'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob'')
) AS SOURCE (
  [Id]
  ,[CustomClient_Id]
  ,[CustomUser_Id]
  ,[CDate]
  ,[UDate]
  ,[CBy]
  ,[UBy]
)
ON TARGET.[Id] = SOURCE.[Id]
WHEN MATCHED THEN
UPDATE SET [CustomClient_Id] = Source.[CustomClient_Id],
[CustomUser_Id] = Source.[CustomUser_Id],
[CDate]=Source.[CDate],
[UDate]=Source.[UDate],
[CBy]=Source.[CBy],
[UBy]=Source.[UBy]
WHEN NOT MATCHED BY TARGET THEN
INSERT ([Id], [CustomClient_Id], [CustomUser_Id],[CDate],[UDate],[CBy],[UBy])
VALUES ([Id], [CustomClient_Id], [CustomUser_Id],[CDate],[UDate],[CBy],[UBy]);


DELETE from [dbo].[AspNetUserClaims] where UserId = ''9924D7A7-0AA9-47B0-9EE7-0614054A0366''
select * from [dbo].[AspNetUserClaims] where UserId = ''9924D7A7-0AA9-47B0-9EE7-0614054A0366''
MERGE INTO [dbo].[AspNetUserClaims] AS TARGET
USING(

select ''ServiceBureauNo'',@CustomUser_Id,''["1120001"]'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all 
select ''BusinessAccountNo'',@CustomUser_Id,''["70558","70737","1020222","15190","15196","53571","70610","70468","15413"]'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all 
select ''OwnershipPathsLeaves'',@CustomUser_Id,''{"S":[],"M":[],"B":["1020222","15190","15196","15413","53571","70468","70558","70610","70737"],"PP":[],"P":[]}'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all
select distinct c.CustomClaimTypeName ClaimType,@CustomUser_Id,'''',getdate(),''createFromJob'',getdate(),''createFromJob''
from ClaimTypesGroups c
join Groups g on g.ID = c.CustomGroupId 
where g.Mnemonic like ''inzicht%''

) AS SOURCE (
   [ClaimType]
  ,[UserId]
  ,[ClaimValue]
  ,[CDate]
  ,[CBy]
  ,[UDate]
  ,[UBy])
ON TARGET.[ClaimType] = SOURCE.[ClaimType] AND TARGET.[UserId] = SOURCE.[UserId]
WHEN MATCHED THEN
UPDATE SET [ClaimType] = Source.[ClaimType]
  ,[UserId] = Source.[UserId]
  ,[CDate] = Source.[CDate]
  ,[CBy]= Source.[CBy]
  ,[UDate]=source.[UDate]
  ,[UBy]=source.[UBy]
WHEN NOT MATCHED BY TARGET THEN
INSERT (
  [ClaimType]
  ,[UserId]
  ,[ClaimValue]
  ,[CDate]
  ,[CBy]
  ,[UDate]
  ,[UBy])
VALUES (
  [ClaimType]
  ,[UserId]
  ,[ClaimValue]
  ,[CDate] 
  ,[CBy]
  ,[UDate]
  ,[UBy]);', 
		@database_name=N'master', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [IPCreateCreditAgent]    Script Date: 22/05/2025 15:39:12 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'IPCreateCreditAgent', 
		@step_id=5, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=3, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'use IdentityProvider

declare @CustomUser_Id varchar(100) = ''9FC2E6D5-0F81-403D-BCD3-DFB1B42FEE4C''
delete ClientsUsers where CustomUser_Id = (Select id from [AspNetUsers] where UserName=''CreditAgent'')
delete [AspNetUsers] where UserName=''CreditAgent''

MERGE INTO [dbo].[AspNetUsers] AS TARGET
USING(VALUES
(@CustomUser_Id,''608310A7-E2E6-4EE2-A946-9393D6E25A63'',''imfmonitoring@infoprojekt.pl'', 1,''AIHgs9IkZxn1/e2rekHKDZQbiTThPCmzWlc1aplo7nk3ny1REXn6ZD4IR+rtEPWhoA=='',''c731969f-5826-42b6-be33-184d3d9005db'', NULL, 0,            0,            NULL,    1,            0,                ''CreditAgent'',getdate(),''createFromJob'',getdate(),Null,null)
)AS SOURCE (
   [Id]
  ,[Origin_Id]
  ,[Email]
  ,[EmailConfirmed]
  ,[PasswordHash]
  ,[SecurityStamp]
  ,[PhoneNumber]
  ,[PhoneNumberConfirmed]
  ,[TwoFactorEnabled]
  ,[LockoutEndDateUtc]
  ,[LockoutEnabled]
  ,[AccessFailedCount]
  ,[UserName]
  ,[CDate]
  ,[CBy]
  ,[UDate]
  ,[DDate]
  ,[DBy]
)
ON TARGET.Id = SOURCE.Id
WHEN MATCHED THEN
UPDATE SET 
   [Origin_Id] = Source.[Origin_Id]
  ,[Email] = Source.[Email]
  ,[EmailConfirmed] = Source.[EmailConfirmed]
  ,[PasswordHash] = Source.[PasswordHash]
  ,[SecurityStamp] = Source.[SecurityStamp]
  ,[PhoneNumber] = Source.[PhoneNumber]
  ,[PhoneNumberConfirmed] = Source.[PhoneNumberConfirmed]
  ,[TwoFactorEnabled] = Source.[TwoFactorEnabled]
  ,[LockoutEndDateUtc] = Source.[LockoutEndDateUtc]
  ,[LockoutEnabled] = Source.[LockoutEnabled]
  ,[AccessFailedCount] = Source.[AccessFailedCount]
  ,[UserName] = Source.[UserName]
  ,[CDate]= Source.[CDate]
  ,[CBy]=Source.[CBy]
  ,[UDate]=Source.[UDate]
  ,[DDate] = Source.[DDate]
 ,[DBy]   = Source.[DBy]
WHEN NOT MATCHED BY TARGET THEN
INSERT (
   [Id]
  ,[Origin_Id]
  ,[Email]
  ,[EmailConfirmed]
  ,[PasswordHash]
  ,[SecurityStamp]
  ,[PhoneNumber]
  ,[PhoneNumberConfirmed]
  ,[TwoFactorEnabled]
  ,[LockoutEndDateUtc]
  ,[LockoutEnabled]
  ,[AccessFailedCount]
  ,[UserName]
  ,[CDate]
  ,[CBy]
  ,[UDate]
  ,[DDate]
  ,[DBy]    
)
VALUES (
   [Id]
  ,[Origin_Id]
  ,[Email]
  ,[EmailConfirmed]
  ,[PasswordHash]
  ,[SecurityStamp]
  ,[PhoneNumber]
  ,[PhoneNumberConfirmed]
  ,[TwoFactorEnabled]
  ,[LockoutEndDateUtc]
  ,[LockoutEnabled]
  ,[AccessFailedCount]
  ,[UserName]
  ,[CDate]
  ,[CBy]
  ,[UDate]
  ,[DDate]
  ,[DBy]   
);

DELETE from [dbo].[ClientsUsers] where CustomUser_Id = @CustomUser_Id

MERGE INTO [dbo].[ClientsUsers] AS TARGET
USING(VALUES
(''2FF89593-D549-EB11-9721-00155D0C2F57'', ''CustCreditUI'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob'')
) AS SOURCE ([Id],[CustomClient_Id],[CustomUser_Id],[CDate],[UDate],[CBy],[UBy])
ON TARGET.[Id] = SOURCE.[Id]
WHEN MATCHED THEN
UPDATE SET [CustomClient_Id] = Source.[CustomClient_Id],
[CustomUser_Id] = Source.[CustomUser_Id],
[CDate]=Source.[CDate],
[UDate]=Source.[UDate],
[CBy]=Source.[CBy],
[UBy]=Source.[UBy]
WHEN NOT MATCHED BY TARGET THEN
INSERT ([Id], [CustomClient_Id], [CustomUser_Id],[CDate],[UDate],[CBy],[UBy])
VALUES ([Id], [CustomClient_Id], [CustomUser_Id],[CDate],[UDate],[CBy],[UBy]);

delete from [dbo].[AspNetUserClaims] where UserId = @CustomUser_Id

MERGE INTO [dbo].[AspNetUserClaims] AS TARGET USING (

select
  name [ClaimType]
  ,@CustomUser_Id [UserId]
  ,'''' [ClaimValue]
  ,getdate()  [CDate]
  ,''createFromJob''  [CBy]
  ,getdate()  [UDate]
  ,''createFromJob''  [UBy]
from ClaimTypes where name = ''CanAccessAllData'' 
union 
select 
  ''OwnershipPathsLeaves'' [ClaimType]
  ,@CustomUser_Id [UserId]
  ,''{"S":[],"M":[],"B":[],"PP":[],"P":[]}'' [ClaimValue]
  ,getdate() [CDate]
  ,''createFromJob'' [CBy]
  ,getdate() [UDate]
  ,''createFromJob'' [UBy]
union all
select distinct c.CustomClaimTypeName ClaimType,@CustomUser_Id,'''',getdate(),''createFromJob'',getdate(),''createFromJob''
from ClaimTypesGroups c
join Groups g on g.ID = c.CustomGroupId 
where g.Mnemonic in (''FinanceManager'',''GespreidBetalenEmployee'')

) AS SOURCE 
ON TARGET.[ClaimType] = SOURCE.[ClaimType] AND TARGET.[UserId] = SOURCE.[UserId]
WHEN MATCHED THEN
UPDATE SET [ClaimType] = Source.[ClaimType] ,[UserId] = Source.[UserId] ,[CDate] = Source.[CDate] ,[CBy]= Source.[CBy] ,[UDate]=source.[UDate] ,[UBy]=source.[UBy]
WHEN NOT MATCHED BY TARGET THEN
INSERT ([ClaimType],[UserId],[ClaimValue],[CDate],[CBy],[UDate],[UBy])
VALUES ([ClaimType],[UserId],[ClaimValue],[CDate],[CBy],[UDate],[UBy]);', 
		@database_name=N'master', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Create-Tokens-For-Checks]    Script Date: 22/05/2025 15:39:12 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Create-Tokens-For-Checks', 
		@step_id=6, 
		@cmdexec_success_code=0, 
		@on_success_action=1, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'use IdentityProvider

declare @imdToken_Id varchar(100) = ''7ecf4762-f94b-42a5-a9fc-263b37233f8a''
declare @guiToken_Id varchar(100) = ''5ca1da75-c94f-44df-a82b-a2b1af005e86''
declare @CustCreditUIToken_Id varchar(100) = ''d0d2b458-18d9-46e7-a3f2-0bdc353ebc84''
declare @timsspToken_Id varchar(100) = ''42ac2c99-4b41-4490-b2e0-65aa0b479bab''

delete IdentityProvider.dbo.Tokens
where [Key] in (@imdToken_Id, @guiToken_Id, @CustCreditUIToken_Id, @timsspToken_Id)

declare @dateNow varchar(1000) = convert(varchar(500),getdate(),23)
declare @getGUIAgentClaims varchar(max) = ''''

-- Get the dynamic claims
;with a as (
    select distinct c.CustomClaimTypeName claim
    from ClaimTypesGroups c
    join Groups g on g.ID = c.CustomGroupId
    where g.Mnemonic in (''Calamiteiten'',''IMD - Rules Viewer'',''IMD - Rules Administrator'',''SeniorContractSalesRep'',''ContractSalesRep'',''CustomerNotificationsManager'')
)
select @getGUIAgentClaims += '',{"Type":"''+claim+''","Value":""}'' 
from a

declare @guiTokenJson varchar(max)
set @guiTokenJson = ''{"Audience":"InfomedicsIdentityProviderCert/resources","Issuer":"InfomedicsIdentityProviderCert","CreationTime":"''+ @dateNow+''T00:00:00.0Z","Lifetime":3600000,"Type":"access_token","Client":{"ClientId":"gui"},"Claims":[{"Type":"client_id","Value":"gui"},{"Type":"scope","Value":"gui"},{"Type":"sub","Value":"09524e2f-3089-4558-941b-9e515773cde0"},{"Type":"amr","Value":"password"},{"Type":"auth_time","Value":"1661979564"},{"Type":"idp","Value":"idsrv"},{"Type":"name","Value":"Agent"},{"Type":"user_groups","Value":"[0,1,2,3,4,5,6,7,8,11,12,15,16,17,18,19,20,29,30]"},{"Type":"BusinessGroup","Value":"Agent"}''
    + @getGUIAgentClaims
    + '',{"Type":"OwnershipPathsLeaves","Value":"{\"S\":[],\"M\":[],\"B\":[],\"PP\":[],\"P\":[]}"}],"SubjectId":"09524e2f-3089-4558-941b-9e515773cde0","ClientId":"gui","Scopes":["gui"],"Expires":"2032-09-01T06:59:25.2220915Z"}''


insert IdentityProvider.dbo.Tokens([Key],[TokenType],[SubjectId],[ClientId],[JsonCode],[Expiry],[CDate],[CBy])
select 
  @guiToken_Id [Key]
  ,2 [TokenType]
  ,''09524e2f-3089-4558-941b-9e515773cde0'' [SubjectId]
  ,''gui'' [ClientId]
  ,@guiTokenJson [JsonCode]
  ,dateadd(year,10,getdate()) [Expiry]
  ,getdate() [CDate]
 ,''TestingScript'' [CBy]

insert IdentityProvider.dbo.Tokens([Key],[TokenType],[SubjectId],[ClientId],[JsonCode],[Expiry],[CDate],[CBy])
select 
  @imdToken_Id [Key]
  ,2 [TokenType]
  ,''01524e2f-3089-4558-941b-9e515773cde0'' [SubjectId]
  ,''imd'' [ClientId]
  ,''{"Audience":"InfomedicsIdentityProviderCert/resources","Issuer":"InfomedicsIdentityProviderCert","CreationTime":"''+@dateNow+''T00:00:00.0Z","Lifetime":3600000,"Type":"access_token","Client":{"ClientId":"imd"},"Claims":[{"Type":"client_id","Value":"imd"},{"Type":"scope","Value":"imd"},{"Type":"sub","Value":"09524e2f-3089-4558-941b-9e515773cde0"},{"Type":"amr","Value":"password"},{"Type":"auth_time","Value":"1661978595"},{"Type":"idp","Value":"idsrv"},{"Type":"name","Value":"Agent"},{"Type":"CanManageIMDRules","Value":""},{"Type":"CanViewIMDRules","Value":""}],"SubjectId":"09524e2f-3089-4558-941b-9e515773cde0","ClientId":"imd","Scopes":["imd"],"Expires":"2032-09-01T06:43:15.178176Z"}'' [JsonCode]
  ,dateadd(year,10,getdate()) [Expiry]
  ,getdate() [CDate]
 ,''TestingScript'' [CBy]

insert IdentityProvider.dbo.Tokens([Key],[TokenType],[SubjectId],[ClientId],[JsonCode],[Expiry],[CDate],[CBy])
select 
  @timsspToken_Id [Key]
  ,2 [TokenType]
  ,''9924d7a7-0aa9-47b0-9ee7-0614054a0366'' [SubjectId]
  ,''timssp'' [ClientId]
  ,''{"Audience":"InfomedicsIdentityProviderCert/resources","Issuer":"InfomedicsIdentityProviderCert","CreationTime":"''+@dateNow+''T00:00:00.0Z","Lifetime":3600000,"Type":"access_token","Client":{"ClientId":"timssp"},"Claims":[{"Type":"client_id","Value":"timssp"},{"Type":"scope","Value":"timssp"},{"Type":"sub","Value":"9924d7a7-0aa9-47b0-9ee7-0614054a0366"},{"Type":"amr","Value":"password"},{"Type":"auth_time","Value":"1647698375"},{"Type":"idp","Value":"idsrv"},{"Type":"name","Value":"Provider"},{"Type":"allowed_systems","Value":"[{\"Id\":\"timssp\",\"Priority\":2},{\"Id\":\"clp\",\"Priority\":0},{\"Id\":\"contract\",\"Priority\":0},{\"Id\":\"gui\",\"Priority\":0},{\"Id\":\"idmgr\",\"Priority\":0}]"},{"Type":"AllowedSystems","Value":"[{\"Id\":\"timssp\",\"Priority\":2},{\"Id\":\"clp\",\"Priority\":0},{\"Id\":\"contract\",\"Priority\":0},{\"Id\":\"gui\",\"Priority\":0},{\"Id\":\"idmgr\",\"Priority\":0}]","ValueType":"json"},{"Type":"BusinessGroup","Value":"Agent"},{"Type":"ServiceBureauPartyNo","Value":"[\"1120001\"]"},{"Type":"ServiceBureauNo","Value":"[\"1120001\"]","ValueType":"json"},{"Type":"BusinessAccountPartyNo","Value":"[\"70558\",\"70737\",\"1020222\",\"15190\",\"15196\",\"53571\",\"70610\",\"70468\",\"15413\"]"},{"Type":"BusinessAccountNo","Value":"[\"70558\",\"70737\",\"1020222\",\"15190\",\"15196\",\"53571\",\"70610\",\"70468\",\"15413\"]","ValueType": "json"},{"Type":"OwnershipPathsLeaves","Value":"{\"S\":[],\"M\":[],\"B\":[\"1020222\",\"15190\",\"15196\",\"15413\",\"53571\",\"70468\",\"70558\",\"70610\",\"70737\"],\"PP\":[],\"P\":[]}"},{"Type":"OwnershipPathsLeaves","Value":"{\"S\":[],\"M\":[],\"B\":[\"1020222\",\"15190\",\"15196\",\"15413\",\"53571\",\"70468\",\"70558\",\"70610\",\"70737\"],\"PP\":[],\"P\":[]}","ValueType":"json"},{"Type":"CanApproveTermsAndConditions","Value":""},{"Type":"CanDownloadClaimFiles","Value":""},{"Type":"CanMarkClaims","Value":""},{"Type":"CanMarkPatients","Value":""},{"Type":"CanMarkRetrocessions","Value":""},{"Type":"CanPostponeClaim","Value":""},{"Type":"CanReadAuthUsers","Value":""},{"Type":"CanReadClaimFiles","Value":""},{"Type":"CanReadClaims","Value":""},{"Type":"CanReadClearingRules","Value":""},{"Type":"CanReadCodelists","Value":""},{"Type":"CanReadContracts","Value":""},{"Type":"CanReadDocuments","Value":""},{"Type":"CanReadHolidays","Value":""},{"Type":"CanReadICParties","Value":""},{"Type":"CanReadICResultCodes","Value":""},{"Type":"CanReadLocalDunningDocuments","Value":""},{"Type":"CanReadParties","Value":""},{"Type":"CanReadPartyAnnotations","Value":""},{"Type":"CanReadRetrocessions","Value":""},{"Type":"CanReadSettlements","Value":""},{"Type":"CanReadTermsAndConditions","Value":""},{"Type":"CanReadValidationRules","Value":""},{"Type":"CanResetPassword","Value":""},{"Type":"CanResumeClaims","Value":""},{"Type":"CanReverseRejection","Value":""},{"Type":"CanStopClaims","Value":""},{"Type":"CanUpdateAuthUsers","Value":""},{"Type":"CanUpdateClaimAnnotations","Value":""},{"Type":"CanUpdateClaims","Value":""},{"Type":"CanUpdateClearingRules","Value":""},{"Type":"CanUpdateHolidays","Value":""},{"Type":"CanUpdatePartyAnnotations","Value":""},{"Type":"CanUpdateSettlementAnnotations","Value":""},{"Type":"CanUploadClaimFiles","Value":""},{"Type":"CanUseLedgerConnector","Value":""},{"Type":"CanViewLedgerConnector","Value":""}],"SubjectId":"9924d7a7-0aa9-47b0-9ee7-0614054a0366","ClientId":"timssp","Scopes":["timssp"],"Expires":"2032-03-20T00:00:26.6297348Z"}'' [JsonCode]
  ,dateadd(year,10,getdate()) [Expiry]
  ,getdate() [CDate]
 ,''TestingScript'' [CBy]

insert IdentityProvider.dbo.Tokens([Key],[TokenType],[SubjectId],[ClientId],[JsonCode],[Expiry],[CDate],[CBy])
select 
  @CustCreditUIToken_Id [Key]
  ,2 [TokenType]
  ,''9fc2e6d5-0f81-403d-bcd3-dfb1b42fee4c'' [SubjectId]
  ,''CustCreditUI'' [ClientId]
  ,''{"Audience":"InfomedicsIdentityProviderCert/resources","Issuer":"InfomedicsIdentityProviderCert","CreationTime":"''+@dateNow+''T00:00:00.0Z","Lifetime":3600000,"Type":"access_token","Client":{"ClientId":"CustCreditUI"},"Claims":[{"Type":"client_id","Value":"CustCreditUI"},{"Type":"scope","Value":"CustCreditUI"},{"Type":"sub","Value":"9fc2e6d5-0f81-403d-bcd3-dfb1b42fee4c"},{"Type":"amr","Value":"password"},{"Type":"auth_time","Value":"1647699388"},{"Type":"idp","Value":"idsrv"},{"Type":"name","Value":"CreditAgent"},{"Type":"CanViewPaymentOutgoingFiles","Value":""},{"Type":"CanReadCustomerApplications","Value":""},{"Type":"CanCreatePaymentOutgoingFile","Value":""},{"Type":"CanReadAuthClaims","Value":""},{"Type":"CanReadPayments","Value":""},{"Type":"OwnershipPathsLeaves","Value":"{\"S\":[],\"M\":[],\"B\":[],\"PP\":[],\"P\":[]}"},{"Type":"OwnershipPathsLeaves","Value":"{\"S\":[],\"M\":[],\"B\":[],\"PP\":[],\"P\":[]}","ValueType":"json"},{"Type":"CanReadDocuments","Value":""},{"Type":"CanApproveRejectCreditApplication","Value":""},{"Type":"CanMatchPayments","Value":""},{"Type":"CanChangeMatchableItemStatus","Value":""},{"Type":"CanUpdatePaymentAnnotations","Value":""},{"Type":"CanSentCreditPayment","Value":""},{"Type":"CanReviewCustomerApplications","Value":""},{"Type":"CanUpdatePaymentAnnotationContent","Value":""},{"Type":"CanAssignPayments","Value":""},{"Type":"CanReadAuthUsers","Value":""},{"Type":"CanReadLocalDunningDocuments","Value":""},{"Type":"CanUpdatePayment","Value":""},{"Type":"CanUpdatePaymentAnnotationTags","Value":""}],"SubjectId":"9fc2e6d5-0f81-403d-bcd3-dfb1b42fee4c","ClientId":"CustCreditUI","Scopes":["CustCreditUI"],"Expires":"2033-03-20T00:16:28.4075959Z"}'' [JsonCode]
  ,dateadd(year,10,getdate()) [Expiry]
  ,getdate() [CDate]
 ,''TestingScript'' [CBy]


SET QUOTED_IDENTIFIER ON
if not exists(select * from TIM_Mediation.dbo.BlobRawFilesStore where [ID] = convert(uniqueidentifier,''00000000-0000-0000-0000-111111111111''))
begin 
  update TIM_Mediation.dbo.BlobRawFilesStore set ID = convert(uniqueidentifier,''00000000-0000-0000-0000-111111111111'') 
  where [ID] = (select [ID] from TIM_Mediation.dbo.blobrawfiles where IdPrimaryKey = (select min(IdPrimaryKey) from TIM_Mediation.dbo.blobrawfiles))
end

if not exists(select * from [TIM_Mediation].[dbo].[blobrawfiles] where [ID] = convert(uniqueidentifier,''00000000-0000-0000-0000-111111111111''))
begin 
  update [TIM_Mediation].[dbo].[blobrawfiles] set [ID] = convert(uniqueidentifier,''00000000-0000-0000-0000-111111111111'') 
  where [IdPrimaryKey] = (select min([IdPrimaryKey]) from [TIM_Mediation].[dbo].[blobrawfiles])
end
', 
		@database_name=N'master', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
EXEC @ReturnCode = msdb.dbo.sp_update_job @job_id = @jobId, @start_step_id = 1
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
EXEC @ReturnCode = msdb.dbo.sp_add_jobschedule @job_id=@jobId, @name=N'StandardSchedule', 
		@enabled=1, 
		@freq_type=4, 
		@freq_interval=1, 
		@freq_subday_type=1, 
		@freq_subday_interval=0, 
		@freq_relative_interval=0, 
		@freq_recurrence_factor=0, 
		@active_start_date=20180301, 
		@active_end_date=99991231, 
		@active_start_time=50000, 
		@active_end_time=235959, 
		@schedule_uid=N'3e4b0d5a-efcd-4e27-acd9-fa8dc74dcd0a'
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
EXEC @ReturnCode = msdb.dbo.sp_add_jobserver @job_id = @jobId, @server_name = N'(local)'
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
COMMIT TRANSACTION
GOTO EndSave
QuitWithRollback:
    IF (@@TRANCOUNT > 0) ROLLBACK TRANSACTION
EndSave:
GO

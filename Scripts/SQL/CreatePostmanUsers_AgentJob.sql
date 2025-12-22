USE [msdb]
GO

/****** Object:  Job [CreatePostmanUsers]    Script Date: 21.05.2025 16:10:46 ******/
BEGIN TRANSACTION
DECLARE @ReturnCode INT
SELECT @ReturnCode = 0
/****** Object:  JobCategory [[Uncategorized (Local)]]    Script Date: 21.05.2025 16:10:46 ******/
IF NOT EXISTS (SELECT name FROM msdb.dbo.syscategories WHERE name=N'[Uncategorized (Local)]' AND category_class=1)
BEGIN
EXEC @ReturnCode = msdb.dbo.sp_add_category @class=N'JOB', @type=N'LOCAL', @name=N'[Uncategorized (Local)]'
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback

END

DECLARE @jobId BINARY(16)
EXEC @ReturnCode =  msdb.dbo.sp_add_job @job_name=N'CreatePostmanUsers', 
		@enabled=1, 
		@notify_level_eventlog=0, 
		@notify_level_email=0, 
		@notify_level_netsend=0, 
		@notify_level_page=0, 
		@delete_level=0, 
		@description=N'No description available.', 
		@category_name=N'[Uncategorized (Local)]', 
		@owner_login_name=N'sa', @job_id = @jobId OUTPUT
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [IPCreateProvider1633835_MBA]    Script Date: 21.05.2025 16:10:47 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'IPCreateProvider1633835_MBA', 
		@step_id=1, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'use IdentityProvider

declare @CustomUser_Id varchar(100) = ''CE362602-6B65-471B-B9FD-82246188260D''

IF EXISTS (SELECT 1 FROM IdentityProvider.dbo.AspNetUsers WHERE Id = @CustomUser_Id)
BEGIN
PRINT ''Record exists, proceeding to next step''
END
ELSE
BEGIN
MERGE INTO [dbo].[AspNetUsers] AS TARGET
USING(VALUES
(@CustomUser_Id,''608310A7-E2E6-4EE2-A946-9393D6E25A63'',''ImfMonitoring@infoprojekt.pl'', 1,''AIHgs9IkZxn1/e2rekHKDZQbiTThPCmzWlc1aplo7nk3ny1REXn6ZD4IR+rtEPWhoA=='',''33644647-fe68-481e-bd29-e0b547e97e5d'', NULL, 0,            0,            NULL,    1,            0,                ''Provider1633835MBA'',getdate(),''createFromJob'',getdate(),Null,null)
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
(''6B68C9EF-F6BA-E711-81FC-00155D0C6413'', ''idmgr'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''6668C9EF-F6BA-E711-81FC-00155D0C6413'', ''clp'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''6968C9EF-F6BA-E711-81FC-00155D0C6413'', ''gui'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''6C68C9EF-F6BA-E711-81FC-00155D0C6413'', ''timssp'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob'')
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


DELETE from [dbo].[AspNetUserClaims] where UserId = ''CE362602-6B65-471B-B9FD-82246188260D''
select * from [dbo].[AspNetUserClaims] where UserId = ''CE362602-6B65-471B-B9FD-82246188260D''
MERGE INTO [dbo].[AspNetUserClaims] AS TARGET
USING(

select ''ServiceBureauNo'',@CustomUser_Id,''["1120001"]'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all 
select ''MainBusinessAccountNo'',@CustomUser_Id,''["1633835"]'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all 
select ''OwnershipPathsLeaves'',@CustomUser_Id,''{"S":[],"M":["1633835"],"B":[],"PP":[],"P":[]}'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all
select distinct c.CustomClaimTypeName ClaimType,@CustomUser_Id,'''',getdate(),''createFromJob'',getdate(),''createFromJob''
from ClaimTypesGroups c
join Groups g on g.ID = c.CustomGroupId 
where g.Mnemonic = ''InZicht2_BusinessOwner''

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
  ,[UBy]);
 END
 ', 
		@database_name=N'IdentityProvider', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Provider1536505P]    Script Date: 21.05.2025 16:10:47 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Provider1536505P', 
		@step_id=2, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'use IdentityProvider
--select newid()
declare @CustomUser_Id varchar(100) = ''32630145-A7F6-407B-977C-7B40B36DEAD3''

IF EXISTS (SELECT 1 FROM IdentityProvider.dbo.AspNetUsers WHERE Id = @CustomUser_Id)
BEGIN
PRINT ''Record exists, proceeding to next step''
END
ELSE
BEGIN
MERGE INTO [dbo].[AspNetUsers] AS TARGET
USING(VALUES
(@CustomUser_Id,''608310A7-E2E6-4EE2-A946-9393D6E25A63'',''ImfMonitoring@infoprojekt.pl'', 1,''AIHgs9IkZxn1/e2rekHKDZQbiTThPCmzWlc1aplo7nk3ny1REXn6ZD4IR+rtEPWhoA=='',''33644647-fe68-481e-bd29-e0b547e97e5d'', NULL, 0,            0,            NULL,    1,            0,                ''Provider1536505P'',getdate(),''createFromJob'',getdate(),Null,null)
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
(''6B68C9EF-F6BA-E711-81FC-00155D0C6413'', ''idmgr'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''6668C9EF-F6BA-E711-81FC-00155D0C6413'', ''clp'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''6968C9EF-F6BA-E711-81FC-00155D0C6413'', ''gui'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''6C68C9EF-F6BA-E711-81FC-00155D0C6413'', ''timssp'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob'')
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


DELETE from [dbo].[AspNetUserClaims] where UserId = ''32630145-A7F6-407B-977C-7B40B36DEAD3''
select * from [dbo].[AspNetUserClaims] where UserId = ''32630145-A7F6-407B-977C-7B40B36DEAD3''
MERGE INTO [dbo].[AspNetUserClaims] AS TARGET
USING(

select ''ServiceBureauNo'',@CustomUser_Id,''["1120001"]'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all 
select ''MainBusinessAccountNo'',@CustomUser_Id,''["1236506"]'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all 
select ''BusinessAccountNo'',@CustomUser_Id,''["1836504"]'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all 
select ''ProviderNo'',@CustomUser_Id,''["1439233"]'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all 
select ''PractitionerNo'',@CustomUser_Id,''["1536505"]'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all 
select ''OwnershipPathsLeaves'',@CustomUser_Id,''{"S":[],"M":[],"B":[],"PP":[],"P":["1536505"]}'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all
select distinct c.CustomClaimTypeName ClaimType,@CustomUser_Id,'''',getdate(),''createFromJob'',getdate(),''createFromJob''
from ClaimTypesGroups c
join Groups g on g.ID = c.CustomGroupId 
where g.Mnemonic = ''InZicht2_BusinessOwner''

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
  ,[UBy]);

END', 
		@database_name=N'IdentityProvider', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Provider1439233PP]    Script Date: 21.05.2025 16:10:47 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Provider1439233PP', 
		@step_id=3, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'use IdentityProvider
--select newid()
declare @CustomUser_Id varchar(100) = ''92E8E392-F5B1-44FC-AEAE-20A51745AF12''

IF EXISTS (SELECT 1 FROM IdentityProvider.dbo.AspNetUsers WHERE Id = @CustomUser_Id)
BEGIN
PRINT ''Record exists, proceeding to next step''
END
ELSE
BEGIN
MERGE INTO [dbo].[AspNetUsers] AS TARGET
USING(VALUES
(@CustomUser_Id,''608310A7-E2E6-4EE2-A946-9393D6E25A63'',''ImfMonitoring@infoprojekt.pl'', 1,''AIHgs9IkZxn1/e2rekHKDZQbiTThPCmzWlc1aplo7nk3ny1REXn6ZD4IR+rtEPWhoA=='',''33644647-fe68-481e-bd29-e0b547e97e5d'', NULL, 0,            0,            NULL,    1,            0,                ''Provider1439233PP'',getdate(),''createFromJob'',getdate(),Null,null)
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
(''6B68C9EF-F6BA-E711-81FC-00155D0C6413'', ''idmgr'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''6668C9EF-F6BA-E711-81FC-00155D0C6413'', ''clp'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''6968C9EF-F6BA-E711-81FC-00155D0C6413'', ''gui'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''6C68C9EF-F6BA-E711-81FC-00155D0C6413'', ''timssp'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob'')
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


DELETE from [dbo].[AspNetUserClaims] where UserId = ''92E8E392-F5B1-44FC-AEAE-20A51745AF12''
select * from [dbo].[AspNetUserClaims] where UserId = ''92E8E392-F5B1-44FC-AEAE-20A51745AF12''
MERGE INTO [dbo].[AspNetUserClaims] AS TARGET
USING(

select ''ServiceBureauNo'',@CustomUser_Id,''["1120001"]'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all 
select ''MainBusinessAccountNo'',@CustomUser_Id,''["1236506"]'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all 
select ''BusinessAccountNo'',@CustomUser_Id,''["1836504"]'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all 
select ''ProviderNo'',@CustomUser_Id,''["1439233"]'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all 
select ''OwnershipPathsLeaves'',@CustomUser_Id,''{"S":[],"M":[],"B":[],"PP":["1439233"],"P":[]}'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all
select distinct c.CustomClaimTypeName ClaimType,@CustomUser_Id,'''',getdate(),''createFromJob'',getdate(),''createFromJob''
from ClaimTypesGroups c
join Groups g on g.ID = c.CustomGroupId 
where g.Mnemonic = ''InZicht2_BusinessOwner''

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
  ,[UBy]);

END', 
		@database_name=N'IdentityProvider', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Provider1236506MBA]    Script Date: 21.05.2025 16:10:47 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Provider1236506MBA', 
		@step_id=4, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'use IdentityProvider
--select newid()
declare @CustomUser_Id varchar(100) = ''7FB17934-321A-43A5-BB36-32BE740029F1''

IF EXISTS (SELECT 1 FROM IdentityProvider.dbo.AspNetUsers WHERE Id = @CustomUser_Id)
BEGIN
PRINT ''Record exists, proceeding to next step''
END
ELSE
BEGIN

MERGE INTO [dbo].[AspNetUsers] AS TARGET
USING(VALUES
(@CustomUser_Id,''608310A7-E2E6-4EE2-A946-9393D6E25A63'',''ImfMonitoring@infoprojekt.pl'', 1,''AIHgs9IkZxn1/e2rekHKDZQbiTThPCmzWlc1aplo7nk3ny1REXn6ZD4IR+rtEPWhoA=='',''33644647-fe68-481e-bd29-e0b547e97e5d'', NULL, 0,            0,            NULL,    1,            0,                ''Provider1236506MBA'',getdate(),''createFromJob'',getdate(),Null,null)
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
(''6B68C9EF-F6BA-E711-81FC-00155D0C6413'', ''idmgr'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''6668C9EF-F6BA-E711-81FC-00155D0C6413'', ''clp'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''6968C9EF-F6BA-E711-81FC-00155D0C6413'', ''gui'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''6C68C9EF-F6BA-E711-81FC-00155D0C6413'', ''timssp'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob'')
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


DELETE from [dbo].[AspNetUserClaims] where UserId = ''7FB17934-321A-43A5-BB36-32BE740029F1''
select * from [dbo].[AspNetUserClaims] where UserId = ''7FB17934-321A-43A5-BB36-32BE740029F1''
MERGE INTO [dbo].[AspNetUserClaims] AS TARGET
USING(

select ''ServiceBureauNo'',@CustomUser_Id,''["1120001"]'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all 
select ''MainBusinessAccountNo'',@CustomUser_Id,''["1236506"]'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all 
select ''OwnershipPathsLeaves'',@CustomUser_Id,''{"S":[],"M":["1236506"],"B":[],"PP":[],"P":[]}'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all
select distinct c.CustomClaimTypeName ClaimType,@CustomUser_Id,'''',getdate(),''createFromJob'',getdate(),''createFromJob''
from ClaimTypesGroups c
join Groups g on g.ID = c.CustomGroupId 
where g.Mnemonic = ''InZicht2_BusinessOwner''

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
  ,[UBy]);
 END', 
		@database_name=N'IdentityProvider', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [Provider1836504BA]    Script Date: 21.05.2025 16:10:47 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'Provider1836504BA', 
		@step_id=5, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'use IdentityProvider
--select newid()
declare @CustomUser_Id varchar(100) = ''79742EEB-C5B7-4046-BB99-5418B223E47A''

IF EXISTS (SELECT 1 FROM IdentityProvider.dbo.AspNetUsers WHERE Id = @CustomUser_Id)
BEGIN
PRINT ''Record exists, proceeding to next step''
END
ELSE
BEGIN
MERGE INTO [dbo].[AspNetUsers] AS TARGET
USING(VALUES
(@CustomUser_Id,''608310A7-E2E6-4EE2-A946-9393D6E25A63'',''ImfMonitoring@infoprojekt.pl'', 1,''AIHgs9IkZxn1/e2rekHKDZQbiTThPCmzWlc1aplo7nk3ny1REXn6ZD4IR+rtEPWhoA=='',''33644647-fe68-481e-bd29-e0b547e97e5d'', NULL, 0,            0,            NULL,    1,            0,                ''BA1836504'',getdate(),''createFromJob'',getdate(),Null,null)
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
(''6B68C9EF-F6BA-E711-81FC-00155D0C6413'', ''idmgr'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''6668C9EF-F6BA-E711-81FC-00155D0C6413'', ''clp'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''6968C9EF-F6BA-E711-81FC-00155D0C6413'', ''gui'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''6C68C9EF-F6BA-E711-81FC-00155D0C6413'', ''timssp'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob'')
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


DELETE from [dbo].[AspNetUserClaims] where UserId = ''79742EEB-C5B7-4046-BB99-5418B223E47A''
select * from [dbo].[AspNetUserClaims] where UserId = ''79742EEB-C5B7-4046-BB99-5418B223E47A''
MERGE INTO [dbo].[AspNetUserClaims] AS TARGET
USING(

select ''ServiceBureauNo'',@CustomUser_Id,''["1120001"]'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all 
select ''MainBusinessAccountNo'',@CustomUser_Id,''["1236506"]'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all 
select ''BusinessAccountNo'',@CustomUser_Id,''["1836504"]'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all 
select ''OwnershipPathsLeaves'',@CustomUser_Id,''{"S":[],"M":[],"B":["1836504"],"PP":[],"P":[]}'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all
select distinct c.CustomClaimTypeName ClaimType,@CustomUser_Id,'''',getdate(),''createFromJob'',getdate(),''createFromJob''
from ClaimTypesGroups c
join Groups g on g.ID = c.CustomGroupId 
where g.Mnemonic = ''InZicht2_BusinessOwner''

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
  ,[UBy]);

 END', 
		@database_name=N'IdentityProvider', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [IPCreateProvider70558_BA]    Script Date: 21.05.2025 16:10:47 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'IPCreateProvider70558_BA', 
		@step_id=6, 
		@cmdexec_success_code=0, 
		@on_success_action=3, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'use IdentityProvider

declare @CustomUser_Id varchar(100) = ''B899FD6B-EE0E-48D5-94F7-813101CC8C46''

IF EXISTS (SELECT 1 FROM IdentityProvider.dbo.AspNetUsers WHERE Id = @CustomUser_Id)
BEGIN
PRINT ''Record exists, proceeding to next step''
END
ELSE
BEGIN
MERGE INTO [dbo].[AspNetUsers] AS TARGET
USING(VALUES
(@CustomUser_Id,''608310A7-E2E6-4EE2-A946-9393D6E25A63'',''ImfMonitoring@infoprojekt.pl'', 1,''AIHgs9IkZxn1/e2rekHKDZQbiTThPCmzWlc1aplo7nk3ny1REXn6ZD4IR+rtEPWhoA=='',''33644647-fe68-481e-bd29-e0b547e97e5d'', NULL, 0,            0,            NULL,    1,            0,                ''Provider70558BA'',getdate(),''createFromJob'',getdate(),Null,null)
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
(''6B68C9EF-F6BA-E711-81FC-00155D0C6413'', ''idmgr'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''6668C9EF-F6BA-E711-81FC-00155D0C6413'', ''clp'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''6968C9EF-F6BA-E711-81FC-00155D0C6413'', ''gui'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob''),
(''6C68C9EF-F6BA-E711-81FC-00155D0C6413'', ''timssp'', @CustomUser_Id,getdate(),getdate(),''createFromJob'',''createFromJob'')
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


DELETE from [dbo].[AspNetUserClaims] where UserId = ''B899FD6B-EE0E-48D5-94F7-813101CC8C46''
select * from [dbo].[AspNetUserClaims] where UserId = ''B899FD6B-EE0E-48D5-94F7-813101CC8C46''
MERGE INTO [dbo].[AspNetUserClaims] AS TARGET
USING(

select ''ServiceBureauNo'',@CustomUser_Id,''["1120001"]'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all 
select ''BusinessAccountNo'',@CustomUser_Id,''["70558"]'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all 
select ''OwnershipPathsLeaves'',@CustomUser_Id,''{"S":[],"M":[],"B":["70558"],"PP":[],"P":[]}'',getdate(),''createFromJob'',getdate(),''createFromJob''
union all
select distinct c.CustomClaimTypeName ClaimType,@CustomUser_Id,'''',getdate(),''createFromJob'',getdate(),''createFromJob''
from ClaimTypesGroups c
join Groups g on g.ID = c.CustomGroupId 
where g.Mnemonic = ''InZicht2_BusinessOwner''

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
  ,[UBy]);

 END', 
		@database_name=N'IdentityProvider', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
/****** Object:  Step [CreateTokens]    Script Date: 21.05.2025 16:10:47 ******/
EXEC @ReturnCode = msdb.dbo.sp_add_jobstep @job_id=@jobId, @step_name=N'CreateTokens', 
		@step_id=7, 
		@cmdexec_success_code=0, 
		@on_success_action=1, 
		@on_success_step_id=0, 
		@on_fail_action=2, 
		@on_fail_step_id=0, 
		@retry_attempts=0, 
		@retry_interval=0, 
		@os_run_priority=0, @subsystem=N'TSQL', 
		@command=N'SET QUOTED_IDENTIFIER ON;
DECLARE @AgentUserId NVARCHAR(MAX) = (SELECT TOP 1 Id FROM IdentityProvider..AspNetUsers Where UserName = ''Agent'');
DECLARE @BaUserId NVARCHAR(MAX) = (SELECT TOP 1 Id FROM IdentityProvider..AspNetUsers WHERE UserName = ''BA1836504'');
DECLARE @MbaUserId NVARCHAR(MAX) = (SELECT TOP 1 Id FROM IdentityProvider..AspNetUsers WHERE UserName = ''Provider1236506MBA'');
DECLARE @ProviderUserId NVARCHAR(MAX) = (SELECT TOP 1 Id FROM IdentityProvider..AspNetUsers WHERE UserName = ''Provider1439233PP'');
DECLARE @PracticionerUserId NVARCHAR(MAX) = (SELECT TOP 1 Id FROM IdentityProvider..AspNetUsers WHERE UserName = ''Provider1536505P'');
DECLARE @Mba2UserId NVARCHAR(MAX) = (SELECT TOP 1 Id FROM IdentityProvider..AspNetUsers WHERE UserName = ''Provider70558BA'')
DECLARE @EnvironmentNumber VARCHAR(2) = SUBSTRING(@@SERVERNAME, 7, 2)
DECLARE @EnvironmentUrl NVARCHAR(MAX) = CONCAT(''https://'',@EnvironmentNumber,''-inloggen.imfint.local'');

-- insert access token for test purpuses for BA_USER in TIM, with value: 406B6D0E70EB5FB674224CD1EE05B482E73E7BC7D820B56FEE425E7E868463F0-1__IIP2
BEGIN
	DELETE FROM IdentityProvider..PersistedGrants WHERE [Key] = ''NeRkuJpT5ZScOWarH0xD3Y2XlhDElEqHi2b9ayZwLSE=''
	DECLARE @BaUserPayload NVARCHAR(MAX) = CONCAT(''{"PersistentGrantDataContainerVersion":1,"DataProtected":false,"Payload":"{\u0022AllowedSigningAlgorithms\u0022:[],\u0022Audiences\u0022:[\u0022claim\u0022,\u0022catalog\u0022,\u0022gui\u0022,\u0022rnn\u0022,\u0022mediation\u0022,\u0022clearing\u0022,\u0022bnm\u0022,\u0022imd_input\u0022,\u0022helpdesk\u0022,\u0022WebApiClaim\u0022,\u0022enricher\u0022,\u0022invoice\u0022,\u0022ledger_connector\u0022,\u0022idmgr\u0022,\u0022imd_responses\u0022,\u0022validation\u0022,\u0022'', @EnvironmentUrl, ''/resources\u0022],\u0022Issuer\u0022:\u0022'', @EnvironmentUrl, ''\u0022,\u0022CreationTime\u0022:\u00222025-02-03T13:20:46.2557617Z\u0022,\u0022Lifetime\u0022:315569260,\u0022Type\u0022:\u0022access_token\u0022,\u0022ClientId\u0022:\u0022gui\u0022,\u0022AccessTokenType\u0022:1,\u0022IncludeJwtId\u0022:true,\u0022Claims\u0022:[{\u0022Type\u0022:\u0022client_id\u0022,\u0022Value\u0022:\u0022gui\u0022},{\u0022Type\u0022:\u0022scope\u0022,\u0022Value\u0022:\u0022gui\u0022},{\u0022Type\u0022:\u0022scope\u0022,\u0022Value\u0022:\u0022openid\u0022},{\u0022Type\u0022:\u0022scope\u0022,\u0022Value\u0022:\u0022offline_access\u0022},{\u0022Type\u0022:\u0022sub\u0022,\u0022Value\u0022:\u0022'', @BaUserId, ''\u0022},{\u0022Type\u0022:\u0022auth_time\u0022,\u0022Value\u0022:\u00221738588845\u0022,\u0022ValueType\u0022:\u0022http://www.w3.org/2001/XMLSchema#integer64\u0022},{\u0022Type\u0022:\u0022idp\u0022,\u0022Value\u0022:\u0022local\u0022},{\u0022Type\u0022:\u0022amr\u0022,\u0022Value\u0022:\u0022pwd\u0022},{\u0022Type\u0022:\u0022ServiceBureauPartyNo\u0022,\u0022Value\u0022:\u0022[\\u00221120001\\u0022]\u0022},{\u0022Type\u0022:\u0022ServiceBureauNo\u0022,\u0022Value\u0022:\u0022[\\u00221120001\\u0022]\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022MainBusinessAccountPartyNo\u0022,\u0022Value\u0022:\u0022[\\u00221236506\\u0022]\u0022},{\u0022Type\u0022:\u0022MainBusinessAccountNo\u0022,\u0022Value\u0022:\u0022[\\u00221236506\\u0022]\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022BusinessAccountPartyNo\u0022,\u0022Value\u0022:\u0022[\\u00221836504\\u0022]\u0022},{\u0022Type\u0022:\u0022BusinessAccountNo\u0022,\u0022Value\u0022:\u0022[\\u00221836504\\u0022]\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022UserOwnershipPathsLeaves\u0022,\u0022Value\u0022:\u0022{\\u0022S\\u0022:[],\\u0022M\\u0022:[],\\u0022B\\u0022:[\\u00221836504\\u0022],\\u0022PP\\u0022:[],\\u0022P\\u0022:[]}\u0022},{\u0022Type\u0022:\u0022OwnershipPathsLeaves\u0022,\u0022Value\u0022:\u0022{\\u0022S\\u0022:[],\\u0022M\\u0022:[],\\u0022B\\u0022:[\\u00221836504\\u0022],\\u0022PP\\u0022:[],\\u0022P\\u0022:[]}\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022CanApproveTermsAndConditions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanPostponeClaim\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadAuthUsers\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadClearingRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadContracts\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadCustomerNotifications\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadDocuments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadHolidays\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadICResultCodes\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadLocalDunningDocuments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadPartyAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadRetrocessions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadSettlements\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadTermsAndConditions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadValidationRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanResumeClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReverseRejection\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanStopClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClaimAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClearingRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateHolidays\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePartyAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateSettlementAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUploadClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanAcceptRejectClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanApproveChanges\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanBlockAcceptingClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanCancelDigitalDunning\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanDownloadClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanExtendClaimDueDate\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadAllGroups\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadAnnotationTemplates\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadICParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadIRIA\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadPayments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadRulesInterpretation\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanRedeliverClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanResumeBailiffs\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanResurrectClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanStopBailiffs\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanStopClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateAddressesWithoutLimitations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClaimFileAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateContracts\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePA\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateParticipants\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateTermsAndConditions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUploadDocuments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022name\u0022,\u0022Value\u0022:\u0022BA1836504\u0022},{\u0022Type\u0022:\u0022user_groups\u0022,\u0022Value\u0022:\u0022[]\u0022},{\u0022Type\u0022:\u0022UserGroups\u0022,\u0022Value\u0022:\u0022[]\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022BusinessGroup\u0022,\u0022Value\u0022:\u0022Agent\u0022},{\u0022Type\u0022:\u0022sid\u0022,\u0022Value\u0022:\u0022569ED7949CE37E613B9595393EB81117\u0022},{\u0022Type\u0022:\u0022jti\u0022,\u0022Value\u0022:\u00226AFDE8F2B5383FBF3DED3E5B841F7A66\u0022}],\u0022Version\u0022:5,\u0022Scopes\u0022:[\u0022gui\u0022,\u0022openid\u0022,\u0022offline_access\u0022]}"}'');
	INSERT INTO IdentityProvider..PersistedGrants ([Key], [Type], [SubjectId], [SessionId], [ClientId], [Description], [CreationTime], [Expiration], [ConsumedTime], [Data], [CDate], CBy, UDate, UBy)
	VALUES (''NeRkuJpT5ZScOWarH0xD3Y2XlhDElEqHi2b9ayZwLSE='',	''reference_token'',	@BaUserId,	''63DFEF050C79BF6DBCA88CAE1B6CA0B7'',	''gui'',	NULL,	''2025-02-03 13:45:52.277'',	''2035-02-03 23:53:32.277'',	NULL, @BaUserPayload	, GETDATE(),	''createFromJob'',	GETDATE(),	''createFromJob'')
END

-- insert access token for test purpuses for MBA_USER(postman)/Provider1236506MBA in TIM, with value: 7F322EA73BC72573A6ABD1BCBA2237E0148989E18768772B683E4D482E8DD5DF-1__IIP2
BEGIN
	DELETE FROM IdentityProvider..PersistedGrants WHERE [Key] = ''DbvtAujX2miE6ZE211yyjaIFxynODli364A054kkJMA=''
	DECLARE @MbaUserPayload NVARCHAR(MAX) = CONCAT(''{"PersistentGrantDataContainerVersion":1,"DataProtected":false,"Payload":"{\u0022AllowedSigningAlgorithms\u0022:[],\u0022Audiences\u0022:[\u0022claim\u0022,\u0022catalog\u0022,\u0022gui\u0022,\u0022rnn\u0022,\u0022mediation\u0022,\u0022clearing\u0022,\u0022bnm\u0022,\u0022imd_input\u0022,\u0022helpdesk\u0022,\u0022WebApiClaim\u0022,\u0022enricher\u0022,\u0022invoice\u0022,\u0022ledger_connector\u0022,\u0022idmgr\u0022,\u0022imd_responses\u0022,\u0022validation\u0022,\u0022'',@EnvironmentUrl,''/resources\u0022],\u0022Issuer\u0022:\u0022'', @EnvironmentUrl ,''\u0022,\u0022CreationTime\u0022:\u00222025-02-05T10:15:06.2410328Z\u0022,\u0022Lifetime\u0022:315569260,\u0022Type\u0022:\u0022access_token\u0022,\u0022ClientId\u0022:\u0022gui\u0022,\u0022AccessTokenType\u0022:1,\u0022IncludeJwtId\u0022:true,\u0022Claims\u0022:[{\u0022Type\u0022:\u0022client_id\u0022,\u0022Value\u0022:\u0022gui\u0022},{\u0022Type\u0022:\u0022scope\u0022,\u0022Value\u0022:\u0022gui\u0022},{\u0022Type\u0022:\u0022scope\u0022,\u0022Value\u0022:\u0022profile\u0022},{\u0022Type\u0022:\u0022scope\u0022,\u0022Value\u0022:\u0022openid\u0022},{\u0022Type\u0022:\u0022scope\u0022,\u0022Value\u0022:\u0022offline_access\u0022},{\u0022Type\u0022:\u0022sub\u0022,\u0022Value\u0022:\u0022'', @MbaUserId,''\u0022},{\u0022Type\u0022:\u0022auth_time\u0022,\u0022Value\u0022:\u00221738750403\u0022,\u0022ValueType\u0022:\u0022http://www.w3.org/2001/XMLSchema#integer64\u0022},{\u0022Type\u0022:\u0022idp\u0022,\u0022Value\u0022:\u0022local\u0022},{\u0022Type\u0022:\u0022amr\u0022,\u0022Value\u0022:\u0022pwd\u0022},{\u0022Type\u0022:\u0022ServiceBureauPartyNo\u0022,\u0022Value\u0022:\u0022[\\u00221120001\\u0022]\u0022},{\u0022Type\u0022:\u0022ServiceBureauNo\u0022,\u0022Value\u0022:\u0022[\\u00221120001\\u0022]\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022MainBusinessAccountPartyNo\u0022,\u0022Value\u0022:\u0022[\\u00221236506\\u0022]\u0022},{\u0022Type\u0022:\u0022MainBusinessAccountNo\u0022,\u0022Value\u0022:\u0022[\\u00221236506\\u0022]\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022UserOwnershipPathsLeaves\u0022,\u0022Value\u0022:\u0022{\\u0022S\\u0022:[],\\u0022M\\u0022:[\\u00221236506\\u0022],\\u0022B\\u0022:[],\\u0022PP\\u0022:[],\\u0022P\\u0022:[]}\u0022},{\u0022Type\u0022:\u0022OwnershipPathsLeaves\u0022,\u0022Value\u0022:\u0022{\\u0022S\\u0022:[],\\u0022M\\u0022:[\\u00221236506\\u0022],\\u0022B\\u0022:[],\\u0022PP\\u0022:[],\\u0022P\\u0022:[]}\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022CanApproveTermsAndConditions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanPostponeClaim\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadAuthUsers\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadClearingRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadContracts\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadCustomerNotifications\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadDocuments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadHolidays\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadICResultCodes\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadLocalDunningDocuments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadPartyAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadRetrocessions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadSettlements\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadTermsAndConditions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadValidationRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanResumeClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReverseRejection\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanStopClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClaimAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClearingRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateHolidays\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePartyAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateSettlementAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUploadClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanAcceptRejectClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanApproveChanges\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanBlockAcceptingClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanCancelDigitalDunning\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanDownloadClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanExtendClaimDueDate\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadAllGroups\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadAnnotationTemplates\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadICParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadIRIA\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadPayments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadRulesInterpretation\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanRedeliverClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanResumeBailiffs\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanResurrectClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanStopBailiffs\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanStopClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateAddressesWithoutLimitations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClaimFileAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateContracts\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePA\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateParticipants\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateTermsAndConditions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUploadDocuments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanAcceptRejectRisk\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanAddFinancialCorrection\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanApproveRejectCreditApplication\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanApproveSettlements\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanAssignPayments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanBlockPayOut\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanChangeMatchableItemStatus\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanCMIBDeal\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanCreatePaymentOutgoingFile\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanDeleteDebtorData\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanDeleteDocuments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanMatchPayments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanOverrideTickets\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadTickets\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReviewCustomerApplications\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanSentCreditPayment\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanSkipChangeApproval\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateAnnotationContent\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateAnnotationTags\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateBadClaimFileAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateCMIBParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateICParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateIRIA\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePayment\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePaymentAnnotationContent\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePaymentAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePaymentAnnotationTags\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateRulesInterpretation\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateSettlements\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateTickets\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateValidationRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUploadCorrectedClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanViewMdmaResponses\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanViewPaymentOutgoingFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022name\u0022,\u0022Value\u0022:\u0022Provider1236506MBA\u0022},{\u0022Type\u0022:\u0022user_groups\u0022,\u0022Value\u0022:\u0022[12]\u0022},{\u0022Type\u0022:\u0022UserGroups\u0022,\u0022Value\u0022:\u0022[12]\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022BusinessGroup\u0022,\u0022Value\u0022:\u0022Agent\u0022},{\u0022Type\u0022:\u0022sid\u0022,\u0022Value\u0022:\u002232B302195D992E014ACC595787A24B82\u0022},{\u0022Type\u0022:\u0022jti\u0022,\u0022Value\u0022:\u0022E2EC0BE46598AE21DB0C2F6F2DD909B4\u0022}],\u0022Version\u0022:5,\u0022Scopes\u0022:[\u0022gui\u0022,\u0022profile\u0022,\u0022openid\u0022,\u0022offline_access\u0022]}"}'')
	INSERT INTO IdentityProvider..PersistedGrants ([Key], [Type], [SubjectId], [SessionId], [ClientId], [Description], [CreationTime], [Expiration], [ConsumedTime], [Data], [CDate], CBy, UDate, UBy)
	VALUES(''DbvtAujX2miE6ZE211yyjaIFxynODli364A054kkJMA='',	''reference_token''	,@MbaUserId ,	''EBDF9BA9395BE51BBA0B8FF06F2665D6'',	''gui'',	NULL,	''2025-02-05 10:15:06.241''	,''2035-02-05 20:22:46.241'',	NULL,@MbaUserPayload, GETDATE(),	''createFromJob'',	GETDATE(),	''createFromJob'')
END

-- insert access token for test purpuses for PROVIDER_USER/Provider1439233PP in TIM, with value: 5A6D71A100566E8E31FED9C8E2AB07D4E761BC47B36C4826C98EAAC4829E9111-1__IIP2
BEGIN
	DELETE FROM IdentityProvider..PersistedGrants WHERE [Key] = ''C1dDjKMSw5kgY6/VrFD07qc34hctg7G4jr1pxF0E3IE=''
	DECLARE @ProviderUserPayload NVARCHAR(MAX) = CONCAT(''{"PersistentGrantDataContainerVersion":1,"DataProtected":false,"Payload":"{\u0022AllowedSigningAlgorithms\u0022:[],\u0022Audiences\u0022:[\u0022claim\u0022,\u0022catalog\u0022,\u0022gui\u0022,\u0022rnn\u0022,\u0022mediation\u0022,\u0022clearing\u0022,\u0022bnm\u0022,\u0022imd_input\u0022,\u0022helpdesk\u0022,\u0022WebApiClaim\u0022,\u0022enricher\u0022,\u0022invoice\u0022,\u0022ledger_connector\u0022,\u0022idmgr\u0022,\u0022imd_responses\u0022,\u0022validation\u0022,\u0022'',@EnvironmentUrl,''/resources\u0022],\u0022Issuer\u0022:\u0022'',@EnvironmentUrl,''\u0022,\u0022CreationTime\u0022:\u00222025-02-05T10:38:58.8637959Z\u0022,\u0022Lifetime\u0022:315569260,\u0022Type\u0022:\u0022access_token\u0022,\u0022ClientId\u0022:\u0022gui\u0022,\u0022AccessTokenType\u0022:1,\u0022IncludeJwtId\u0022:true,\u0022Claims\u0022:[{\u0022Type\u0022:\u0022client_id\u0022,\u0022Value\u0022:\u0022gui\u0022},{\u0022Type\u0022:\u0022scope\u0022,\u0022Value\u0022:\u0022gui\u0022},{\u0022Type\u0022:\u0022scope\u0022,\u0022Value\u0022:\u0022openid\u0022},{\u0022Type\u0022:\u0022scope\u0022,\u0022Value\u0022:\u0022offline_access\u0022},{\u0022Type\u0022:\u0022sub\u0022,\u0022Value\u0022:\u0022'',@ProviderUserId,''\u0022},{\u0022Type\u0022:\u0022auth_time\u0022,\u0022Value\u0022:\u00221738751923\u0022,\u0022ValueType\u0022:\u0022http://www.w3.org/2001/XMLSchema#integer64\u0022},{\u0022Type\u0022:\u0022idp\u0022,\u0022Value\u0022:\u0022local\u0022},{\u0022Type\u0022:\u0022amr\u0022,\u0022Value\u0022:\u0022pwd\u0022},{\u0022Type\u0022:\u0022ServiceBureauPartyNo\u0022,\u0022Value\u0022:\u0022[\\u00221120001\\u0022]\u0022},{\u0022Type\u0022:\u0022ServiceBureauNo\u0022,\u0022Value\u0022:\u0022[\\u00221120001\\u0022]\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022MainBusinessAccountPartyNo\u0022,\u0022Value\u0022:\u0022[\\u00221236506\\u0022]\u0022},{\u0022Type\u0022:\u0022MainBusinessAccountNo\u0022,\u0022Value\u0022:\u0022[\\u00221236506\\u0022]\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022BusinessAccountPartyNo\u0022,\u0022Value\u0022:\u0022[\\u00221836504\\u0022]\u0022},{\u0022Type\u0022:\u0022BusinessAccountNo\u0022,\u0022Value\u0022:\u0022[\\u00221836504\\u0022]\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022ProviderPartyNo\u0022,\u0022Value\u0022:\u0022[\\u00221439233\\u0022]\u0022},{\u0022Type\u0022:\u0022ProviderNo\u0022,\u0022Value\u0022:\u0022[\\u00221439233\\u0022]\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022UserOwnershipPathsLeaves\u0022,\u0022Value\u0022:\u0022{\\u0022S\\u0022:[],\\u0022M\\u0022:[],\\u0022B\\u0022:[],\\u0022PP\\u0022:[\\u00221439233\\u0022],\\u0022P\\u0022:[]}\u0022},{\u0022Type\u0022:\u0022OwnershipPathsLeaves\u0022,\u0022Value\u0022:\u0022{\\u0022S\\u0022:[],\\u0022M\\u0022:[],\\u0022B\\u0022:[],\\u0022PP\\u0022:[\\u00221439233\\u0022],\\u0022P\\u0022:[]}\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022CanApproveTermsAndConditions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanPostponeClaim\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadAuthUsers\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadClearingRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadContracts\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadCustomerNotifications\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadDocuments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadHolidays\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadICResultCodes\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadLocalDunningDocuments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadPartyAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadRetrocessions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadSettlements\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadTermsAndConditions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadValidationRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanResumeClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReverseRejection\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanStopClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClaimAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClearingRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateHolidays\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePartyAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateSettlementAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUploadClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanAcceptRejectClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanAcceptRejectRisk\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanAddFinancialCorrection\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanApproveChanges\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanApproveRejectCreditApplication\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanApproveSettlements\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanAssignPayments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanBlockAcceptingClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanBlockPayOut\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanCancelDigitalDunning\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanChangeMatchableItemStatus\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanCMIBDeal\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanCreatePaymentOutgoingFile\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanDeleteDebtorData\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanDeleteDocuments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanDownloadClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanExtendClaimDueDate\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanMatchPayments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanOverrideTickets\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadAllGroups\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadAnnotationTemplates\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadICParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadIRIA\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadPayments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadRulesInterpretation\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadTickets\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanRedeliverClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanResumeBailiffs\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanResurrectClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReviewCustomerApplications\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanSentCreditPayment\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanSkipChangeApproval\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanStopBailiffs\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanStopClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateAddressesWithoutLimitations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateAnnotationContent\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateAnnotationTags\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateBadClaimFileAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClaimFileAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateCMIBParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateContracts\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateICParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateIRIA\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePA\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateParticipants\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePayment\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePaymentAnnotationContent\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePaymentAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePaymentAnnotationTags\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateRulesInterpretation\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateSettlements\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateTermsAndConditions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateTickets\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateValidationRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUploadCorrectedClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUploadDocuments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanViewMdmaResponses\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanViewPaymentOutgoingFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022name\u0022,\u0022Value\u0022:\u0022Provider1439233PP\u0022},{\u0022Type\u0022:\u0022user_groups\u0022,\u0022Value\u0022:\u0022[12]\u0022},{\u0022Type\u0022:\u0022UserGroups\u0022,\u0022Value\u0022:\u0022[12]\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022BusinessGroup\u0022,\u0022Value\u0022:\u0022Agent\u0022},{\u0022Type\u0022:\u0022sid\u0022,\u0022Value\u0022:\u00222EA06504BB8FB8DD571C3C6B32BFB79A\u0022},{\u0022Type\u0022:\u0022jti\u0022,\u0022Value\u0022:\u002217B93B1C82827CEEE1025AAA7E8FE268\u0022}],\u0022Version\u0022:5,\u0022Scopes\u0022:[\u0022gui\u0022,\u0022openid\u0022,\u0022offline_access\u0022]}"}'');
	INSERT INTO IdentityProvider..PersistedGrants ([Key], [Type], [SubjectId], [SessionId], [ClientId], [Description], [CreationTime], [Expiration], [ConsumedTime], [Data], [CDate], CBy, UDate, UBy)
	VALUES(''C1dDjKMSw5kgY6/VrFD07qc34hctg7G4jr1pxF0E3IE='',	''reference_token'',	@ProviderUserId,	''E2DEA6E676A2A4F7A3801FD315F8282D'',	''gui'',	NULL	,''2025-02-05 10:38:58.864'',	''2035-02-05 20:46:38.864'',	NULL,@ProviderUserPayload,	GETDATE(),	''createFromJob'',	GETDATE(),	''createFromJob'')
END

-- insert access token for test purpuses for PRACTITIONER_USER/Provider1536505P in TIM, with value: 7CE27A28BC439D5314FAE01AAA254C613F593B73CE30F0EDCBFDAD7FDBE81875-1__IIP2
BEGIN
	DELETE FROM IdentityProvider..PersistedGrants WHERE [Key] = ''j6MEe568+eLETknzm7uzKz7sqVZEdgGcLZ1Ku9Ujk/g=''
	DECLARE @PracticionerUserPayload NVARCHAR(MAX) = CONCAT(''{"PersistentGrantDataContainerVersion":1,"DataProtected":false,"Payload":"{\u0022AllowedSigningAlgorithms\u0022:[],\u0022Audiences\u0022:[\u0022claim\u0022,\u0022catalog\u0022,\u0022gui\u0022,\u0022rnn\u0022,\u0022mediation\u0022,\u0022clearing\u0022,\u0022bnm\u0022,\u0022imd_input\u0022,\u0022helpdesk\u0022,\u0022WebApiClaim\u0022,\u0022enricher\u0022,\u0022invoice\u0022,\u0022ledger_connector\u0022,\u0022idmgr\u0022,\u0022imd_responses\u0022,\u0022validation\u0022,\u0022'',@EnvironmentUrl,''/resources\u0022],\u0022Issuer\u0022:\u0022'',@EnvironmentUrl,''\u0022,\u0022CreationTime\u0022:\u00222025-02-05T10:50:59.2368552Z\u0022,\u0022Lifetime\u0022:315569260,\u0022Type\u0022:\u0022access_token\u0022,\u0022ClientId\u0022:\u0022gui\u0022,\u0022AccessTokenType\u0022:1,\u0022IncludeJwtId\u0022:true,\u0022Claims\u0022:[{\u0022Type\u0022:\u0022client_id\u0022,\u0022Value\u0022:\u0022gui\u0022},{\u0022Type\u0022:\u0022scope\u0022,\u0022Value\u0022:\u0022gui\u0022},{\u0022Type\u0022:\u0022scope\u0022,\u0022Value\u0022:\u0022openid\u0022},{\u0022Type\u0022:\u0022scope\u0022,\u0022Value\u0022:\u0022offline_access\u0022},{\u0022Type\u0022:\u0022sub\u0022,\u0022Value\u0022:\u0022'',@PracticionerUserId,''\u0022},{\u0022Type\u0022:\u0022auth_time\u0022,\u0022Value\u0022:\u00221738752658\u0022,\u0022ValueType\u0022:\u0022http://www.w3.org/2001/XMLSchema#integer64\u0022},{\u0022Type\u0022:\u0022idp\u0022,\u0022Value\u0022:\u0022local\u0022},{\u0022Type\u0022:\u0022amr\u0022,\u0022Value\u0022:\u0022pwd\u0022},{\u0022Type\u0022:\u0022ServiceBureauPartyNo\u0022,\u0022Value\u0022:\u0022[\\u00221120001\\u0022]\u0022},{\u0022Type\u0022:\u0022ServiceBureauNo\u0022,\u0022Value\u0022:\u0022[\\u00221120001\\u0022]\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022MainBusinessAccountPartyNo\u0022,\u0022Value\u0022:\u0022[\\u00221236506\\u0022]\u0022},{\u0022Type\u0022:\u0022MainBusinessAccountNo\u0022,\u0022Value\u0022:\u0022[\\u00221236506\\u0022]\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022BusinessAccountPartyNo\u0022,\u0022Value\u0022:\u0022[\\u00221836504\\u0022]\u0022},{\u0022Type\u0022:\u0022BusinessAccountNo\u0022,\u0022Value\u0022:\u0022[\\u00221836504\\u0022]\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022ProviderPartyNo\u0022,\u0022Value\u0022:\u0022[\\u00221439233\\u0022]\u0022},{\u0022Type\u0022:\u0022ProviderNo\u0022,\u0022Value\u0022:\u0022[\\u00221439233\\u0022]\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022PractitionerPartyNo\u0022,\u0022Value\u0022:\u0022[\\u00221536505\\u0022]\u0022},{\u0022Type\u0022:\u0022PractitionerNo\u0022,\u0022Value\u0022:\u0022[\\u00221536505\\u0022]\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022UserOwnershipPathsLeaves\u0022,\u0022Value\u0022:\u0022{\\u0022S\\u0022:[],\\u0022M\\u0022:[],\\u0022B\\u0022:[],\\u0022PP\\u0022:[],\\u0022P\\u0022:[\\u00221536505\\u0022]}\u0022},{\u0022Type\u0022:\u0022OwnershipPathsLeaves\u0022,\u0022Value\u0022:\u0022{\\u0022S\\u0022:[],\\u0022M\\u0022:[],\\u0022B\\u0022:[],\\u0022PP\\u0022:[],\\u0022P\\u0022:[\\u00221536505\\u0022]}\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022CanApproveTermsAndConditions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanPostponeClaim\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadAuthUsers\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadClearingRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadContracts\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadCustomerNotifications\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadDocuments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadHolidays\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadICResultCodes\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadLocalDunningDocuments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadPartyAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadRetrocessions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadSettlements\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadTermsAndConditions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadValidationRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanResumeClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReverseRejection\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanStopClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClaimAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClearingRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateHolidays\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePartyAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateSettlementAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUploadClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanAcceptRejectClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanAcceptRejectRisk\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanAddFinancialCorrection\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanApproveChanges\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanApproveRejectCreditApplication\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanApproveSettlements\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanAssignPayments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanBlockAcceptingClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanBlockPayOut\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanCancelDigitalDunning\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanChangeMatchableItemStatus\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanCMIBDeal\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanCreatePaymentOutgoingFile\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanDeleteDebtorData\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanDeleteDocuments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanDownloadClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanExtendClaimDueDate\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanMatchPayments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanOverrideTickets\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadAllGroups\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadAnnotationTemplates\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadICParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadIRIA\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadPayments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadRulesInterpretation\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadTickets\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanRedeliverClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanResumeBailiffs\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanResurrectClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReviewCustomerApplications\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanSentCreditPayment\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanSkipChangeApproval\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanStopBailiffs\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanStopClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateAddressesWithoutLimitations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateAnnotationContent\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateAnnotationTags\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateBadClaimFileAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClaimFileAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateCMIBParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateContracts\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateICParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateIRIA\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePA\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateParticipants\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePayment\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePaymentAnnotationContent\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePaymentAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePaymentAnnotationTags\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateRulesInterpretation\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateSettlements\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateTermsAndConditions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateTickets\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateValidationRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUploadCorrectedClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUploadDocuments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanViewMdmaResponses\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanViewPaymentOutgoingFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022name\u0022,\u0022Value\u0022:\u0022Provider1536505P\u0022},{\u0022Type\u0022:\u0022user_groups\u0022,\u0022Value\u0022:\u0022[12]\u0022},{\u0022Type\u0022:\u0022UserGroups\u0022,\u0022Value\u0022:\u0022[12]\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022BusinessGroup\u0022,\u0022Value\u0022:\u0022Agent\u0022},{\u0022Type\u0022:\u0022sid\u0022,\u0022Value\u0022:\u00229BAAE868AC31B3E6CBDCEE51AE32B4F2\u0022},{\u0022Type\u0022:\u0022jti\u0022,\u0022Value\u0022:\u00221D67214661766D718650ADFF61849B53\u0022}],\u0022Version\u0022:5,\u0022Scopes\u0022:[\u0022gui\u0022,\u0022openid\u0022,\u0022offline_access\u0022]}"}'')
	INSERT INTO IdentityProvider..PersistedGrants ([Key], [Type], [SubjectId], [SessionId], [ClientId], [Description], [CreationTime], [Expiration], [ConsumedTime], [Data], [CDate], CBy, UDate, UBy)
	VALUES(''j6MEe568+eLETknzm7uzKz7sqVZEdgGcLZ1Ku9Ujk/g='',	''reference_token'',	@PracticionerUserId,	''E879410F4081579789F3FCD3143758FB'',	''gui'',	NULL,	''2025-02-05 10:50:59.237'',	''2035-02-05 20:58:39.237'',	NULL,@PracticionerUserPayload,	GETDATE(),	''createFromJob'',	GETDATE(),	''createFromJob'')
END

-- insert access token for test purposes for Agent in Inzicht, wtih Value: 11F5625D7C1A31E9DC0D7BE3B424957BA257B3B5E36C62B9CF13D4F3AC524628-1__IIP2
BEGIN
	DELETE FROM IdentityProvider..PersistedGrants WHERE [Key] = ''OSqk+Lqfy28+zOkuDsXYcE0qSY01egoFNZ4NAq/MU4Y=''
	DECLARE @AgentInzichtUserPayload NVARCHAR(MAX) = CONCAT(''{"PersistentGrantDataContainerVersion":1,"DataProtected":false,"Payload":"{\u0022AllowedSigningAlgorithms\u0022:[],\u0022Audiences\u0022:[\u0022claim\u0022,\u0022catalog\u0022,\u0022rnn\u0022,\u0022mediation\u0022,\u0022clearing\u0022,\u0022WebApiClaim\u0022,\u0022enricher\u0022,\u0022ledger_connector\u0022,\u0022timssp\u0022,\u0022imd_enrichers\u0022,\u0022'',@EnvironmentUrl,''/resources\u0022],\u0022Issuer\u0022:\u0022'',@EnvironmentUrl,''\u0022,\u0022CreationTime\u0022:\u00222025-02-05T12:20:55.0855026Z\u0022,\u0022Lifetime\u0022:315569260,\u0022Type\u0022:\u0022access_token\u0022,\u0022ClientId\u0022:\u0022timssp\u0022,\u0022AccessTokenType\u0022:1,\u0022IncludeJwtId\u0022:true,\u0022Claims\u0022:[{\u0022Type\u0022:\u0022client_id\u0022,\u0022Value\u0022:\u0022timssp\u0022},{\u0022Type\u0022:\u0022scope\u0022,\u0022Value\u0022:\u0022timssp\u0022},{\u0022Type\u0022:\u0022scope\u0022,\u0022Value\u0022:\u0022openid\u0022},{\u0022Type\u0022:\u0022scope\u0022,\u0022Value\u0022:\u0022offline_access\u0022},{\u0022Type\u0022:\u0022sub\u0022,\u0022Value\u0022:\u0022'',@AgentUserId,''\u0022},{\u0022Type\u0022:\u0022auth_time\u0022,\u0022Value\u0022:\u00221738758053\u0022,\u0022ValueType\u0022:\u0022http://www.w3.org/2001/XMLSchema#integer64\u0022},{\u0022Type\u0022:\u0022idp\u0022,\u0022Value\u0022:\u0022local\u0022},{\u0022Type\u0022:\u0022amr\u0022,\u0022Value\u0022:\u0022pwd\u0022},{\u0022Type\u0022:\u0022CanApproveChanges\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanApproveTermsAndConditions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanDownloadClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanExtendClaimDueDate\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanPostponeClaim\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadAuthUsers\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadClaimReceipt\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadClaimRetrocession\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadClearingRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadCodelists\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadContracts\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadCustomerNotifications\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadDocuments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadHolidays\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadICParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadICResultCodes\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadLocalDunningDocuments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadPartyAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadRetrocessions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadSettlements\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadTermsAndConditions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadValidationRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanResetPassword\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanResumeClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReverseRejection\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanStopClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateAuthUsers\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClaimAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClaimFileAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClearingRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateCMIBParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateHolidays\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateICParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateParticipants\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePartyAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateSettlementAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateValidationRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUploadClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUseLedgerConnector\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanViewLedgerConnector\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022UserOwnershipPathsLeaves\u0022,\u0022Value\u0022:\u0022{\\u0022S\\u0022:[],\\u0022M\\u0022:[],\\u0022B\\u0022:[],\\u0022PP\\u0022:[],\\u0022P\\u0022:[]}\u0022},{\u0022Type\u0022:\u0022OwnershipPathsLeaves\u0022,\u0022Value\u0022:\u0022{\\u0022S\\u0022:[],\\u0022M\\u0022:[],\\u0022B\\u0022:[],\\u0022PP\\u0022:[],\\u0022P\\u0022:[]}\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022name\u0022,\u0022Value\u0022:\u0022Agent\u0022},{\u0022Type\u0022:\u0022allowed_systems\u0022,\u0022Value\u0022:\u0022[{\\u0022Id\\u0022:\\u0022timssp\\u0022,\\u0022Priority\\u0022:2},{\\u0022Id\\u0022:\\u0022idmgr\\u0022,\\u0022Priority\\u0022:0},{\\u0022Id\\u0022:\\u0022clp\\u0022,\\u0022Priority\\u0022:0},{\\u0022Id\\u0022:\\u0022gui\\u0022,\\u0022Priority\\u0022:0},{\\u0022Id\\u0022:\\u0022PienQualityTool\\u0022,\\u0022Priority\\u0022:0},{\\u0022Id\\u0022:\\u0022iboa\\u0022,\\u0022Priority\\u0022:0},{\\u0022Id\\u0022:\\u0022imd\\u0022,\\u0022Priority\\u0022:0}]\u0022},{\u0022Type\u0022:\u0022AllowedSystems\u0022,\u0022Value\u0022:\u0022[{\\u0022Id\\u0022:\\u0022timssp\\u0022,\\u0022Priority\\u0022:2},{\\u0022Id\\u0022:\\u0022idmgr\\u0022,\\u0022Priority\\u0022:0},{\\u0022Id\\u0022:\\u0022clp\\u0022,\\u0022Priority\\u0022:0},{\\u0022Id\\u0022:\\u0022gui\\u0022,\\u0022Priority\\u0022:0},{\\u0022Id\\u0022:\\u0022PienQualityTool\\u0022,\\u0022Priority\\u0022:0},{\\u0022Id\\u0022:\\u0022iboa\\u0022,\\u0022Priority\\u0022:0},{\\u0022Id\\u0022:\\u0022imd\\u0022,\\u0022Priority\\u0022:0}]\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022user_groups\u0022,\u0022Value\u0022:\u0022[]\u0022},{\u0022Type\u0022:\u0022UserGroups\u0022,\u0022Value\u0022:\u0022[]\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022BusinessGroup\u0022,\u0022Value\u0022:\u0022Agent\u0022},{\u0022Type\u0022:\u0022sid\u0022,\u0022Value\u0022:\u00221D27FDC946829AC21E87E3BA649C9BA3\u0022},{\u0022Type\u0022:\u0022jti\u0022,\u0022Value\u0022:\u0022B93BEBA263152A8B224347EDB1FC1E83\u0022}],\u0022Version\u0022:5,\u0022Scopes\u0022:[\u0022timssp\u0022,\u0022openid\u0022,\u0022offline_access\u0022]}"}'')
	INSERT INTO IdentityProvider..PersistedGrants ([Key], [Type], [SubjectId], [SessionId], [ClientId], [Description], [CreationTime], [Expiration], [ConsumedTime], [Data], [CDate], CBy, UDate, UBy)
	VALUES(''OSqk+Lqfy28+zOkuDsXYcE0qSY01egoFNZ4NAq/MU4Y='',	''reference_token'',	@AgentUserId,	''4FD6BA1D7A5D02B2513F9171FEE2CA9A'',	''timssp'',	NULL,	''2025-02-05 12:20:55.086'',	''2035-02-05 22:28:35.086'',	NULL, @AgentInzichtUserPayload, 	GETDATE(),	''createFromJob'',	GETDATE(),	''createFromJob'')	
END

-- insert access token for postman test purposes for Agent in Tim, with value: 3ED0407A55F0A161325EB862508E5667D5260D4DE1FBAD581E6E93E8F3F0B947-1__IIP2
BEGIN
	DELETE FROM IdentityProvider..PersistedGrants WHERE [Key] = ''CEDtMsm9mei5CD1JGzmVAU4nNSYxmzRnp2/MMWiIPeU=''
	DECLARE @AgentTimUserPayload NVARCHAR(MAX) = CONCAT(''{"PersistentGrantDataContainerVersion":1,"DataProtected":false,"Payload":"{\u0022AllowedSigningAlgorithms\u0022:[],\u0022Audiences\u0022:[\u0022claim\u0022,\u0022catalog\u0022,\u0022gui\u0022,\u0022rnn\u0022,\u0022mediation\u0022,\u0022clearing\u0022,\u0022bnm\u0022,\u0022imd_input\u0022,\u0022helpdesk\u0022,\u0022WebApiClaim\u0022,\u0022enricher\u0022,\u0022invoice\u0022,\u0022ledger_connector\u0022,\u0022idmgr\u0022,\u0022imd_responses\u0022,\u0022validation\u0022,\u0022'',@EnvironmentUrl,''/resources\u0022],\u0022Issuer\u0022:\u0022'',@EnvironmentUrl,''\u0022,\u0022CreationTime\u0022:\u00222025-02-05T14:05:07.3707646Z\u0022,\u0022Lifetime\u0022:315569260,\u0022Type\u0022:\u0022access_token\u0022,\u0022ClientId\u0022:\u0022gui\u0022,\u0022AccessTokenType\u0022:1,\u0022IncludeJwtId\u0022:true,\u0022Claims\u0022:[{\u0022Type\u0022:\u0022client_id\u0022,\u0022Value\u0022:\u0022gui\u0022},{\u0022Type\u0022:\u0022scope\u0022,\u0022Value\u0022:\u0022gui\u0022},{\u0022Type\u0022:\u0022scope\u0022,\u0022Value\u0022:\u0022openid\u0022},{\u0022Type\u0022:\u0022scope\u0022,\u0022Value\u0022:\u0022offline_access\u0022},{\u0022Type\u0022:\u0022sub\u0022,\u0022Value\u0022:\u0022'',@AgentUserId,''\u0022},{\u0022Type\u0022:\u0022auth_time\u0022,\u0022Value\u0022:\u00221738764306\u0022,\u0022ValueType\u0022:\u0022http://www.w3.org/2001/XMLSchema#integer64\u0022},{\u0022Type\u0022:\u0022idp\u0022,\u0022Value\u0022:\u0022local\u0022},{\u0022Type\u0022:\u0022amr\u0022,\u0022Value\u0022:\u0022pwd\u0022},{\u0022Type\u0022:\u0022CanAcceptRejectClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanAcceptRejectRisk\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanAddFinancialCorrection\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanApproveChanges\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanApproveRejectCreditApplication\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanApproveSettlements\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanApproveTermsAndConditions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanAssignPayments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanBlockAcceptingClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanBlockPayOut\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanCancelDigitalDunning\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanChangeMatchableItemStatus\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanCMIBDeal\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanCreatePaymentOutgoingFile\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanDeleteDebtorData\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanDeleteDocuments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanDownloadClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanExtendClaimDueDate\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanMatchPayments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanOverrideTickets\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanPostponeClaim\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadAllGroups\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadAnnotationTemplates\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadAuthUsers\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadClearingRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadContracts\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadCustomerNotifications\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadDocuments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadHolidays\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadICParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadICResultCodes\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadIRIA\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadLocalDunningDocuments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadPartyAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadPayments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadRetrocessions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadRulesInterpretation\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadSettlements\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadTermsAndConditions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadTickets\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadValidationRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanRedeliverClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanResumeBailiffs\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanResumeClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanResurrectClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReverseRejection\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReviewCustomerApplications\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanSentCreditPayment\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanSkipChangeApproval\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanStopBailiffs\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanStopClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanStopClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateAddressesWithoutLimitations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateAnnotationContent\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateAnnotationTags\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateBadClaimFileAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClaimAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClaimFileAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClearingRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateCMIBParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateContracts\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateHolidays\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateICParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateIRIA\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePA\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateParticipants\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePartyAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePayment\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePaymentAnnotationContent\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePaymentAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePaymentAnnotationTags\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateRulesInterpretation\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateSettlementAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateSettlements\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateTermsAndConditions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateTickets\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateValidationRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUploadClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUploadCorrectedClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUploadDocuments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanViewMdmaResponses\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanViewPaymentOutgoingFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022UserOwnershipPathsLeaves\u0022,\u0022Value\u0022:\u0022{\\u0022S\\u0022:[],\\u0022M\\u0022:[],\\u0022B\\u0022:[],\\u0022PP\\u0022:[],\\u0022P\\u0022:[]}\u0022},{\u0022Type\u0022:\u0022OwnershipPathsLeaves\u0022,\u0022Value\u0022:\u0022{\\u0022S\\u0022:[],\\u0022M\\u0022:[],\\u0022B\\u0022:[],\\u0022PP\\u0022:[],\\u0022P\\u0022:[]}\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022name\u0022,\u0022Value\u0022:\u0022Agent\u0022},{\u0022Type\u0022:\u0022user_groups\u0022,\u0022Value\u0022:\u0022[]\u0022},{\u0022Type\u0022:\u0022UserGroups\u0022,\u0022Value\u0022:\u0022[]\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022BusinessGroup\u0022,\u0022Value\u0022:\u0022Agent\u0022},{\u0022Type\u0022:\u0022sid\u0022,\u0022Value\u0022:\u0022B57AC99232DEB670EFC8A865151505FD\u0022},{\u0022Type\u0022:\u0022jti\u0022,\u0022Value\u0022:\u0022FABEC0EEEDD380DCC8D0102FF0D31E16\u0022}],\u0022Version\u0022:5,\u0022Scopes\u0022:[\u0022gui\u0022,\u0022openid\u0022,\u0022offline_access\u0022]}"}'')
	INSERT INTO IdentityProvider..PersistedGrants ([Key], [Type], [SubjectId], [SessionId], [ClientId], [Description], [CreationTime], [Expiration], [ConsumedTime], [Data], [CDate], CBy, UDate, UBy)
	VALUES(''CEDtMsm9mei5CD1JGzmVAU4nNSYxmzRnp2/MMWiIPeU='',	''reference_token'',	@AgentUserId,	''4FD6BA1D7A5D02B2513F9171FEE2CA9A'',	''gui'',	NULL,	''2025-02-05 14:05:07.371'',	''2035-02-06 00:12:47.371'',	NULL, @AgentTimUserPayload, 	GETDATE(),	''createFromJob'',	GETDATE(),	''createFromJob'')	
END

-- insert access token for postman test purposes for MBA2 User/Fail User/Provider70558BA in TIM with value: 5AC8CBBD2062693F2B37409E92021DD2DF9A8751E27BFFD9C90B922DCF038CBD-1__IIP2
BEGIN
	DELETE FROM IdentityProvider..PersistedGrants WHERE [Key] = ''YvYJvd5PgW1rnCzYrj0SACkPu97pln++0Bq52cjAQeY=''
	DECLARE @Mba2TimUserPayload NVARCHAR(MAX) = CONCAT(''{"PersistentGrantDataContainerVersion":1,"DataProtected":false,"Payload":"{\u0022AllowedSigningAlgorithms\u0022:[],\u0022Audiences\u0022:[\u0022claim\u0022,\u0022catalog\u0022,\u0022gui\u0022,\u0022rnn\u0022,\u0022mediation\u0022,\u0022clearing\u0022,\u0022bnm\u0022,\u0022imd_input\u0022,\u0022helpdesk\u0022,\u0022WebApiClaim\u0022,\u0022enricher\u0022,\u0022invoice\u0022,\u0022ledger_connector\u0022,\u0022idmgr\u0022,\u0022imd_responses\u0022,\u0022validation\u0022,\u0022customer_configuration_prices_api\u0022,\u0022'', @EnvironmentUrl, ''/resources\u0022],\u0022Issuer\u0022:\u0022'', @EnvironmentUrl, ''\u0022,\u0022CreationTime\u0022:\u00222025-05-21T13:47:44.5071597Z\u0022,\u0022Lifetime\u0022:315569260,\u0022Type\u0022:\u0022access_token\u0022,\u0022ClientId\u0022:\u0022gui\u0022,\u0022AccessTokenType\u0022:1,\u0022IncludeJwtId\u0022:true,\u0022Claims\u0022:[{\u0022Type\u0022:\u0022client_id\u0022,\u0022Value\u0022:\u0022gui\u0022},{\u0022Type\u0022:\u0022scope\u0022,\u0022Value\u0022:\u0022gui\u0022},{\u0022Type\u0022:\u0022scope\u0022,\u0022Value\u0022:\u0022openid\u0022},{\u0022Type\u0022:\u0022scope\u0022,\u0022Value\u0022:\u0022offline_access\u0022},{\u0022Type\u0022:\u0022sub\u0022,\u0022Value\u0022:\u0022'', @Mba2UserId, ''\u0022},{\u0022Type\u0022:\u0022auth_time\u0022,\u0022Value\u0022:\u00221747835263\u0022,\u0022ValueType\u0022:\u0022http://www.w3.org/2001/XMLSchema#integer64\u0022},{\u0022Type\u0022:\u0022idp\u0022,\u0022Value\u0022:\u0022local\u0022},{\u0022Type\u0022:\u0022amr\u0022,\u0022Value\u0022:\u0022pwd\u0022},{\u0022Type\u0022:\u0022BusinessAccountNo\u0022,\u0022Value\u0022:\u0022[\\u002270558\\u0022]\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022CanApproveTermsAndConditions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanPostponeClaim\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadAuthUsers\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadClearingRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadContracts\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadCustomerNotifications\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadDocuments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadHolidays\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadICResultCodes\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadIRIA\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadLocalDunningDocuments\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadParties\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadPartyAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadRetrocessions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadSettlements\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadTermsAndConditions\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReadValidationRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanResumeClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanReverseRejection\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanStopClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClaimAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClaims\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateClearingRules\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateHolidays\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdatePartyAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUpdateSettlementAnnotations\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022CanUploadClaimFiles\u0022,\u0022Value\u0022:\u0022\u0022},{\u0022Type\u0022:\u0022OwnershipPathsLeaves\u0022,\u0022Value\u0022:\u0022{\\u0022S\\u0022:[],\\u0022M\\u0022:[],\\u0022B\\u0022:[\\u002270558\\u0022],\\u0022PP\\u0022:[],\\u0022P\\u0022:[]}\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022ServiceBureauNo\u0022,\u0022Value\u0022:\u0022[\\u00221120001\\u0022]\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022name\u0022,\u0022Value\u0022:\u0022Provider70558BA\u0022},{\u0022Type\u0022:\u0022UserGroups\u0022,\u0022Value\u0022:\u0022[]\u0022,\u0022ValueType\u0022:\u0022json\u0022},{\u0022Type\u0022:\u0022BusinessGroup\u0022,\u0022Value\u0022:\u0022Agent\u0022},{\u0022Type\u0022:\u0022ServiceBureauPartyNo\u0022,\u0022Value\u0022:\u0022[\\u00221120001\\u0022]\u0022},{\u0022Type\u0022:\u0022BusinessAccountPartyNo\u0022,\u0022Value\u0022:\u0022[\\u002270558\\u0022]\u0022},{\u0022Type\u0022:\u0022UserOwnershipPathsLeaves\u0022,\u0022Value\u0022:\u0022{\\u0022S\\u0022:[],\\u0022M\\u0022:[],\\u0022B\\u0022:[\\u002270558\\u0022],\\u0022PP\\u0022:[],\\u0022P\\u0022:[]}\u0022},{\u0022Type\u0022:\u0022user_groups\u0022,\u0022Value\u0022:\u0022[]\u0022},{\u0022Type\u0022:\u0022sid\u0022,\u0022Value\u0022:\u002252CE398DE053BC680F025D6FB59A4795\u0022},{\u0022Type\u0022:\u0022jti\u0022,\u0022Value\u0022:\u002209CBA10DEF085E25092A51B58C773D35\u0022}],\u0022Version\u0022:5,\u0022Scopes\u0022:[\u0022gui\u0022,\u0022openid\u0022,\u0022offline_access\u0022]}"}'')
	INSERT INTO IdentityProvider..PersistedGrants ([Key], [Type], [SubjectId], [SessionId], [ClientId], [Description], [CreationTime], [Expiration], [ConsumedTime], [Data], [CDate], CBy, UDate, UBy)
	VALUES(''YvYJvd5PgW1rnCzYrj0SACkPu97pln++0Bq52cjAQeY='',	''reference_token'',	@Mba2UserId,	''52CE398DE053BC680F025D6FB59A4795'',	''gui'',	NULL,	''2025-05-21 13:47:44.507'',	''2035-05-21 23:55:24.507'',	NULL, @Mba2TimUserPayload, 	GETDATE(),	''createFromJob'',	GETDATE(),	''createFromJob'')	
END
', 
		@database_name=N'master', 
		@flags=0
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
EXEC @ReturnCode = msdb.dbo.sp_update_job @job_id = @jobId, @start_step_id = 1
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
EXEC @ReturnCode = msdb.dbo.sp_add_jobschedule @job_id=@jobId, @name=N'Create', 
		@enabled=1, 
		@freq_type=4, 
		@freq_interval=1, 
		@freq_subday_type=1, 
		@freq_subday_interval=0, 
		@freq_relative_interval=0, 
		@freq_recurrence_factor=0, 
		@active_start_date=20220926, 
		@active_end_date=99991231, 
		@active_start_time=50000, 
		@active_end_time=235959, 
		@schedule_uid=N'2bb82138-5bcc-46f3-af19-48250df5b6b8'
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
EXEC @ReturnCode = msdb.dbo.sp_add_jobserver @job_id = @jobId, @server_name = N'(local)'
IF (@@ERROR <> 0 OR @ReturnCode <> 0) GOTO QuitWithRollback
COMMIT TRANSACTION
GOTO EndSave
QuitWithRollback:
    IF (@@TRANCOUNT > 0) ROLLBACK TRANSACTION
EndSave:
GO


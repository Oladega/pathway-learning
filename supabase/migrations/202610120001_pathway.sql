-- Pathway normalized tenant-owned records. RPCs run under the caller's JWT and RLS.
create table public.profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.learning_plans (
 user_id uuid primary key references auth.users(id) on delete cascade,
 revision bigint not null default 0 check(revision >= 0), metadata jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.user_preferences (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null check(jsonb_typeof(payload)='object'),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.roadmap_phases(id text primary key, position integer not null unique, title text not null, description text not null);
create table public.roadmap_weeks(number integer primary key check(number between 1 and 52), phase_id text not null references public.roadmap_phases(id), payload jsonb not null);
create table public.course_catalog(level integer primary key check(level between 1 and 10), payload jsonb not null);
create table public.skills(name text primary key, category text not null);
create table public.learning_tasks (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null check(length(id) between 1 and 100),
 payload jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 primary key(user_id,id)
);
create table public.user_lessons (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null check(length(id) between 1 and 100),
 payload jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 primary key(user_id,id)
);
create table public.study_sessions (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null check(length(id) between 1 and 100),
 payload jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 primary key(user_id,id)
);
create table public.projects (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null check(length(id) between 1 and 100),
 payload jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 primary key(user_id,id)
);
create table public.notes (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null check(length(id) between 1 and 100),
 payload jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 primary key(user_id,id)
);
create table public.skill_evidence (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null check(length(id) between 1 and 100),
 payload jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 primary key(user_id,id)
);
create table public.skill_history (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null check(length(id) between 1 and 100),
 payload jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 primary key(user_id,id)
);
create table public.resources (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null check(length(id) between 1 and 100),
 payload jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 primary key(user_id,id)
);
create table public.job_applications (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null check(length(id) between 1 and 100),
 payload jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 primary key(user_id,id)
);
create table public.interview_questions (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null check(length(id) between 1 and 100),
 payload jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 primary key(user_id,id)
);
create table public.mentor_messages (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null check(length(id) between 1 and 100),
 payload jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 primary key(user_id,id)
);
create table public.activity_logs (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null check(length(id) between 1 and 100),
 payload jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 primary key(user_id,id)
);
create table public.user_courses (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null check(length(id) between 1 and 100),
 payload jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 primary key(user_id,id)
);
create table public.user_skills (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null check(length(id) between 1 and 100),
 payload jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 primary key(user_id,id)
);
create table public.career_checklists (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null check(length(id) between 1 and 100),
 payload jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 primary key(user_id,id)
);
create table public.notification_states (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null check(length(id) between 1 and 100),
 payload jsonb not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 primary key(user_id,id)
);
alter table public.learning_tasks add column week_number integer generated always as ((payload->>'week')::integer) stored references public.roadmap_weeks(number);
alter table public.learning_tasks add constraint task_status check(payload->>'status' in ('not_started','in_progress','paused','completed','skipped'));
alter table public.study_sessions add column task_id text generated always as (nullif(payload->>'taskId','')) stored;
alter table public.study_sessions add constraint session_task foreign key(user_id,task_id) references public.learning_tasks(user_id,id) deferrable initially deferred;
alter table public.study_sessions add constraint positive_duration check((payload->>'duration')::numeric between 1 and 1440);
alter table public.skill_evidence add column project_id text generated always as (nullif(payload->>'projectId','')) stored;
alter table public.skill_evidence add constraint evidence_project foreign key(user_id,project_id) references public.projects(user_id,id) deferrable initially deferred;
create index tasks_week_idx on public.learning_tasks(user_id,week_number);
create index sessions_date_idx on public.study_sessions(user_id,((payload->>'date')));
create index evidence_project_idx on public.skill_evidence(user_id,project_id);
create table public.mentor_rate_limits(user_id uuid not null references auth.users(id) on delete cascade, window timestamptz not null, requests integer not null check(requests between 1 and 6), primary key(user_id,window));
alter table public.profiles enable row level security;
create policy tenant_access on public.profiles for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update,delete on public.profiles to authenticated;
alter table public.learning_plans enable row level security;
create policy tenant_access on public.learning_plans for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update,delete on public.learning_plans to authenticated;
alter table public.user_preferences enable row level security;
create policy tenant_access on public.user_preferences for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update,delete on public.user_preferences to authenticated;
alter table public.learning_tasks enable row level security;
create policy tenant_access on public.learning_tasks for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update,delete on public.learning_tasks to authenticated;
alter table public.user_lessons enable row level security;
create policy tenant_access on public.user_lessons for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update,delete on public.user_lessons to authenticated;
alter table public.study_sessions enable row level security;
create policy tenant_access on public.study_sessions for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update,delete on public.study_sessions to authenticated;
alter table public.projects enable row level security;
create policy tenant_access on public.projects for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update,delete on public.projects to authenticated;
alter table public.notes enable row level security;
create policy tenant_access on public.notes for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update,delete on public.notes to authenticated;
alter table public.skill_evidence enable row level security;
create policy tenant_access on public.skill_evidence for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update,delete on public.skill_evidence to authenticated;
alter table public.skill_history enable row level security;
create policy tenant_access on public.skill_history for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update,delete on public.skill_history to authenticated;
alter table public.resources enable row level security;
create policy tenant_access on public.resources for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update,delete on public.resources to authenticated;
alter table public.job_applications enable row level security;
create policy tenant_access on public.job_applications for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update,delete on public.job_applications to authenticated;
alter table public.interview_questions enable row level security;
create policy tenant_access on public.interview_questions for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update,delete on public.interview_questions to authenticated;
alter table public.mentor_messages enable row level security;
create policy tenant_access on public.mentor_messages for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update,delete on public.mentor_messages to authenticated;
alter table public.activity_logs enable row level security;
create policy tenant_access on public.activity_logs for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update,delete on public.activity_logs to authenticated;
alter table public.user_courses enable row level security;
create policy tenant_access on public.user_courses for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update,delete on public.user_courses to authenticated;
alter table public.user_skills enable row level security;
create policy tenant_access on public.user_skills for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update,delete on public.user_skills to authenticated;
alter table public.career_checklists enable row level security;
create policy tenant_access on public.career_checklists for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update,delete on public.career_checklists to authenticated;
alter table public.notification_states enable row level security;
create policy tenant_access on public.notification_states for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update,delete on public.notification_states to authenticated;
alter table public.mentor_rate_limits enable row level security;
create policy tenant_access on public.mentor_rate_limits for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
grant select,insert,update,delete on public.mentor_rate_limits to authenticated;
alter table public.roadmap_phases enable row level security;
create policy catalog_read on public.roadmap_phases for select to anon,authenticated using(true);
grant select on public.roadmap_phases to anon,authenticated;
alter table public.roadmap_weeks enable row level security;
create policy catalog_read on public.roadmap_weeks for select to anon,authenticated using(true);
grant select on public.roadmap_weeks to anon,authenticated;
alter table public.course_catalog enable row level security;
create policy catalog_read on public.course_catalog for select to anon,authenticated using(true);
grant select on public.course_catalog to anon,authenticated;
alter table public.skills enable row level security;
create policy catalog_read on public.skills for select to anon,authenticated using(true);
grant select on public.skills to anon,authenticated;
create function public.load_learning_state() returns jsonb language plpgsql security invoker set search_path=public as $$
declare result jsonb; uid uuid:=auth.uid(); values_json jsonb;
begin
 if uid is null then raise exception 'authentication required'; end if;
 select metadata||jsonb_build_object('revision',revision) into result from public.learning_plans where user_id=uid;
 if result is null then return null; end if;
 select payload into values_json from public.user_preferences where user_id=uid;
 result:=result||jsonb_build_object('preferences',values_json);
 select coalesce(jsonb_agg(payload order by (payload->>'order')::integer), '[]'::jsonb) into values_json from public.learning_tasks where user_id=uid;
 result:=result||jsonb_build_object('tasks',values_json);
 select coalesce(jsonb_agg(payload order by (payload->>'order')::integer), '[]'::jsonb) into values_json from public.user_lessons where user_id=uid;
 result:=result||jsonb_build_object('lessons',values_json);
 select coalesce(jsonb_agg(payload order by (payload->>'order')::integer), '[]'::jsonb) into values_json from public.study_sessions where user_id=uid;
 result:=result||jsonb_build_object('sessions',values_json);
 select coalesce(jsonb_agg(payload order by (payload->>'order')::integer), '[]'::jsonb) into values_json from public.projects where user_id=uid;
 result:=result||jsonb_build_object('projects',values_json);
 select coalesce(jsonb_agg(payload order by (payload->>'order')::integer), '[]'::jsonb) into values_json from public.notes where user_id=uid;
 result:=result||jsonb_build_object('notes',values_json);
 select coalesce(jsonb_agg(payload order by (payload->>'order')::integer), '[]'::jsonb) into values_json from public.skill_evidence where user_id=uid;
 result:=result||jsonb_build_object('evidence',values_json);
 select coalesce(jsonb_agg(payload order by (payload->>'order')::integer), '[]'::jsonb) into values_json from public.skill_history where user_id=uid;
 result:=result||jsonb_build_object('skillHistory',values_json);
 select coalesce(jsonb_agg(payload order by (payload->>'order')::integer), '[]'::jsonb) into values_json from public.resources where user_id=uid;
 result:=result||jsonb_build_object('resources',values_json);
 select coalesce(jsonb_agg(payload order by (payload->>'order')::integer), '[]'::jsonb) into values_json from public.job_applications where user_id=uid;
 result:=result||jsonb_build_object('jobs',values_json);
 select coalesce(jsonb_agg(payload order by (payload->>'order')::integer), '[]'::jsonb) into values_json from public.interview_questions where user_id=uid;
 result:=result||jsonb_build_object('interviews',values_json);
 select coalesce(jsonb_agg(payload order by (payload->>'order')::integer), '[]'::jsonb) into values_json from public.mentor_messages where user_id=uid;
 result:=result||jsonb_build_object('messages',values_json);
 select coalesce(jsonb_agg(payload order by (payload->>'order')::integer), '[]'::jsonb) into values_json from public.activity_logs where user_id=uid;
 result:=result||jsonb_build_object('activity',values_json);
 select coalesce(jsonb_object_agg(id,payload),'{}'::jsonb) into values_json from public.user_courses where user_id=uid;
 result:=result||jsonb_build_object('courses',values_json);
 select coalesce(jsonb_object_agg(id,payload),'{}'::jsonb) into values_json from public.user_skills where user_id=uid;
 result:=result||jsonb_build_object('skills',values_json);
 select coalesce(jsonb_object_agg(id,payload),'{}'::jsonb) into values_json from public.career_checklists where user_id=uid;
 result:=result||jsonb_build_object('checklist',values_json);
 select coalesce(jsonb_object_agg(id,payload),'{}'::jsonb) into values_json from public.notification_states where user_id=uid;
 result:=result||jsonb_build_object('notificationState',values_json);
 return result; end; $$;
create function public.save_learning_state(document jsonb, expected_revision bigint) returns jsonb language plpgsql security invoker set search_path=public as $$
declare uid uuid:=auth.uid(); current_revision bigint; record jsonb; ordinal bigint;
begin
 if uid is null then raise exception 'authentication required'; end if;
 if document->>'version' <> '2' then raise exception 'unsupported schema version'; end if;
 perform pg_advisory_xact_lock(hashtext(uid::text));
 select revision into current_revision from public.learning_plans where user_id=uid for update;
 if coalesce(current_revision,0)<>expected_revision then raise exception 'revision conflict'; end if;
 insert into public.profiles(user_id) values(uid) on conflict(user_id) do update set updated_at=now();
 insert into public.learning_plans(user_id,revision,metadata) values(uid,coalesce(current_revision,0)+1,document-array['preferences','tasks','lessons','sessions','projects','notes','evidence','skillHistory','resources','jobs','interviews','messages','activity','courses','skills','checklist','notificationState']) on conflict(user_id) do update set revision=excluded.revision,metadata=excluded.metadata,updated_at=now();
 insert into public.user_preferences(user_id,payload) values(uid,document->'preferences') on conflict(user_id) do update set payload=excluded.payload,updated_at=now();
 delete from public.learning_tasks where user_id=uid;
 for record,ordinal in select value, ordinality from jsonb_array_elements(document->'tasks') with ordinality loop
  insert into public.learning_tasks(user_id,id,payload) values(uid,coalesce(record->>'id','entry-'||ordinal::text),record||jsonb_build_object('order',ordinal));
 end loop;
 delete from public.user_lessons where user_id=uid;
 for record,ordinal in select value, ordinality from jsonb_array_elements(document->'lessons') with ordinality loop
  insert into public.user_lessons(user_id,id,payload) values(uid,coalesce(record->>'id','entry-'||ordinal::text),record||jsonb_build_object('order',ordinal));
 end loop;
 delete from public.study_sessions where user_id=uid;
 for record,ordinal in select value, ordinality from jsonb_array_elements(document->'sessions') with ordinality loop
  insert into public.study_sessions(user_id,id,payload) values(uid,coalesce(record->>'id','entry-'||ordinal::text),record||jsonb_build_object('order',ordinal));
 end loop;
 delete from public.projects where user_id=uid;
 for record,ordinal in select value, ordinality from jsonb_array_elements(document->'projects') with ordinality loop
  insert into public.projects(user_id,id,payload) values(uid,coalesce(record->>'id','entry-'||ordinal::text),record||jsonb_build_object('order',ordinal));
 end loop;
 delete from public.notes where user_id=uid;
 for record,ordinal in select value, ordinality from jsonb_array_elements(document->'notes') with ordinality loop
  insert into public.notes(user_id,id,payload) values(uid,coalesce(record->>'id','entry-'||ordinal::text),record||jsonb_build_object('order',ordinal));
 end loop;
 delete from public.skill_evidence where user_id=uid;
 for record,ordinal in select value, ordinality from jsonb_array_elements(document->'evidence') with ordinality loop
  insert into public.skill_evidence(user_id,id,payload) values(uid,coalesce(record->>'id','entry-'||ordinal::text),record||jsonb_build_object('order',ordinal));
 end loop;
 delete from public.skill_history where user_id=uid;
 for record,ordinal in select value, ordinality from jsonb_array_elements(document->'skillHistory') with ordinality loop
  insert into public.skill_history(user_id,id,payload) values(uid,coalesce(record->>'id','entry-'||ordinal::text),record||jsonb_build_object('order',ordinal));
 end loop;
 delete from public.resources where user_id=uid;
 for record,ordinal in select value, ordinality from jsonb_array_elements(document->'resources') with ordinality loop
  insert into public.resources(user_id,id,payload) values(uid,coalesce(record->>'id','entry-'||ordinal::text),record||jsonb_build_object('order',ordinal));
 end loop;
 delete from public.job_applications where user_id=uid;
 for record,ordinal in select value, ordinality from jsonb_array_elements(document->'jobs') with ordinality loop
  insert into public.job_applications(user_id,id,payload) values(uid,coalesce(record->>'id','entry-'||ordinal::text),record||jsonb_build_object('order',ordinal));
 end loop;
 delete from public.interview_questions where user_id=uid;
 for record,ordinal in select value, ordinality from jsonb_array_elements(document->'interviews') with ordinality loop
  insert into public.interview_questions(user_id,id,payload) values(uid,coalesce(record->>'id','entry-'||ordinal::text),record||jsonb_build_object('order',ordinal));
 end loop;
 delete from public.mentor_messages where user_id=uid;
 for record,ordinal in select value, ordinality from jsonb_array_elements(document->'messages') with ordinality loop
  insert into public.mentor_messages(user_id,id,payload) values(uid,coalesce(record->>'id','entry-'||ordinal::text),record||jsonb_build_object('order',ordinal));
 end loop;
 delete from public.activity_logs where user_id=uid;
 for record,ordinal in select value, ordinality from jsonb_array_elements(document->'activity') with ordinality loop
  insert into public.activity_logs(user_id,id,payload) values(uid,coalesce(record->>'id','entry-'||ordinal::text),record||jsonb_build_object('order',ordinal));
 end loop;
 delete from public.user_courses where user_id=uid;
 insert into public.user_courses(user_id,id,payload) select uid,key,value from jsonb_each(document->'courses');
 delete from public.user_skills where user_id=uid;
 insert into public.user_skills(user_id,id,payload) select uid,key,value from jsonb_each(document->'skills');
 delete from public.career_checklists where user_id=uid;
 insert into public.career_checklists(user_id,id,payload) select uid,key,value from jsonb_each(document->'checklist');
 delete from public.notification_states where user_id=uid;
 insert into public.notification_states(user_id,id,payload) select uid,key,value from jsonb_each(document->'notificationState');
 return public.load_learning_state(); end; $$;
create function public.delete_learning_state() returns void language plpgsql security invoker set search_path=public as $$
declare uid uuid:=auth.uid();
begin
 if uid is null then raise exception 'authentication required'; end if;
 perform pg_advisory_xact_lock(hashtext(uid::text));
 delete from public.skill_evidence where user_id=uid;
 delete from public.study_sessions where user_id=uid;
 delete from public.profiles where user_id=uid;
 delete from public.learning_plans where user_id=uid;
 delete from public.user_preferences where user_id=uid;
 delete from public.learning_tasks where user_id=uid;
 delete from public.user_lessons where user_id=uid;
 delete from public.projects where user_id=uid;
 delete from public.notes where user_id=uid;
 delete from public.skill_history where user_id=uid;
 delete from public.resources where user_id=uid;
 delete from public.job_applications where user_id=uid;
 delete from public.interview_questions where user_id=uid;
 delete from public.mentor_messages where user_id=uid;
 delete from public.activity_logs where user_id=uid;
 delete from public.user_courses where user_id=uid;
 delete from public.user_skills where user_id=uid;
 delete from public.career_checklists where user_id=uid;
 delete from public.notification_states where user_id=uid;
 delete from public.mentor_rate_limits where user_id=uid;
 end; $$;
create function public.claim_mentor_request() returns boolean language plpgsql security invoker set search_path=public as $$
declare uid uuid:=auth.uid(); bucket timestamptz:=date_trunc('minute',now()); used integer;
begin
 if uid is null then raise exception 'authentication required'; end if;
 delete from public.mentor_rate_limits where user_id=uid and window<now()-interval '1 hour';
 insert into public.mentor_rate_limits(user_id,window,requests) values(uid,bucket,1)
 on conflict(user_id,window) do update set requests=mentor_rate_limits.requests+1 where mentor_rate_limits.requests<6 returning requests into used;
 return used is not null;
end; $$;
revoke all on function public.load_learning_state() from public,anon;
grant execute on function public.load_learning_state() to authenticated;
revoke all on function public.save_learning_state(jsonb,bigint) from public,anon;
grant execute on function public.save_learning_state(jsonb,bigint) to authenticated;
revoke all on function public.delete_learning_state() from public,anon;
grant execute on function public.delete_learning_state() to authenticated;
revoke all on function public.claim_mentor_request() from public,anon;
grant execute on function public.claim_mentor_request() to authenticated;

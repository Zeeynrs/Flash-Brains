begin;
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Pelajar' check (char_length(btrim(display_name)) between 1 and 60),
  avatar_id text not null default 'brain' check (avatar_id in ('brain','bolt','knight','leaf','star','rocket')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.course_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null check (course_id in ('c','python','chess')),
  state jsonb not null,
  revision bigint not null check (revision >= 1),
  updated_at timestamptz not null default now(),
  primary key(user_id,course_id),
  constraint valid_progress check (
    octet_length(state::text) <= 262144 and jsonb_typeof(state)='object'
    and state @> '{"version":2}'::jsonb
    and jsonb_typeof(state->'learned')='object' and jsonb_typeof(state->'solved')='object'
    and jsonb_typeof(state->'activity')='object' and jsonb_typeof(state->'sessions')='object'
    and jsonb_typeof(state->'awarded')='array' and jsonb_typeof(state->'legacyCompleted')='array'
    and state ? 'activeTopicId'
  )
);
alter table public.profiles enable row level security;
alter table public.course_progress enable row level security;
revoke all on public.profiles, public.course_progress from anon, authenticated;
grant select on public.profiles, public.course_progress to authenticated;
grant update(display_name,avatar_id) on public.profiles to authenticated;
create policy own_profile_read on public.profiles for select to authenticated using ((select auth.uid())=id);
create policy own_profile_update on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
create policy own_progress_read on public.course_progress for select to authenticated using ((select auth.uid())=user_id);

create function public.create_account_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id,display_name) values (new.id,
    coalesce(nullif(left(btrim(new.raw_user_meta_data->>'display_name'),60),''),'Pelajar'));
  return new;
end; $$;
revoke all on function public.create_account_profile() from public,anon,authenticated;
create trigger create_account_profile after insert on auth.users for each row execute function public.create_account_profile();
insert into public.profiles(id) select id from auth.users on conflict do nothing;
create function public.touch_profile() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at=now(); return new; end; $$;
revoke all on function public.touch_profile() from public,anon,authenticated;
create trigger touch_profile before update on public.profiles for each row execute function public.touch_profile();

-- Only this narrow RPC may write progress. The caller's UID is never an input.
create function public.save_course_progress(p_course_id text,p_state jsonb,p_expected_revision bigint)
returns setof public.course_progress language plpgsql security definer set search_path = '' as $$
declare owner_id uuid := auth.uid(); affected integer;
begin
  if owner_id is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_expected_revision is null or p_expected_revision < 0 then raise exception 'Invalid revision' using errcode='22023'; end if;
  if p_expected_revision=0 then
    return query insert into public.course_progress(user_id,course_id,state,revision)
      values(owner_id,p_course_id,p_state,1) on conflict do nothing returning *;
  else
    return query update public.course_progress set state=p_state,revision=revision+1,updated_at=now()
      where user_id=owner_id and course_id=p_course_id and revision=p_expected_revision returning *;
  end if;
  get diagnostics affected = row_count;
  if affected=0 then raise exception 'Progress revision conflict' using errcode='PT409'; end if;
end; $$;
revoke all on function public.save_course_progress(text,jsonb,bigint) from public,anon;
grant execute on function public.save_course_progress(text,jsonb,bigint) to authenticated;
commit;

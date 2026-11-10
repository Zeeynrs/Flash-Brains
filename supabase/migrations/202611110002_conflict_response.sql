create or replace function public.save_course_progress(p_course_id text,p_state jsonb,p_expected_revision bigint)
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

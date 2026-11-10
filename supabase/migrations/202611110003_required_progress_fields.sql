alter table public.course_progress add constraint required_progress_fields check (
  state ?& array['version','learned','solved','activity','sessions','awarded','legacyCompleted','activeTopicId']
  and jsonb_typeof(state->'activeTopicId') in ('null','string')
);

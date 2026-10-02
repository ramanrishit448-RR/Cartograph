-- Chat answers are cached like Explain. The original check only named the
-- three explain/classify tasks, so a chat write was refused.
alter table public.ai_cache drop constraint if exists ai_cache_task_check;
alter table public.ai_cache add constraint ai_cache_task_check
  check (task in ('explain-file', 'explain-folder', 'classify-file', 'chat-file', 'chat-folder'));

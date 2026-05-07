do $$
declare
  target_user_id uuid;
begin
  select id
  into target_user_id
  from auth.users
  where lower(email) = lower('alitalvar96@gmail.com')
  limit 1;

  if target_user_id is null then
    raise notice 'No auth.users row found for alitalvar96@gmail.com. Sign up with this email first, then run this SQL again.';
    return;
  end if;

  insert into public.user_roles (user_id, role)
  values (target_user_id, 'admin'::public.app_role)
  on conflict (user_id, role) do nothing;
end $$;

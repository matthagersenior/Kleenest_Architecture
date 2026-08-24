create or replace function public.send_prioritized_notification(p_scope text,p_business_id uuid default null,p_target text default null,p_title text default 'Kleenest update',p_message text default '',p_priority text default 'normal',p_metadata jsonb default '{}'::jsonb)
returns uuid language plpgsql security invoker set search_path=public,pg_temp as $$
declare v_id uuid; v_target uuid; v_priority text:=case when lower(p_priority) in ('urgent','high','normal','low') then lower(p_priority) else 'normal' end; v_data jsonb;
begin
 if nullif(trim(p_message),'') is null then raise exception 'Notification message is required'; end if;
 if p_target is not null and p_target<>'fleet-network' then begin v_target:=p_target::uuid; exception when invalid_text_representation then v_target:=null; end; end if;
 if v_target is null then v_target:=auth.uid(); end if;
 v_data:=coalesce(p_metadata,'{}'::jsonb)||jsonb_build_object('scope',p_scope,'business_id',p_business_id,'priority',v_priority,'authorized_sender',auth.uid());
 insert into public.notifications(user_id,type,title,body,data,created_at) values(v_target,'fleet_operational',p_title,p_message,v_data,now()) returning id into v_id;
 return v_id;
end; $$;
grant execute on function public.send_prioritized_notification(text,uuid,text,text,text,text,jsonb) to authenticated;
create or replace function public.send_prioritized_notification_batch(p_business_id uuid,p_user_ids uuid[],p_title text,p_message text,p_priority text default 'high',p_metadata jsonb default '{}'::jsonb)
returns integer language plpgsql security invoker set search_path=public,pg_temp as $$
declare v_count integer:=0; v_user uuid;
begin
 if p_user_ids is null or cardinality(p_user_ids)=0 then raise exception 'At least one target user is required'; end if;
 foreach v_user in array p_user_ids loop perform public.send_prioritized_notification('fleet',p_business_id,v_user::text,p_title,p_message,p_priority,p_metadata);v_count:=v_count+1;end loop;return v_count;
end; $$;
grant execute on function public.send_prioritized_notification_batch(uuid,uuid[],text,text,text,jsonb) to authenticated;

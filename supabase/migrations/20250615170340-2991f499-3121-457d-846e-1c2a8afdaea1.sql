
-- 创建名为 avatars 的公共存储桶（若已存在则忽略）
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 1. 允许所有用户公开读取 avatars 存储桶中的文件
drop policy if exists "Public Read Access for avatars" on storage.objects;
create policy "Public Read Access for avatars"
on storage.objects for select
to public
using (bucket_id = 'avatars');

-- 2. 允许登录用户上传（insert）头像文件到 avatars 桶
drop policy if exists "Authenticated Insert for avatars" on storage.objects;
create policy "Authenticated Insert for avatars"
on storage.objects for insert
to authenticated
with check (bucket_id = 'avatars');

-- 3. 允许用户更新自己的头像文件
drop policy if exists "Owner Update for avatars" on storage.objects;
create policy "Owner Update for avatars"
on storage.objects for update
to authenticated
using (auth.uid() = owner)
with check (bucket_id = 'avatars');

-- 4. 允许用户删除自己在 avatars 桶下的文件
drop policy if exists "Owner Delete for avatars" on storage.objects;
create policy "Owner Delete for avatars"
on storage.objects for delete
to authenticated
using (auth.uid() = owner and bucket_id = 'avatars');

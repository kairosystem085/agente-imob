insert into storage.buckets (id, name, public)
values ('property-photos', 'property-photos', true)
on conflict (id) do update set public = true;

create policy "property photos public read"
on storage.objects for select
using (bucket_id = 'property-photos');

create policy "authenticated users upload property photos"
on storage.objects for insert
to authenticated
with check (bucket_id = 'property-photos');

create policy "authenticated users update property photos"
on storage.objects for update
to authenticated
using (bucket_id = 'property-photos')
with check (bucket_id = 'property-photos');

create policy "authenticated users delete property photos"
on storage.objects for delete
to authenticated
using (bucket_id = 'property-photos');

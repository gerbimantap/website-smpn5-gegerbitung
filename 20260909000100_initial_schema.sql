-- SMPN 5 GEGERBITUNG
-- Initial schema + RLS + storage policies
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'viewer' check (role in ('super_admin','editor','data_admin','viewer')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.school_settings (
  id uuid primary key default gen_random_uuid(),
  school_name text not null default 'SMPN 5 Gegerbitung',
  jenjang text default 'SMP',
  npsn text default '69881821',
  address text default 'Kp. Cimonteng Rt 15/5 Desa Caringin Kecamatan Gegerbitung Kabupaten Sukabumi',
  village text default 'Caringin',
  district text default 'Gegerbitung',
  regency text default 'Sukabumi',
  province text default 'Jawa Barat',
  email text default 'smpn5gegerbitung@gmail.com',
  phone text,
  principal_name text default 'Nengsri Rohimah, Munazah, S.Pd., M.Pd.',
  principal_message text,
  vision text,
  mission text,
  goals text,
  logo_path text,
  favicon_path text,
  hero_title text,
  hero_subtitle text,
  primary_color text default '#38BDF8',
  secondary_color text default '#FFFFFF',
  google_maps_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(), name text not null, position text, description text, photo_path text, sort_order int default 0, is_active boolean default true, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(), name text not null, nip text, nuptk text, gender text check(gender in ('L','P')), position text, subject text, education text, email text, phone text, photo_path text, bio text, is_active boolean default true, sort_order int default 0, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(), nis text, nisn text, name text not null, gender text check(gender in ('L','P')), class_name text, grade int check(grade between 7 and 9), admission_year int, photo_path text, status text default 'active' check(status in ('active','graduated','transferred','inactive')), created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(), title text not null, slug text unique not null, excerpt text, content text not null, featured_image_path text, category text, author_id uuid references public.profiles(id) on delete set null, published_at timestamptz, status text default 'draft' check(status in ('draft','published','archived')), is_featured boolean default false, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(), title text not null, content text not null, attachment_path text, start_date date, end_date date, status text default 'published' check(status in ('draft','published','archived')), is_important boolean default false, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(), title text not null, slug text unique not null, description text, cover_image_path text, event_date date, is_published boolean default true, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(), album_id uuid not null references public.gallery_albums(id) on delete cascade, image_path text not null, caption text, sort_order int default 0, created_at timestamptz default now()
);
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(), title text not null, student_name text, category text, level text, ranking text, year int, description text, image_path text, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.curriculum_activities (
  id uuid primary key default gen_random_uuid(), title text not null, slug text unique not null, description text, content text, featured_image_path text, activity_date date, status text default 'published' check(status in ('draft','published','archived')), created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.student_activities (
  id uuid primary key default gen_random_uuid(), title text not null, slug text unique not null, description text, content text, featured_image_path text, activity_date date, status text default 'published' check(status in ('draft','published','archived')), created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.extracurriculars (
  id uuid primary key default gen_random_uuid(), name text not null, description text, coach_name text, schedule text, location text, image_path text, is_active boolean default true, sort_order int default 0, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.ppdb (
  id uuid primary key default gen_random_uuid(), title text not null, academic_year text, description text, requirements text, schedule text, registration_url text, contact text, image_path text, status text default 'draft' check(status in ('draft','published','closed')), created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(), title text not null, description text, category text, file_path text not null, file_name text, file_size bigint, mime_type text, download_count int default 0, is_public boolean default true, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(), name text not null, description text, image_path text, is_active boolean default true, sort_order int default 0, created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(), name text not null, email text, phone text, subject text, message text not null, is_read boolean default false, created_at timestamptz default now()
);
create table if not exists public.social_links (
  id uuid primary key default gen_random_uuid(), platform text not null, url text not null, icon text, sort_order int default 0, is_active boolean default true, created_at timestamptz default now(), updated_at timestamptz default now()
);

create index if not exists idx_news_status on public.news(status);
create index if not exists idx_news_published_at on public.news(published_at desc);
create index if not exists idx_students_class on public.students(class_name);
create index if not exists idx_students_status on public.students(status);
create index if not exists idx_gallery_images_album on public.gallery_images(album_id);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role='super_admin');
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,full_name,role) values(new.id,coalesce(new.raw_user_meta_data->>'full_name',new.email),'viewer') on conflict(id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

insert into public.school_settings (school_name,jenjang,npsn,address,village,district,regency,province,email,principal_name,primary_color,secondary_color,hero_title,hero_subtitle,vision,mission,principal_message)
select 'SMPN 5 Gegerbitung','SMP','69881821','Kp. Cimonteng Rt 15/5 Desa Caringin Kecamatan Gegerbitung Kabupaten Sukabumi','Caringin','Gegerbitung','Sukabumi','Jawa Barat','smpn5gegerbitung@gmail.com','Nengsri Rohimah, Munazah, S.Pd., M.Pd.','#38BDF8','#FFFFFF','Membangun Generasi Unggul dan Berkarakter','Sekolah yang tumbuh bersama prestasi, karakter, dan semangat belajar.','Mewujudkan peserta didik yang berkarakter, berprestasi, mandiri, dan berwawasan.','Menyelenggarakan pembelajaran yang aktif, inovatif, berkarakter, dan berorientasi pada prestasi.','Selamat datang di website resmi SMPN 5 Gegerbitung. Mari bersama membangun lingkungan pendidikan yang aman, inspiratif, dan berprestasi.'
where not exists(select 1 from public.school_settings);

-- Enable RLS
do $$ declare t text; begin
  foreach t in array array['profiles','school_settings','organization_members','teachers','students','news','announcements','gallery_albums','gallery_images','achievements','curriculum_activities','student_activities','extracurriculars','ppdb','documents','facilities','contact_messages','social_links'] loop
    execute format('alter table public.%I enable row level security',t);
  end loop;
end $$;

-- Admin policies (all operations)
do $$ declare t text; begin
  foreach t in array array['profiles','school_settings','organization_members','teachers','students','news','announcements','gallery_albums','gallery_images','achievements','curriculum_activities','student_activities','extracurriculars','ppdb','documents','facilities','contact_messages','social_links'] loop
    execute format('drop policy if exists "super_admin_all_%s" on public.%I',t,t);
    execute format('create policy "super_admin_all_%s" on public.%I for all to authenticated using(public.is_admin()) with check(public.is_admin())',t,t);
  end loop;
end $$;

-- Public read policies
create policy "public_read_school_settings" on public.school_settings for select to anon,authenticated using(true);
create policy "public_read_org" on public.organization_members for select to anon,authenticated using(is_active=true);
create policy "public_read_teachers" on public.teachers for select to anon,authenticated using(is_active=true);
create policy "public_read_news" on public.news for select to anon,authenticated using(status='published');
create policy "public_read_announcements" on public.announcements for select to anon,authenticated using(status='published');
create policy "public_read_albums" on public.gallery_albums for select to anon,authenticated using(is_published=true);
create policy "public_read_images" on public.gallery_images for select to anon,authenticated using(exists(select 1 from public.gallery_albums a where a.id=album_id and a.is_published=true));
create policy "public_read_achievements" on public.achievements for select to anon,authenticated using(true);
create policy "public_read_curriculum" on public.curriculum_activities for select to anon,authenticated using(status='published');
create policy "public_read_student_activities" on public.student_activities for select to anon,authenticated using(status='published');
create policy "public_read_extracurriculars" on public.extracurriculars for select to anon,authenticated using(is_active=true);
create policy "public_read_ppdb" on public.ppdb for select to anon,authenticated using(status='published');
create policy "public_read_documents" on public.documents for select to anon,authenticated using(is_public=true);
create policy "public_read_facilities" on public.facilities for select to anon,authenticated using(is_active=true);
create policy "public_read_social" on public.social_links for select to anon,authenticated using(is_active=true);
create policy "public_insert_contact" on public.contact_messages for insert to anon,authenticated with check(true);

-- Storage buckets
insert into storage.buckets(id,name,public) values
('school-media','school-media',true),
('school-documents','school-documents',false)
on conflict(id) do nothing;

create policy "public_read_school_media" on storage.objects for select to anon,authenticated using(bucket_id='school-media');
create policy "admin_insert_school_media" on storage.objects for insert to authenticated with check(bucket_id='school-media' and public.is_admin());
create policy "admin_update_school_media" on storage.objects for update to authenticated using(bucket_id='school-media' and public.is_admin()) with check(bucket_id='school-media' and public.is_admin());
create policy "admin_delete_school_media" on storage.objects for delete to authenticated using(bucket_id='school-media' and public.is_admin());

create policy "admin_read_school_documents" on storage.objects for select to authenticated using(bucket_id='school-documents' and public.is_admin());
create policy "admin_insert_school_documents" on storage.objects for insert to authenticated with check(bucket_id='school-documents' and public.is_admin());
create policy "admin_update_school_documents" on storage.objects for update to authenticated using(bucket_id='school-documents' and public.is_admin()) with check(bucket_id='school-documents' and public.is_admin());
create policy "admin_delete_school_documents" on storage.objects for delete to authenticated using(bucket_id='school-documents' and public.is_admin());

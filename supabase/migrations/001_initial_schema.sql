-- Children profiles
create table children (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  age int not null,
  interests text[] not null,
  favorite_things text,
  fears_to_avoid text,
  reading_level text not null,
  photo_urls text[] not null,
  created_at timestamptz default now()
);

-- Books
create table books (
  id uuid primary key default gen_random_uuid(),
  child_id uuid references children(id) on delete cascade not null,
  theme text not null,
  status text not null default 'generating',
  stripe_session_id text,
  stripe_payment_intent_id text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Book pages
create table book_pages (
  id uuid primary key default gen_random_uuid(),
  book_id uuid references books(id) on delete cascade not null,
  page_number int not null,
  text text not null,
  image_prompt text not null,
  image_url text,
  is_preview boolean default false,
  created_at timestamptz default now()
);

-- RLS
alter table children enable row level security;
alter table books enable row level security;
alter table book_pages enable row level security;

create policy "Users can manage their own children"
  on children for all using (auth.uid() = user_id);

create policy "Users can view their own books"
  on books for all using (
    child_id in (select id from children where user_id = auth.uid())
  );

create policy "Users can view their own book pages"
  on book_pages for all using (
    book_id in (
      select b.id from books b
      join children c on b.child_id = c.id
      where c.user_id = auth.uid()
    )
  );

-- Storage buckets
insert into storage.buckets (id, name, public) values ('photos', 'photos', true);
insert into storage.buckets (id, name, public) values ('illustrations', 'illustrations', true);

-- Storage policies: photos bucket
create policy "Authenticated users can upload photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'photos');

create policy "Authenticated users can read photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'photos');

-- Storage policies: illustrations bucket
create policy "Authenticated users can upload illustrations"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'illustrations');

create policy "Authenticated users can update illustrations"
  on storage.objects for update to authenticated
  using (bucket_id = 'illustrations');

create policy "Anyone can read illustrations"
  on storage.objects for select to public
  using (bucket_id = 'illustrations');

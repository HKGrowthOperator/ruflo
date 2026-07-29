-- Breaking-News-Kennzeichnung (Frage 30)
alter table stories add column if not exists breaking boolean not null default false;

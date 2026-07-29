-- Redaktionsstandard: Relevanzscore (0–100) und Risikoklasse pro Story
alter table stories add column if not exists relevance_score integer;
alter table stories add column if not exists risk_level text
  check (risk_level in ('green', 'yellow', 'red'));

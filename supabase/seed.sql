-- =============================================================
--  Tríade Conecta — conteúdo inicial
--  Rode DEPOIS do schema.sql, no SQL Editor do Supabase.
--
--  Espelha `src/data/seed.ts`. Pode rodar de novo: usa upsert,
--  então atualiza o que já existe em vez de duplicar.
--
--  ATENÇÃO: os planos abaixo (nomes e preços) ainda são um
--  RASCUNHO a validar com as idealizadoras.
-- =============================================================

-- Histórico antigo (mock, anterior ao Módulo 11) removido — sem respaldo no
-- export do Instagram. Substituído pelas edições reais abaixo.
delete from public.events where id in ('ed1', 'ed2', 'ed3');

insert into public.events (id, title, date, status, location, speaker, theme, spots, sort_order, recap_text, recap_media)
values
  ('ed-set25', 'Edição Especial — Casa Benedita', '2025-09-15', 'realizado', 'Casa Benedita, Goiânia, GO',
   'Geórgia Maia', 'Conexões verdadeiras, aprendizados compartilhados e um pouco de marketing', null, 1,
   'Um encontro pensado para empreendedoras, profissionais autônomas e comerciantes expandirem sua rede — com direito a uma conversa sobre marketing com Geórgia Maia. A resposta de quem esteve na Casa Benedita confirmou: era isso que fazia falta.',
   '[{"tipo":"foto","url":"https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/edicao-especial-2025-09/foto-1.jpg","legenda":"Aprendendo sobre marketing com Geórgia Maia"},{"tipo":"foto","url":"https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/edicao-especial-2025-09/foto-2.jpg","legenda":"No cantinho da marca"}]'::jsonb),
  ('ed-out25', 'Edição com Carla Martins', '2025-10-20', 'realizado', 'Goiânia, GO',
   'Carla Martins', 'Liderança feminina: o primeiro púlpito de uma mulher — sua família, sua casa e seu lar', null, 2,
   'Carla Martins, especialista em liderança feminina, trouxe um tema pedido pelas próprias participantes: será que dá pra ter sucesso também dentro de casa? Um encontro sobre equilibrar pratos e papéis sem perder a essência.',
   '[{"tipo":"foto","url":"https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/edicao-carla-martins-2025-10/foto-1.jpg","legenda":"Quando mulheres se encontram, tudo muda"},{"tipo":"foto","url":"https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/edicao-carla-martins-2025-10/foto-2.jpg","legenda":"Conectar, aprender e se inspirar"}]'::jsonb),
  ('ed6-nov25', '6ª Edição', '2025-11-17', 'realizado', 'Goiânia, GO',
   'Idealizadoras da Tríade', 'Acolher, inspirar e impulsionar mulheres — fechando o ano com chave de ouro', null, 3,
   'Casa cheia para encerrar o ano: a 6ª edição reuniu quem já acredita no movimento criado por Lívia, Lia e Cris para acolher, inspirar e impulsionar mulheres, gerando conexões autênticas.',
   '[{"tipo":"foto","url":"https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/6a-edicao-2025-11/foto-1.jpg","legenda":"Lívia, Lia e Cris com convidadas"},{"tipo":"foto","url":"https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/6a-edicao-2025-11/foto-2.jpg","legenda":"A vida é feita de boas conexões"}]'::jsonb),
  ('ed9-mar26', '9ª Edição', '2026-03-31', 'realizado', 'Goiânia, GO',
   'Idealizadoras da Tríade', 'Conexão, aprendizado e fortalecimento de vínculos', null, 4,
   'A 9ª edição chegou com a mesma proposta desde o início: mesas que levam quem participa a um próximo nível, num ambiente feito pra conectar, aprender e fortalecer vínculos.',
   '[{"tipo":"foto","url":"https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/9a-edicao-2026-03/foto-1.jpg","legenda":"Quando mulheres se encontram, tudo muda"}]'::jsonb),
  ('ed-mai26', 'Edição de Maio', '2026-05-12', 'realizado', 'Goiânia, GO',
   'Idealizadoras da Tríade', 'Conexões reais entre mulheres empreendedoras', null, 5,
   'Mais uma tarde de conexões reais, com Lívia, Lia e Cris recebendo o grupo pessoalmente — prova de que o movimento que começou pequeno continua crescendo edição após edição.',
   '[{"tipo":"foto","url":"https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/edicao-2026-05/foto-1.jpg","legenda":"Lívia, Lia, Cris e convidadas"},{"tipo":"foto","url":"https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/edicao-2026-05/foto-2.jpg","legenda":"No cantinho da marca"}]'::jsonb),
  ('ed11-ago26', '11ª Edição', '2026-08-11', 'realizado', 'Goiânia, GO',
   'Idealizadoras da Tríade', 'Conexões que geram oportunidades, crescimento e pertencimento', null, 6,
   'A 11ª edição da Tríade Conecta reuniu quem já entendeu que crescer sozinha é mais lento — mais um encontro pra criar conexões reais e fortalecer negócios ao lado de quem compartilha do mesmo propósito.',
   '[{"tipo":"foto","url":"https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/11a-edicao-2026-08/foto-1.jpg","legenda":"Roda de conversa"},{"tipo":"foto","url":"https://zirrdajydxbydnyaebza.supabase.co/storage/v1/object/public/media/11a-edicao-2026-08/foto-2.jpg","legenda":"Lugar à mesa reservado"}]'::jsonb),
  ('jantar-casais-set26', 'Jantar da Tríade para Casais', '2026-09-30', 'em breve', 'Goiânia, GO',
   'Idealizadoras da Tríade', 'Uma noite para sair da rotina e se reconectar, às 19h', null, 7, null, '[]'::jsonb)
on conflict (id) do update set
  title = excluded.title,
  date = excluded.date,
  status = excluded.status,
  location = excluded.location,
  speaker = excluded.speaker,
  theme = excluded.theme,
  spots = excluded.spots,
  sort_order = excluded.sort_order,
  recap_text = excluded.recap_text,
  recap_media = excluded.recap_media;

insert into public.speakers (id, name, topic, bio, sort_order)
values
  ('sp1', 'Marcela Zaidem', 'Cultura e Gestão',
   'Especialista de renome nacional em cultura e gestão de pessoas.', 1),
  ('sp2', 'Danielle Gouveia', 'Gestão Financeira',
   'Referência em finanças aplicadas ao dia a dia de quem empreende.', 2),
  ('sp3', 'Dani Morais Flor', 'Relações Interpessoais',
   'Trabalha a escuta, a conexão genuína e o fortalecimento mútuo entre mulheres.', 3)
on conflict (id) do update set
  name = excluded.name,
  topic = excluded.topic,
  bio = excluded.bio,
  sort_order = excluded.sort_order;

insert into public.plans (id, name, price, period, featured, perks, sort_order)
values
  ('pl1', 'Convidada', 0, 'grátis', false, array[
    'Acesso à comunidade digital',
    'Conteúdo semanal sobre negócios e conexão',
    'Desconto no 1º encontro presencial'
  ], 1),
  ('pl2', 'Membra Tríade', 97, '/mês', true, array[
    'Tudo do plano Convidada',
    'Vaga garantida no encontro mensal',
    'Grupo exclusivo de trocas e indicações',
    'Descontos com marcas parceiras'
  ], 2),
  ('pl3', 'Fundadora', 970, '/ano', false, array[
    'Tudo do plano Membra Tríade',
    '2 meses grátis no plano anual',
    'Mentoria trimestral em grupo',
    'Prioridade em vagas VIP e brindes'
  ], 3)
on conflict (id) do update set
  name = excluded.name,
  price = excluded.price,
  period = excluded.period,
  featured = excluded.featured,
  perks = excluded.perks,
  sort_order = excluded.sort_order;

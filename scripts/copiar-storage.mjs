// Copia os ARQUIVOS do Storage de um projeto Supabase para outro.
//
// O dump do banco (workflow `migrar-supabase.yml`) leva os buckets e o
// registro de cada arquivo, mas não o arquivo em si — isso é este script.
// Roda no GitHub Actions, com as chaves service_role como secrets; nunca
// no navegador (R11).
//
//   OLD_SUPABASE_URL  OLD_SERVICE_ROLE_KEY  NEW_SUPABASE_URL  NEW_SERVICE_ROLE_KEY
import { createClient } from '@supabase/supabase-js';

const env = (nome) => {
  const v = process.env[nome];
  if (!v) throw new Error(`falta a variável ${nome}`);
  return v;
};
const opcoes = { auth: { persistSession: false } };
const antigo = createClient(env('OLD_SUPABASE_URL'), env('OLD_SERVICE_ROLE_KEY'), opcoes);
const novo = createClient(env('NEW_SUPABASE_URL'), env('NEW_SERVICE_ROLE_KEY'), opcoes);

/** Lista os arquivos de um bucket, entrando nas pastas. */
async function listar(bucket, pasta = '') {
  const arquivos = [];
  for (let offset = 0; ; offset += 100) {
    const { data, error } = await antigo.storage.from(bucket).list(pasta, { limit: 100, offset });
    if (error) throw error;
    for (const item of data) {
      const caminho = pasta ? `${pasta}/${item.name}` : item.name;
      // pasta não tem `id` na listagem do Storage
      if (item.id) arquivos.push(caminho);
      else arquivos.push(...(await listar(bucket, caminho)));
    }
    if (data.length < 100) return arquivos;
  }
}

const { data: buckets, error } = await antigo.storage.listBuckets();
if (error) throw error;

let falhas = 0;
for (const b of buckets) {
  // o dump já costuma trazer o bucket; criar de novo só falha com "já existe"
  await novo.storage.createBucket(b.id, {
    public: b.public,
    fileSizeLimit: b.file_size_limit ?? undefined,
    allowedMimeTypes: b.allowed_mime_types ?? undefined,
  });
  const arquivos = await listar(b.id);
  console.log(`bucket ${b.id}: ${arquivos.length} arquivo(s)`);
  for (const caminho of arquivos) {
    const { data: blob, error: e1 } = await antigo.storage.from(b.id).download(caminho);
    const { error: e2 } = e1
      ? { error: e1 }
      : await novo.storage
          .from(b.id)
          .upload(caminho, blob, { upsert: true, contentType: blob.type || undefined });
    if (e2) {
      falhas++;
      console.error(`  FALHOU ${caminho}: ${e2.message}`);
    } else console.log(`  ok ${caminho}`);
  }
}

if (falhas) {
  console.error(`${falhas} arquivo(s) não copiado(s) — rode de novo; o que já foi copiado é sobrescrito sem duplicar.`);
  process.exit(1);
}

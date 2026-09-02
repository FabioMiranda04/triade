import { useState } from 'react';
import type { FormEvent } from 'react';
import { EditSheet } from '@/components/EditSheet';
import { db } from '@/lib/db';
import { usePodeEditar } from '@/hooks/usePodeEditar';
import type { Plan } from '@/types';

interface PlanEditSheetProps {
  plan: Plan;
  onClose: () => void;
  onSaved: () => void;
}

/**
 * Formulário de edição de plano.
 *
 * Só edita, não cria: são três faixas fixas, e "novo plano" é decisão de
 * negócio que não deveria caber num botão.
 *
 * Único formulário do app **sem** o caminho local: preço só faz sentido se
 * valer para todo mundo. Uma sócia que corrige um valor no navegador dela e
 * acha que arrumou é pior do que não poder corrigir. Por isso ele só
 * aparece para quem tem permissão (`usePodeEditar` na tela).
 */
export function PlanEditSheet({ plan, onClose, onSaved }: PlanEditSheetProps) {
  const podeEditar = usePodeEditar();
  const [name, setName] = useState(plan.name);
  const [price, setPrice] = useState(plan.price);
  const [period, setPeriod] = useState(plan.period);
  const [featured, setFeatured] = useState(plan.featured);
  // uma vantagem por linha é o jeito mais direto de editar lista curta sem
  // inventar UI de itens arrastáveis
  const [perks, setPerks] = useState(plan.perks.join('\n'));
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (salvando) return;
    setErro(null);
    setSalvando(true);
    try {
      await db.savePlan({
        id: plan.id,
        name,
        price,
        period,
        featured,
        perks: perks
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean),
      });
      onSaved();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Não deu para salvar.');
      setSalvando(false);
    }
  }

  return (
    <EditSheet
      title={`Editar plano ${plan.name}`}
      onClose={onClose}
      onSubmit={(e) => void handleSubmit(e)}
      submitLabel={salvando ? 'Salvando…' : 'Salvar'}
      submitDisabled={salvando || !podeEditar}
      aviso="Preço e vantagens valem para todo mundo assim que você salvar."
      erro={erro}
    >
      <label className="field">
        <span>Nome</span>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label className="field">
        <span>Preço (0 = grátis)</span>
        <input
          type="number"
          min={0}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          required
        />
      </label>
      <label className="field">
        <span>Período</span>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="/mês">/mês</option>
          <option value="/ano">/ano</option>
          <option value="por edição">por edição</option>
        </select>
      </label>
      <label className="field">
        <span>Vantagens (uma por linha)</span>
        <textarea rows={5} value={perks} onChange={(e) => setPerks(e.target.value)} required />
      </label>
      <label className="field-inline">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
        <span>Destacar como "Mais escolhido"</span>
      </label>
    </EditSheet>
  );
}

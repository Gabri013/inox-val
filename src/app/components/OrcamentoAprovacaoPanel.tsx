import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

// Fluxo de aprovação/revisão de orçamentos
export function OrcamentoAprovacaoPanel({
  orcamento,
  usuarios = [],
  onAprovar,
  onRejeitar,
}: {
  orcamento: any;
  usuarios: Array<{ id: string; nome: string }>;
  onAprovar: (usuarioId: string) => void;
  onRejeitar: (usuarioId: string, motivo: string) => void;
}) {
  const [usuarioSelecionado, setUsuarioSelecionado] = useState('');
  const [motivoRejeicao, setMotivoRejeicao] = useState('');

  return (
    <Card className="p-6 space-y-4">
      <h2 className="text-xl font-bold">Aprovação/Revisão de Orçamento</h2>
      <div className="space-y-2">
        <label>Selecione o usuário responsável:</label>
        <select value={usuarioSelecionado} onChange={e => setUsuarioSelecionado(e.target.value)}>
          <option value="">-- Selecione --</option>
          {usuarios.map(u => (
            <option key={u.id} value={u.id}>{u.nome}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-4 mt-4">
        <Button disabled={!usuarioSelecionado} onClick={() => onAprovar(usuarioSelecionado)}>
          Aprovar Orçamento
        </Button>
        <Button disabled={!usuarioSelecionado || !motivoRejeicao} variant="destructive" onClick={() => onRejeitar(usuarioSelecionado, motivoRejeicao)}>
          Rejeitar Orçamento
        </Button>
      </div>
      <div className="mt-4">
        <label>Motivo da rejeição:</label>
        <input type="text" value={motivoRejeicao} onChange={e => setMotivoRejeicao(e.target.value)} placeholder="Descreva o motivo..." />
      </div>
    </Card>
  );
}

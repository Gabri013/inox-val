/**
 * Controle de Produção - Interface para operadores no chão de fábrica
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Progress } from '@/app/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Textarea } from '@/app/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/app/components/ui/dialog';
import {
  Factory,
  Search,
  ArrowRight,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Package,
  AlertTriangle,
  QrCode,
  Tv,
} from 'lucide-react';
import type { MaterialNecessario, ProducaoItem, SetorProducao } from '../producao.types';
import { useItensSetor, useMoverItem, useAtualizarStatus } from '../producao.hooks';
import { formatNumber } from '@/shared/lib/format';

const SETORES: { id: SetorProducao; nome: string; cor: string }[] = [
  { id: 'Corte', nome: 'Corte', cor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' },
  { id: 'Dobra', nome: 'Dobra', cor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100' },
  { id: 'Solda', nome: 'Solda', cor: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100' },
  { id: 'Acabamento', nome: 'Acabamento', cor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
  { id: 'Montagem', nome: 'Montagem', cor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' },
  { id: 'Qualidade', nome: 'Qualidade', cor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100' },
  { id: 'Expedicao', nome: 'Expedição', cor: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100' },
];

export default function ControleProducao() {
  const navigate = useNavigate();
  const [setorSelecionado, setSetorSelecionado] = useState<SetorProducao>('Corte');
  const [codigoBusca, setCodigoBusca] = useState('');
  const [itemSelecionado, setItemSelecionado] = useState<ProducaoItem | null>(null);
  const [showMateriais, setShowMateriais] = useState(false);
  const [showMovimentacao, setShowMovimentacao] = useState(false);
  const [observacoes, setObservacoes] = useState('');

  const { data: itens, isLoading } = useItensSetor(setorSelecionado);
  const moverItemMutation = useMoverItem();
  const atualizarStatusMutation = useAtualizarStatus();

  const handleBuscar = () => {
    // Implementar busca por código/QR
    console.log('Buscar:', codigoBusca);
  };

  const handleEntrada = (item: ProducaoItem) => {
    setItemSelecionado(item);
    setShowMovimentacao(true);
  };

  const handleSaida = (item: ProducaoItem) => {
    const setoresOrdem = SETORES.map((s) => s.id);
    const idx = setoresOrdem.indexOf(item.setorAtual);
    const proximo = idx >= 0 && idx < setoresOrdem.length - 1 ? setoresOrdem[idx + 1] : null;
    if (!proximo) {
      atualizarStatusMutation.mutate({ orderId: item.orderId, itemId: item.id, status: 'Concluido' });
      return;
    }
    moverItemMutation.mutate({
      orderId: item.orderId,
      itemId: item.id,
      novoSetor: proximo,
      setorAnterior: item.setorAtual,
    });
  };

  const handleConsultarMateriais = (item: ProducaoItem) => {
    setItemSelecionado(item);
    setShowMateriais(true);
  };

  const confirmarMovimentacao = () => {
    if (!itemSelecionado) return;

    atualizarStatusMutation.mutate({
      orderId: itemSelecionado.orderId,
      itemId: itemSelecionado.id,
      status: 'Em Producao',
    });

    setShowMovimentacao(false);
    setItemSelecionado(null);
    setObservacoes('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aguardando':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'Em Producao':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'Concluido':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'Rejeitado':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Controle de Produção"
        description="Gerencie entrada e saída de produtos nos setores"
        breadcrumbs={[
          { label: 'Início', href: '/' },
          { label: 'Controle de Produção' },
        ]}
        actions={
          <Button onClick={() => navigate('/dashboard-tv')} variant="outline">
            <Tv className="h-4 w-4 mr-2" />
            Dashboard TV
          </Button>
        }
      />

      {/* Busca Rápida */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Busca Rápida
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Digite o código do produto ou escaneie QR Code..."
                value={codigoBusca}
                onChange={(e) => setCodigoBusca(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
              />
            </div>
            <Button onClick={handleBuscar}>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
            <Button variant="outline">
              <QrCode className="h-4 w-4 mr-2" />
              Scanner
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Seleção de Setor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Selecione o Setor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {SETORES.map((setor) => (
              <Button
                key={setor.id}
                variant={setorSelecionado === setor.id ? 'default' : 'outline'}
                onClick={() => setSetorSelecionado(setor.id)}
                className="h-20 flex-col gap-2"
              >
                <Factory className="h-6 w-6" />
                <span className="text-sm">{setor.nome}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Itens no Setor */}
      <Card>
        <CardHeader>
          <CardTitle>
            Itens em {SETORES.find((s) => s.id === setorSelecionado)?.nome}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : !itens || itens.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum item neste setor</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(itens as ProducaoItem[]).map((item) => (
                <Card key={item.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono font-bold text-lg">
                            {item.produtoCodigo}
                          </span>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          {!item.materiaisDisponiveis && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Materiais Faltantes
                            </Badge>
                          )}
                        </div>

                        <h3 className="font-semibold text-lg mb-2">
                          {item.produtoNome}
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-muted-foreground">Ordem</p>
                            <p className="font-medium">{item.ordemId}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Quantidade</p>
                            <p className="font-medium">
                              {formatNumber(item.quantidade, 0)} {item.unidade}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Progresso</p>
                            <p className="font-medium">{item.progresso}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Tempo</p>
                            <p className="font-medium">
                              {item.tempoProducao ? `${item.tempoProducao} min` : '-'}
                            </p>
                          </div>
                        </div>

                        <Progress value={item.progresso} className="h-2 mb-4" />

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConsultarMateriais(item)}
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Materiais
                          </Button>

                          {item.status === 'Aguardando' && (
                            <Button
                              size="sm"
                              onClick={() => handleEntrada(item)}
                              disabled={!item.materiaisDisponiveis}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Iniciar
                            </Button>
                          )}

                          {item.status === 'Em Producao' && (
                            <Button
                              size="sm"
                              onClick={() => handleSaida(item)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Concluir
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Materiais */}
      <Dialog open={showMateriais} onOpenChange={setShowMateriais}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Materiais Necessários</DialogTitle>
            <DialogDescription>
              {itemSelecionado?.produtoCodigo} - {itemSelecionado?.produtoNome}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {(itemSelecionado?.materiaisNecessarios || []).map((material: MaterialNecessario) => (
              <div
                key={material.produtoId}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-mono font-medium">{material.produtoCodigo}</p>
                  <p className="text-sm text-muted-foreground">
                    {material.produtoNome}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-medium">
                    {formatNumber(material.quantidadeNecessaria, 2)} {material.unidade}
                  </p>
                  <p className="text-sm">
                    <span
                      className={
                        material.faltante > 0
                          ? 'text-red-600'
                          : 'text-green-600'
                      }
                    >
                      {material.faltante > 0
                        ? `Faltam ${formatNumber(material.faltante, 2)}`
                        : 'Disponível'}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowMateriais(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Movimentação */}
      <Dialog open={showMovimentacao} onOpenChange={setShowMovimentacao}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar Produção</DialogTitle>
            <DialogDescription>
              Confirme o início da produção no setor {setorSelecionado}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Produto</Label>
              <p className="font-medium">
                {itemSelecionado?.produtoCodigo} - {itemSelecionado?.produtoNome}
              </p>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Adicione observações sobre o início da produção..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMovimentacao(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarMovimentacao}>
              <Play className="h-4 w-4 mr-2" />
              Iniciar Produção
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

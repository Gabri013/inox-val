/**
 * Página: Central de Ajuda
 * Tutoriais, guias e FAQs para ajudar os usuários
 */

import { useState } from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  Video, 
  FileText, 
  Search,
  ChevronRight,
  Users,
  Package,
  Warehouse,
  Calculator,
  ClipboardList,
  ShoppingCart,
  Settings,
  Play
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/app/components/ui/accordion';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Separator } from '@/app/components/ui/separator';

interface Tutorial {
  id: string;
  titulo: string;
  descricao: string;
  duracao: string;
  icon: any;
  passos: string[];
}

interface FAQ {
  pergunta: string;
  resposta: string;
}

export default function Ajuda() {
  void ClipboardList;
  void ShoppingCart;
  void Button;
  void Separator;
  const [searchTerm, setSearchTerm] = useState('');

  const tutoriais: Tutorial[] = [
    {
      id: 'clientes',
      titulo: 'Como Gerenciar Clientes',
      descricao: 'Aprenda a cadastrar, editar e gerenciar seus clientes',
      duracao: '3 min',
      icon: Users,
      passos: [
        'Acesse o menu "Clientes" na barra lateral',
        'Clique no botão "Novo Cliente" no canto superior direito',
        'Preencha os dados: Nome, CNPJ/CPF, E-mail, Telefone e Endereço',
        'Clique em "Salvar" para finalizar o cadastro',
        'Use a barra de pesquisa para encontrar clientes cadastrados',
        'Clique em "Editar" ou "Excluir" para gerenciar os registros'
      ]
    },
    {
      id: 'produtos',
      titulo: 'Como Cadastrar Produtos',
      descricao: 'Gerencie seu catálogo de produtos',
      duracao: '2 min',
      icon: Package,
      passos: [
        'Acesse "Produtos" no menu lateral',
        'Clique em "Novo Produto"',
        'Preencha: Nome, SKU, Categoria e Descrição',
        'Defina o preço de venda',
        'Adicione as dimensões e peso (se aplicável)',
        'Salve o produto',
        'Use filtros para organizar por categoria'
      ]
    },
    {
      id: 'estoque',
      titulo: 'Como Controlar o Estoque',
      descricao: 'Monitore saldos e movimentações',
      duracao: '4 min',
      icon: Warehouse,
      passos: [
        'Acesse "Estoque" no menu',
        'Visualize os saldos atuais de cada produto',
        'Use a aba "Movimentações" para ver o histórico',
        'Clique em "Nova Movimentação" para registrar entrada/saída',
        'Selecione o tipo: Entrada, Saída, Ajuste ou Transferência',
        'Preencha quantidade, produto e observações',
        'Salve para atualizar o estoque automaticamente'
      ]
    },
    {
      id: 'calculadora',
      titulo: 'Como Usar a Calculadora de Bancadas',
      descricao: 'Calcule materiais automaticamente',
      duracao: '5 min',
      icon: Calculator,
      passos: [
        'Acesse "Calculadora BOM" no menu',
        'Clique em "Nova Bancada"',
        'Escolha o modelo: Simples, Com Cuba, Com Prateleira ou Personalizada',
        'Preencha as dimensões (Largura, Profundidade, Altura)',
        'Configure o material nas "Minhas Configurações" (Inox 304, 316, etc.)',
        'Selecione acabamento (Escovado ou Polido) e espessura',
        'Clique em "Calcular" para gerar o BOM automaticamente',
        'Visualize as peças cortadas no "Visualizador de Nesting"',
        'Exporte ou salve o orçamento'
      ]
    },
    {
      id: 'configuracoes',
      titulo: 'Como Configurar Preços',
      descricao: 'Configure sua tabela de preços personalizada',
      duracao: '3 min',
      icon: Settings,
      passos: [
        'Clique no seu nome no canto superior direito',
        'Selecione "Minhas Configurações"',
        'Na aba "Preços de Material", configure o preço/kg de cada inox',
        'Defina sua margem de lucro padrão (%)',
        'Configure o custo de mão de obra (R$/hora)',
        'Na aba "Preferências", escolha material e acabamento padrão',
        'Na aba "Embalagem", configure custos de cada tipo',
        'Clique em "Salvar Alterações"',
        'Essas configurações serão usadas em todos os seus orçamentos'
      ]
    }
  ];

  const faqs: FAQ[] = [
    {
      pergunta: 'Como faço para criar um novo orçamento?',
      resposta: 'Acesse "Orçamentos" no menu lateral e clique em "Novo Orçamento". Preencha os dados do cliente, adicione os produtos e o sistema calculará automaticamente o valor total.'
    },
    {
      pergunta: 'Posso alterar os preços dos materiais depois de salvar uma configuração?',
      resposta: 'Sim! Suas configurações podem ser alteradas a qualquer momento em "Minhas Configurações". As alterações afetarão apenas novos orçamentos, não os já criados.'
    },
    {
      pergunta: 'Como funciona o cálculo de nesting?',
      resposta: 'O sistema usa algoritmos profissionais para distribuir as peças cortadas na chapa de forma otimizada, minimizando desperdício de material. Você pode visualizar o resultado no "Visualizador de Nesting".'
    },
    {
      pergunta: 'O que é BOM (Bill of Materials)?',
      resposta: 'BOM é a Lista de Materiais - um documento que lista todos os componentes, peças e matérias-primas necessárias para fabricar um produto. O sistema gera isso automaticamente ao calcular uma bancada.'
    },
    {
      pergunta: 'Como usar a Calculadora Rápida sem poluir o sistema?',
      resposta: 'Acesse "Calculadora Rápida" no menu. Lá você pode fazer cálculos de teste (peso, densidade, área) sem salvar nada no sistema. Use para dar uma ideia rápida ao cliente sem criar registros.'
    },
    {
      pergunta: 'Posso excluir um cliente ou produto?',
      resposta: 'Sim, mas apenas se não houver registros vinculados (orçamentos, ordens de produção, etc). Se houver, recomendamos marcar como inativo ao invés de excluir.'
    },
    {
      pergunta: 'Como sei qual tipo de inox usar?',
      resposta: 'Inox 304 é o padrão (resistente e versátil), 316 é premium (mais resistente à corrosão, ideal para ambientes marinhos), 430 é magnético (mais barato, menos resistente), e 201 é econômico (uso básico).'
    },
    {
      pergunta: 'Qual a diferença entre acabamento escovado e polido?',
      resposta: 'Escovado tem textura fosca com linhas sutis (mais comum, esconde arranhões). Polido é brilhante como espelho (visual premium, mostra mais marcas). O custo do polido é geralmente maior.'
    },
    {
      pergunta: 'O sistema calcula o peso da bancada automaticamente?',
      resposta: 'Sim! Com base no material (densidade do inox), espessura da chapa e dimensões, o sistema calcula o peso total automaticamente.'
    },
    {
      pergunta: 'Posso ter múltiplas configurações de preço?',
      resposta: 'Cada vendedor tem sua própria configuração salva. Se você quiser testar diferentes margens, use a "Calculadora Rápida" para simular sem alterar sua configuração principal.'
    }
  ];

  const guiasRapidos = [
    {
      titulo: 'Fluxo de Vendas',
      etapas: [
        'Cliente solicita orçamento',
        'Use a Calculadora Rápida para dar uma ideia inicial',
        'Crie um Orçamento formal no sistema',
        'Cliente aprova → Gere Ordem de Produção',
        'Produção usa o BOM para fabricar',
        'Registre saída no Estoque',
        'Finalize a venda'
      ]
    },
    {
      titulo: 'Fluxo de Produção',
      etapas: [
        'Recebe Ordem de Produção do Comercial',
        'Acessa o BOM (lista de materiais)',
        'Visualiza nesting (cortes otimizados)',
        'Separa materiais do estoque',
        'Fabrica conforme especificações',
        'Registra conclusão',
        'Atualiza estoque de produtos acabados'
      ]
    }
  ];

  const filteredTutoriais = tutoriais.filter(t => 
    t.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFaqs = faqs.filter(f => 
    f.pergunta.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.resposta.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <HelpCircle className="w-8 h-8" />
          Central de Ajuda
        </h1>
        <p className="text-muted-foreground mt-1">
          Aprenda a usar o sistema e encontre respostas para suas dúvidas
        </p>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar tutoriais, guias ou perguntas frequentes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="tutoriais" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tutoriais">
            <Video className="w-4 h-4 mr-2" />
            Tutoriais
          </TabsTrigger>
          <TabsTrigger value="guias">
            <BookOpen className="w-4 h-4 mr-2" />
            Guias Rápidos
          </TabsTrigger>
          <TabsTrigger value="faq">
            <FileText className="w-4 h-4 mr-2" />
            Perguntas Frequentes
          </TabsTrigger>
        </TabsList>

        {/* Tab: Tutoriais */}
        <TabsContent value="tutoriais" className="space-y-4">
          {filteredTutoriais.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Nenhum tutorial encontrado para "{searchTerm}"
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTutoriais.map((tutorial) => {
                const Icon = tutorial.icon;
                return (
                  <Card key={tutorial.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{tutorial.titulo}</CardTitle>
                            <CardDescription>{tutorial.descricao}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary">{tutorial.duracao}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="passos" className="border-none">
                          <AccordionTrigger className="text-sm font-medium hover:no-underline py-2">
                            <div className="flex items-center gap-2">
                              <Play className="w-4 h-4" />
                              Ver Passo a Passo ({tutorial.passos.length} etapas)
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <ol className="space-y-3 mt-2">
                              {tutorial.passos.map((passo, index) => (
                                <li key={index} className="flex gap-3">
                                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                    {index + 1}
                                  </div>
                                  <p className="text-sm text-muted-foreground flex-1">{passo}</p>
                                </li>
                              ))}
                            </ol>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab: Guias Rápidos */}
        <TabsContent value="guias" className="space-y-6">
          {guiasRapidos.map((guia, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {guia.titulo}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {guia.etapas.map((etapa, i) => (
                    <div key={i} className="flex items-center gap-3 flex-1">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{etapa}</p>
                      </div>
                      {i < guia.etapas.length - 1 && (
                        <ChevronRight className="w-5 h-5 text-muted-foreground hidden md:block flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

        </TabsContent>

        {/* Tab: FAQ */}
        <TabsContent value="faq" className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Nenhuma pergunta encontrada para "{searchTerm}"
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Perguntas Frequentes</CardTitle>
                <CardDescription>
                  Encontre respostas rápidas para as dúvidas mais comuns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  {filteredFaqs.map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`} className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline text-left">
                        <span className="font-medium">{faq.pergunta}</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground">{faq.resposta}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

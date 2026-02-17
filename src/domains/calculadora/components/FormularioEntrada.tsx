/**
 * Formulário de Entrada da Calculadora Rápida
 * 
 * IMPORTANTE: Este formulário usa EXCLUSIVAMENTE os modelos parametrizados de /src/bom/models
 * O vendedor NÃO pode criar produtos livres - apenas selecionar modelos existentes
 */

import { useState } from 'react';
import { MODELOS_BOM, type ModeloBOM } from '../../../bom/models';
import type { MesaConfig } from '../../../bom/types';
import {
  type EntradaCalculadora,
  type DadosPrecificacao,
  VALORES_PADRAO,
} from '../types';

interface FormularioEntradaProps {
  onCalcular: (entrada: EntradaCalculadora) => void;
  carregando?: boolean;
}

export function FormularioEntrada({ onCalcular, carregando }: FormularioEntradaProps) {
  // Estados do formulário
  const [modeloSelecionado, setModeloSelecionado] = useState<ModeloBOM>(
    MODELOS_BOM[0].value
  );
  
  const [config, setConfig] = useState<MesaConfig>({
    l: 1500, // comprimento
    c: 700, // largura
    h: 900, // altura
    material: 'INOX_304',
    contraventada: true,
    numPes: 4,
    temPrateleira: false,
    prateleiraLisa: true,
    espelhoTraseiro: false,
    espelhoEsquerdo: false,
    espelhoDireito: false,
    temCuba: false,
    temBordaAgua: false,
    tipoBancada: 'CENTRO',
  });
  
  const [precificacao, setPrecificacao] = useState<DadosPrecificacao>(VALORES_PADRAO);

  const modeloInfo = MODELOS_BOM.find(m => m.value === modeloSelecionado);
  void modeloInfo;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entrada: EntradaCalculadora = {
      modelo: modeloSelecionado,
      config,
      precificacao,
    };
    
    onCalcular(entrada);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* AVISO IMPORTANTE */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3 dark:bg-yellow-950 dark:border-yellow-800">
        <Info className="w-5 h-5 text-yellow-700 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800 dark:text-yellow-200">
          <div className="font-medium mb-1">Sistema de Modelos Parametrizados</div>
          <div>
            Você deve selecionar um dos modelos existentes. O sistema não permite criação de produtos livres.
            Todos os cálculos são baseados nos modelos de engenharia pré-definidos.
          </div>
        </div>
      </div>

      {/* SEÇÃO 1: MODELO DO PRODUTO */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="font-semibold mb-4">1. Modelo do Produto</h3>
        
        {/* Agrupar por categoria */}
        {Array.from(new Set(MODELOS_BOM.map(m => m.categoria))).map(categoria => (
          <div key={categoria} className="mb-6 last:mb-0">
            <div className="text-sm font-medium text-muted-foreground mb-3">{categoria}</div>
            <div className="grid grid-cols-1 gap-3">
              {MODELOS_BOM.filter(m => m.categoria === categoria).map((modelo) => (
                <button
                  key={modelo.value}
                  type="button"
                  onClick={() => {
                    setModeloSelecionado(modelo.value);
                    // Ajustar configuração baseada no modelo
                    const numPes = modelo.value.includes('6') ? 6 : 4;
                    setConfig(prev => ({
                      ...prev,
                      numPes,
                      contraventada: modelo.label.includes('Contraventada'),
                      temPrateleira: modelo.label.includes('Prateleira'),
                      tipoBancada: modelo.label.includes('Centro') ? 'CENTRO' : 'ENCOSTO',
                      espelhoTraseiro: modelo.label.includes('Encosto') || modelo.label.includes('Espelho'),
                      temCuba: modelo.label.includes('Cuba'),
                    }));
                  }}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    modeloSelecionado === modelo.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <div className="font-medium text-sm">{modelo.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{modelo.descricao}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* SEÇÃO 2: DIMENSÕES */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="font-semibold mb-4">2. Dimensões (mm)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Comprimento (L)
            </label>
            <input
              type="number"
              value={config.l}
              onChange={(e) => setConfig({ ...config, l: Number(e.target.value) })}
              min="500"
              max="5000"
              step="50"
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-xs text-neutral-500 mt-1 block">
              500mm - 5000mm
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Largura (C)
            </label>
            <input
              type="number"
              value={config.c}
              onChange={(e) => setConfig({ ...config, c: Number(e.target.value) })}
              min="400"
              max="1500"
              step="50"
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-xs text-neutral-500 mt-1 block">
              400mm - 1500mm
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Altura (H)
            </label>
            <input
              type="number"
              value={config.h}
              onChange={(e) => setConfig({ ...config, h: Number(e.target.value) })}
              min="700"
              max="1200"
              step="50"
              required
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-xs text-neutral-500 mt-1 block">
              700mm - 1200mm
            </span>
          </div>
        </div>

        {/* Visualização das dimensões */}
        <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
          <div className="text-sm text-neutral-600">
            Dimensões configuradas:{' '}
            <span className="font-medium text-neutral-900">
              L{config.l} × C{config.c} × A{config.h} mm
            </span>
          </div>
        </div>
      </div>

      {/* SEÇÃO 3: OPÇÕES DO MODELO */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h3 className="font-semibold mb-4">3. Configurações do Modelo</h3>
        
        <div className="space-y-4">
          {/* Material */}
          <div>
            <label className="block text-sm font-medium mb-2">Material</label>
            <select
              value={config.material}
              onChange={(e) => setConfig({ ...config, material: e.target.value as 'INOX_304' | 'INOX_430' })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="INOX_304">Inox 304 (Padrão)</option>
              <option value="INOX_430">Inox 430 (Econômico)</option>
            </select>
          </div>

          {/* Número de pés */}
          <div>
            <label className="block text-sm font-medium mb-2">Estrutura</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setConfig({ ...config, numPes: 4 })}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                  config.numPes === 4
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="font-medium">4 Pés</div>
                <div className="text-xs text-neutral-600 mt-1">Até 2000mm</div>
              </button>
              <button
                type="button"
                onClick={() => setConfig({ ...config, numPes: 6 })}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                  config.numPes === 6
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="font-medium">6 Pés</div>
                <div className="text-xs text-neutral-600 mt-1">Acima de 2000mm</div>
              </button>
            </div>
          </div>

          {/* Opções Booleanas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.contraventada}
                onChange={(e) => setConfig({ ...config, contraventada: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-sm">
                <div className="font-medium">Contraventada</div>
                <div className="text-xs text-neutral-600">Reforços estruturais</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.temPrateleira}
                onChange={(e) => setConfig({ ...config, temPrateleira: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-sm">
                <div className="font-medium">Prateleira</div>
                <div className="text-xs text-neutral-600">Prateleira inferior</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.espelhoTraseiro}
                onChange={(e) => setConfig({ ...config, espelhoTraseiro: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-sm">
                <div className="font-medium">Espelho Traseiro</div>
                <div className="text-xs text-neutral-600">Proteção de parede</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.temCuba}
                onChange={(e) => setConfig({ ...config, temCuba: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-sm">
                <div className="font-medium">Cuba</div>
                <div className="text-xs text-neutral-600">Cuba embutida</div>
              </div>
            </label>
          </div>

          {/* Posição da Cuba */}
          {config.temCuba && (
            <div>
              <label className="block text-sm font-medium mb-2">Posição da Cuba</label>
              <div className="flex gap-2">
                {(['ESQUERDA', 'CENTRO', 'DIREITA'] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setConfig({ ...config, posicaoCuba: pos })}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 capitalize transition-colors ${
                      config.posicaoCuba === pos
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    {pos.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SEÇÃO 4: PRECIFICAÇÃO */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h3 className="font-semibold mb-4">4. Dados de Precificação</h3>
        
        <div className="space-y-6">
          {/* Preços de Material */}
          <div>
            <label className="block text-sm font-medium mb-2">Preços de Materiais</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Inox 304 (R$/kg)</label>
                <input
                  type="number"
                  value={precificacao.precoKgInox304 || ''}
                  onChange={(e) =>
                    setPrecificacao({
                      ...precificacao,
                      precoKgInox304: Number(e.target.value),
                    })
                  }
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-600 mb-1">Inox 430 (R$/kg)</label>
                <input
                  type="number"
                  value={precificacao.precoKgInox430 || ''}
                  onChange={(e) =>
                    setPrecificacao({
                      ...precificacao,
                      precoKgInox430: Number(e.target.value),
                    })
                  }
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-600 mb-1">Tubo Ø38 (R$/m)</label>
                <input
                  type="number"
                  value={precificacao.precoMetroTubo38 || ''}
                  onChange={(e) =>
                    setPrecificacao({
                      ...precificacao,
                      precoMetroTubo38: Number(e.target.value),
                    })
                  }
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Margens */}
          <div>
            <label className="block text-sm font-medium mb-2">Margens e Custos Adicionais</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-neutral-600 mb-1">
                  Perda de Material (%)
                </label>
                <input
                  type="number"
                  value={precificacao.perdaMaterial}
                  onChange={(e) =>
                    setPrecificacao({
                      ...precificacao,
                      perdaMaterial: Number(e.target.value),
                    })
                  }
                  step="1"
                  min="0"
                  max="50"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-600 mb-1">
                  Custo Mão de Obra (R$)
                </label>
                <input
                  type="number"
                  value={precificacao.custoMaoObra || ''}
                  onChange={(e) =>
                    setPrecificacao({
                      ...precificacao,
                      custoMaoObra: Number(e.target.value),
                    })
                  }
                  step="0.01"
                  min="0"
                  placeholder="200.00"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-600 mb-1">
                  Margem de Lucro (%)
                </label>
                <input
                  type="number"
                  value={precificacao.margemLucro}
                  onChange={(e) =>
                    setPrecificacao({
                      ...precificacao,
                      margemLucro: Number(e.target.value),
                    })
                  }
                  step="1"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTÃO CALCULAR */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => {
            setPrecificacao(VALORES_PADRAO);
          }}
          className="px-6 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          Resetar Preços
        </button>

        <button
          type="submit"
          disabled={carregando}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {carregando ? 'Calculando...' : 'Calcular Orçamento'}
        </button>
      </div>
    </form>
  );
}

/**
 * MODAL PARA SALVAR PROJETO
 * Interface para salvar projeto atual com nome, descrição e tags
 */

import { useState } from "react";
import { X, Save, Tag } from "lucide-react";

interface Props {
  nomeInicial?: string;
  onSalvar: (dados: { nome: string; descricao?: string; tags?: string[] }) => void;
  onFechar: () => void;
}

export function ModalSalvarProjeto({ nomeInicial = "", onSalvar, onFechar }: Props) {
  const [nome, setNome] = useState(nomeInicial);
  const [descricao, setDescricao] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const handleAdicionarTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoverTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSalvar = () => {
    if (!nome.trim()) {
      alert("Digite um nome para o projeto!");
      return;
    }

    onSalvar({
      nome: nome.trim(),
      descricao: descricao.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Salvar Projeto</h2>
          <button onClick={onFechar} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-5">
          {/* Nome */}
          <div>
            <label className="block mb-2">
              <span className="text-sm font-semibold text-slate-700">
                Nome do Projeto <span className="text-red-600">*</span>
              </span>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Mesa Restaurante #042"
                className="mt-1 w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                autoFocus
              />
            </label>
          </div>

          {/* Descrição */}
          <div>
            <label className="block mb-2">
              <span className="text-sm font-semibold text-slate-700">Descrição (opcional)</span>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Bancada inox para cozinha industrial do cliente XYZ"
                className="mt-1 w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
                rows={3}
              />
            </label>
          </div>

          {/* Tags */}
          <div>
            <label className="block mb-2">
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags (opcional)
              </span>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAdicionarTag();
                    }
                  }}
                  placeholder="Digite uma tag e pressione Enter"
                  className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={handleAdicionarTag}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium text-slate-700 transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </label>

            {/* Lista de Tags */}
            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                    {tag}
                    <button
                      onClick={() => handleRemoverTag(tag)}
                      className="hover:bg-purple-200 rounded p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onFechar}
            className="px-4 py-2.5 border-2 border-slate-300 rounded-lg hover:bg-slate-100 transition-colors font-semibold text-slate-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors font-semibold shadow-sm"
          >
            <Save className="w-4 h-4" />
            Salvar Projeto
          </button>
        </div>
      </div>
    </div>
  );
}

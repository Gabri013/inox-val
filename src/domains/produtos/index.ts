/**
 * Domínio: Produtos
 * Exportações públicas
 */

export * from './produtos.types';
export * from './produtos.schema';
export * from './produtos.service';
export * from './produtos.hooks';
export * from './produtos.seed';
export { default as ProdutosList } from './pages/ProdutosList';
export { default as ProdutoForm } from './pages/ProdutoForm';
export { default as ProdutoDetail } from './pages/ProdutoDetail';


import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente (do sistema ou arquivos .env)
  // O terceiro argumento '' permite carregar variáveis que não começam com VITE_
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    define: {
      // Isso injeta o valor da API_KEY durante o build para que o navegador possa ler
      // Adicionamos || '' para garantir que nunca seja undefined/null, evitando erros de runtime
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      // Previne erro de "process is not defined" em algumas bibliotecas
      'process.env': {}
    }
  };
});

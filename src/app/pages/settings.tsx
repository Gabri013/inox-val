import { motion } from 'motion/react';
import { Settings as SettingsIcon } from 'lucide-react';

export function Settings() {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #2962FF 0%, #00C8FF 100%)',
              boxShadow: '0 0 20px rgba(41, 98, 255, 0.35)',
            }}
          >
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 style={{ color: '#E6EDF7' }}>Configurações</h1>
            <p className="text-lg mt-1" style={{ color: '#A9B4C6' }}>
              Configurações do sistema e preferências
            </p>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center py-32"
      >
        <div className="text-center">
          <SettingsIcon className="w-24 h-24 mx-auto mb-6" style={{ color: '#2A3448' }} />
          <h3 className="text-2xl font-semibold mb-2" style={{ color: '#E6EDF7' }}>
            Módulo em Desenvolvimento
          </h3>
          <p style={{ color: '#A9B4C6' }}>
            Esta funcionalidade estará disponível em breve
          </p>
        </div>
      </motion.div>
    </div>
  );
}

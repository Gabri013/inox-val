import { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator as CalcIcon, Info, ArrowRight, Check } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const steelTypes = [
  { id: 'inox304', name: 'Inox 304', density: 7.93, pricePerKg: 28.50 },
  { id: 'inox316l', name: 'Inox 316L', density: 8.00, pricePerKg: 45.80 },
  { id: 'inox430', name: 'Inox 430', density: 7.70, pricePerKg: 22.90 },
];

export function Calculator() {
  const [steelType, setSteelType] = useState('inox304');
  const [thickness, setThickness] = useState('');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [quantity, setQuantity] = useState('1');

  const selectedSteel = steelTypes.find(s => s.id === steelType);
  
  // Cálculo do peso: Volume (m³) = (comp * larg * esp) / 1.000.000.000
  // Peso (kg) = Volume * Densidade * Quantidade
  const calculatedWeight = thickness && length && width
    ? ((parseFloat(length) * parseFloat(width) * parseFloat(thickness)) / 1000000000) * 
      (selectedSteel?.density || 0) * 
      parseInt(quantity || '1')
    : 0;

  const calculatedPrice = calculatedWeight * (selectedSteel?.pricePerKg || 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #2962FF 0%, #00C8FF 100%)',
              boxShadow: '0 0 20px rgba(41, 98, 255, 0.35)',
            }}
          >
            <CalcIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 style={{ color: '#E6EDF7' }}>Novo Cálculo</h1>
            <p className="text-lg mt-1" style={{ color: '#A9B4C6' }}>
              Sistema de cálculo de peso e preço de chapas de aço inox
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card 
            className="rounded-xl border"
            style={{
              background: '#1A2233',
              borderColor: '#2A3448',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
            }}
          >
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-6" style={{ color: '#E6EDF7' }}>
                Dados do Cálculo
              </h3>

              <div className="space-y-6">
                {/* Steel Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2" style={{ color: '#E6EDF7' }}>
                    Tipo de Aço
                    <Info className="w-4 h-4" style={{ color: '#5F6C80' }} />
                  </Label>
                  <Select value={steelType} onValueChange={setSteelType}>
                    <SelectTrigger 
                      className="h-12 rounded-lg border"
                      style={{
                        background: '#121826',
                        borderColor: '#2A3448',
                        color: '#E6EDF7',
                      }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent 
                      className="rounded-lg border"
                      style={{
                        background: '#121826',
                        borderColor: '#2A3448',
                      }}
                    >
                      {steelTypes.map((steel) => (
                        <SelectItem 
                          key={steel.id} 
                          value={steel.id}
                          className="focus:bg-opacity-10"
                          style={{ color: '#E6EDF7' }}
                        >
                          {steel.name} - R$ {steel.pricePerKg}/kg
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Thickness */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium" style={{ color: '#E6EDF7' }}>
                    Espessura (mm)
                  </Label>
                  <Input
                    type="number"
                    placeholder="Ex: 3.0"
                    value={thickness}
                    onChange={(e) => setThickness(e.target.value)}
                    className="h-12 rounded-lg border"
                    style={{
                      background: '#121826',
                      borderColor: '#2A3448',
                      color: '#E6EDF7',
                    }}
                  />
                </div>

                {/* Dimensions */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium" style={{ color: '#E6EDF7' }}>
                      Comprimento (mm)
                    </Label>
                    <Input
                      type="number"
                      placeholder="Ex: 2000"
                      value={length}
                      onChange={(e) => setLength(e.target.value)}
                      className="h-12 rounded-lg border"
                      style={{
                        background: '#121826',
                        borderColor: '#2A3448',
                        color: '#E6EDF7',
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium" style={{ color: '#E6EDF7' }}>
                      Largura (mm)
                    </Label>
                    <Input
                      type="number"
                      placeholder="Ex: 1000"
                      value={width}
                      onChange={(e) => setWidth(e.target.value)}
                      className="h-12 rounded-lg border"
                      style={{
                        background: '#121826',
                        borderColor: '#2A3448',
                        color: '#E6EDF7',
                      }}
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium" style={{ color: '#E6EDF7' }}>
                    Quantidade
                  </Label>
                  <Input
                    type="number"
                    placeholder="Ex: 10"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="h-12 rounded-lg border"
                    style={{
                      background: '#121826',
                      borderColor: '#2A3448',
                      color: '#E6EDF7',
                    }}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <motion.div 
                    className="flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      className="w-full h-12 rounded-lg font-semibold flex items-center justify-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, #2962FF 0%, #00C8FF 100%)',
                        boxShadow: '0 0 20px rgba(41, 98, 255, 0.35)',
                        color: 'white',
                      }}
                    >
                      <Check className="w-5 h-5" />
                      Gerar Orçamento
                    </Button>
                  </motion.div>
                  
                  <Button 
                    variant="outline"
                    className="h-12 px-6 rounded-lg border"
                    style={{
                      borderColor: '#2A3448',
                      color: '#A9B4C6',
                    }}
                  >
                    Limpar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column - 3D Result Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card 
            className="rounded-xl border"
            style={{
              background: '#1A2233',
              borderColor: '#2A3448',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
            }}
          >
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-6" style={{ color: '#E6EDF7' }}>
                Resultado do Cálculo
              </h3>

              {/* 3D Visualization */}
              <div 
                className="relative rounded-lg mb-6 overflow-hidden"
                style={{
                  height: '280px',
                  background: 'linear-gradient(135deg, #0B0F14 0%, #121826 100%)',
                  border: '1px solid #2A3448',
                }}
              >
                {/* Grid Background */}
                <div 
                  className="absolute inset-0"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(41, 98, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(41, 98, 255, 0.1) 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                  }}
                />

                {/* 3D Sheet Representation */}
                <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: '800px' }}>
                  <motion.div
                    animate={{
                      rotateX: [0, 5, 0],
                      rotateY: [0, -10, 0],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="relative rounded-lg"
                    style={{
                      width: '200px',
                      height: '140px',
                      background: 'linear-gradient(135deg, #2962FF 0%, #00C8FF 100%)',
                      boxShadow: '0 20px 60px rgba(41, 98, 255, 0.4), inset 0 -5px 20px rgba(0, 0, 0, 0.3)',
                      transformStyle: 'preserve-3d',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    {/* Shine effect */}
                    <div 
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
                      }}
                    />
                    
                    {/* Dimensions Label */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xs font-mono text-white opacity-70">
                          {length || '____'} x {width || '____'}mm
                        </p>
                        <p className="text-lg font-bold text-white mt-1">
                          {thickness || '__'}mm
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Technical Indicators */}
                <div className="absolute top-4 left-4">
                  <div 
                    className="px-3 py-1 rounded-md text-xs font-medium"
                    style={{
                      background: 'rgba(41, 98, 255, 0.2)',
                      border: '1px solid rgba(41, 98, 255, 0.3)',
                      color: '#00C8FF',
                    }}
                  >
                    {selectedSteel?.name}
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="space-y-4">
                {/* Weight */}
                <div 
                  className="p-6 rounded-lg border"
                  style={{
                    background: 'rgba(41, 98, 255, 0.05)',
                    borderColor: 'rgba(41, 98, 255, 0.2)',
                  }}
                >
                  <p className="text-sm mb-2" style={{ color: '#A9B4C6' }}>Peso Total</p>
                  <motion.p 
                    className="text-4xl font-bold"
                    key={calculatedWeight}
                    initial={{ scale: 1.2, color: '#00C8FF' }}
                    animate={{ scale: 1, color: '#E6EDF7' }}
                    style={{ color: '#E6EDF7' }}
                  >
                    {calculatedWeight.toFixed(2)} kg
                  </motion.p>
                </div>

                {/* Price */}
                <div 
                  className="p-6 rounded-lg border"
                  style={{
                    background: 'rgba(255, 109, 0, 0.05)',
                    borderColor: 'rgba(255, 109, 0, 0.2)',
                  }}
                >
                  <p className="text-sm mb-2" style={{ color: '#A9B4C6' }}>Valor Total</p>
                  <motion.p 
                    className="text-4xl font-bold"
                    key={calculatedPrice}
                    initial={{ scale: 1.2, color: '#FF6D00' }}
                    animate={{ scale: 1, color: '#E6EDF7' }}
                    style={{ color: '#E6EDF7' }}
                  >
                    R$ {calculatedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </motion.p>
                </div>

                {/* Technical Info */}
                <div 
                  className="p-4 rounded-lg"
                  style={{
                    background: '#121826',
                    border: '1px solid #2A3448',
                  }}
                >
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p style={{ color: '#5F6C80' }}>Densidade</p>
                      <p className="font-semibold" style={{ color: '#E6EDF7' }}>
                        {selectedSteel?.density} g/cm³
                      </p>
                    </div>
                    <div>
                      <p style={{ color: '#5F6C80' }}>Preço/kg</p>
                      <p className="font-semibold" style={{ color: '#E6EDF7' }}>
                        R$ {selectedSteel?.pricePerKg}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: '#5F6C80' }}>Quantidade</p>
                      <p className="font-semibold" style={{ color: '#E6EDF7' }}>
                        {quantity} unidade(s)
                      </p>
                    </div>
                    <div>
                      <p style={{ color: '#5F6C80' }}>Área Total</p>
                      <p className="font-semibold" style={{ color: '#E6EDF7' }}>
                        {length && width 
                          ? ((parseFloat(length) * parseFloat(width) * parseInt(quantity)) / 1000000).toFixed(2)
                          : '0.00'
                        } m²
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Reference Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card 
          className="rounded-xl border"
          style={{
            background: '#1A2233',
            borderColor: '#2A3448',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
          }}
        >
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#E6EDF7' }}>
              Tabela de Referência Rápida
            </h3>

            <div className="grid grid-cols-3 gap-4">
              {steelTypes.map((steel) => (
                <div 
                  key={steel.id}
                  className="p-4 rounded-lg border"
                  style={{
                    background: '#121826',
                    borderColor: '#2A3448',
                  }}
                >
                  <p className="font-semibold mb-2" style={{ color: '#E6EDF7' }}>{steel.name}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: '#A9B4C6' }}>Densidade:</span>
                      <span style={{ color: '#E6EDF7' }}>{steel.density} g/cm³</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: '#A9B4C6' }}>Preço:</span>
                      <span style={{ color: '#FF6D00' }}>R$ {steel.pricePerKg}/kg</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

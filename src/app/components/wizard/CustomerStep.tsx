import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Props {
  data: any;
  onChange: (updates: any) => void;
}

export function CustomerStep({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="customerName" className="text-sm font-medium text-foreground">
            Nome do Cliente <span className="text-destructive">*</span>
          </Label>
          <Input
            id="customerName"
            value={data.customerName}
            onChange={(e) => onChange({ customerName: e.target.value })}
            placeholder="Nome ou razão social"
            className={!data.customerName ? "border-destructive focus-visible:ring-destructive/20" : ""}
          />
          {!data.customerName && (
            <p className="text-xs text-destructive">Este campo é obrigatório</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerContact" className="text-sm font-medium text-foreground">
            Contato
          </Label>
          <Input
            id="customerContact"
            value={data.customerContact}
            onChange={(e) => onChange({ customerContact: e.target.value })}
            placeholder="Nome do contato"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="customerEmail" className="text-sm font-medium text-foreground">
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="customerEmail"
          type="email"
          value={data.customerEmail}
          onChange={(e) => onChange({ customerEmail: e.target.value })}
          placeholder="email@exemplo.com"
          className={!data.customerEmail ? "border-destructive focus-visible:ring-destructive/20" : ""}
        />
        {!data.customerEmail && (
          <p className="text-xs text-destructive">Este campo é obrigatório</p>
        )}
      </div>
    </div>
  );
}
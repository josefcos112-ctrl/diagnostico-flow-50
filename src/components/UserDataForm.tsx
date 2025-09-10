'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Mail, User, Building } from 'lucide-react';
import { toast } from 'sonner';

interface UserDataFormProps {
  onSubmit: (userData: { email: string; name: string; company: string }) => void;
}

export function UserDataForm({ onSubmit }: UserDataFormProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { [key: string]: string } = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit({ email: email.trim(), name: name.trim(), company: company.trim() });
      toast.success('Dados salvos! Iniciando diagnóstico...');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-orange rounded-full">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-800">
            Diagnóstico Empresarial
          </h1>
          <p className="text-xl text-neutral-600 font-medium">
            Controladoria Gerencial
          </p>
          <p className="text-neutral-500">
            Para começar, precisamos de algumas informações básicas
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="bg-white shadow-lg border border-neutral-100 rounded-3xl overflow-hidden">
        <CardHeader className="text-center py-8">
          <CardTitle className="text-2xl font-bold text-neutral-800">
            Seus Dados
          </CardTitle>
          <p className="text-neutral-500">
            Essas informações serão usadas para personalizar seu relatório
          </p>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className={`h-12 ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                <User className="w-4 h-4" />
                Nome Completo *
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                className={`h-12 ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                <Building className="w-4 h-4" />
                Empresa (opcional)
              </Label>
              <Input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Nome da sua empresa"
                className="h-12"
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-lg font-semibold bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full"
              >
                Iniciar Diagnóstico
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-neutral-50 rounded-xl">
            <p className="text-sm text-neutral-600 text-center">
              <span className="font-medium">🔒 Seus dados estão seguros.</span> Utilizamos apenas para gerar e enviar seu relatório personalizado.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
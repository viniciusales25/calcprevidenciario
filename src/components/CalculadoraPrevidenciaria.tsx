import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface ContribuicaoInterface {
  valor: string;
  moeda: string;
  mesInicio: string;
  anoInicio: string;
  mesFim: string;
  anoFim: string;
}

interface FormDataInterface {
  dataNascimento: string;
  genero: string;
  ehProfessor: boolean;
  ehSeguradoEspecial: boolean;
  contribuicoes: ContribuicaoInterface[];
}

interface ResultadoInterface {
  idade: number;
  tempoContribuicao: number;
  mediaSalarial: number;
  beneficio: number;
  porIdade: boolean;
  porPontos: boolean;
  tempoFaltante?: number;
  idadeFaltante?: number;
  pontosFaltantes?: number;
}

const anos = Array.from({length: 2025 - 1970 + 1}, (_, i) => 1970 + i);
const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const MOEDAS = {
  REAL: {
    nome: "Real (R$)",
    inicio: "1994-07",
    fim: "2025-12"
  },
  UFIR: {
    nome: "UFIR",
    inicio: "1964-01",
    fim: "2000-12"
  }
};

const CalculadoraPrevidenciaria: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormDataInterface>({
    dataNascimento: '',
    genero: '',
    ehProfessor: false,
    ehSeguradoEspecial: false,
    contribuicoes: [{
      valor: '',
      moeda: 'REAL',
      mesInicio: '',
      anoInicio: '',
      mesFim: '',
      anoFim: ''
    }]
  });
  const [resultado, setResultado] = useState<ResultadoInterface | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const adicionarContribuicao = (): void => {
    setFormData(prev => ({
      ...prev,
      contribuicoes: [...prev.contribuicoes, {
        valor: '',
        moeda: 'REAL',
        mesInicio: '',
        anoInicio: '',
        mesFim: '',
        anoFim: ''
      }]
    }));
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    // Implementar lógica de cálculo
    setResultado({
      idade: 0,
      tempoContribuicao: 0,
      mediaSalarial: 0,
      beneficio: 0,
      porIdade: false,
      porPontos: false
    });
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Data de Nascimento</label>
        <input
          type="date"
          name="dataNascimento"
          value={formData.dataNascimento}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Gênero</label>
        <select
          name="genero"
          value={formData.genero}
          onChange={handleInputChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Selecione</option>
          <option value="M">Masculino</option>
          <option value="F">Feminino</option>
        </select>
      </div>

      <button
        onClick={() => setStep(2)}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        disabled={!formData.dataNascimento || !formData.genero}
      >
        Próximo
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          <input
            type="checkbox"
            name="ehProfessor"
            checked={formData.ehProfessor}
            onChange={handleInputChange}
            className="mr-2"
          />
          É professor(a)?
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          <input
            type="checkbox"
            name="ehSeguradoEspecial"
            checked={formData.ehSeguradoEspecial}
            onChange={handleInputChange}
            className="mr-2"
          />
          É segurado especial?
        </label>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => setStep(1)}
          className="w-1/2 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
        >
          Voltar
        </button>
        <button
          onClick={() => setStep(3)}
          className="w-1/2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Próximo
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      {formData.contribuicoes.map((contrib, index) => (
        <div key={index} className="p-4 border rounded space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Valor</label>
              <input
                type="number"
                value={contrib.valor}
                onChange={(e) => {
                  const newContribuicoes = [...formData.contribuicoes];
                  newContribuicoes[index].valor = e.target.value;
                  setFormData(prev => ({...prev, contribuicoes: newContribuicoes}));
                }}
                className="w-full p-2 border rounded"
                placeholder="Valor da contribuição"
              />
            </div>
            <div className="w-40">
              <label className="block text-sm font-medium mb-1">Moeda</label>
              <select
                value={contrib.moeda}
                onChange={(e) => {
                  const newContribuicoes = [...formData.contribuicoes];
                  newContribuicoes[index].moeda = e.target.value;
                  setFormData(prev => ({...prev, contribuicoes: newContribuicoes}));
                }}
                className="w-full p-2 border rounded"
              >
                {Object.entries(MOEDAS).map(([key, moeda]) => (
                  <option key={key} value={key}>{moeda.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Período Inicial</label>
              <div className="flex gap-2">
                <select
                  value={contrib.mesInicio}
                  onChange={(e) => {
                    const newContribuicoes = [...formData.contribuicoes];
                    newContribuicoes[index].mesInicio = e.target.value;
                    setFormData(prev => ({...prev, contribuicoes: newContribuicoes}));
                  }}
                  className="flex-1 p-2 border rounded"
                >
                  <option value="">Mês</option>
                  {meses.map((mes, i) => (
                    <option key={i} value={i+1}>{mes}</option>
                  ))}
                </select>
                <select
                  value={contrib.anoInicio}
                  onChange={(e) => {
                    const newContribuicoes = [...formData.contribuicoes];
                    newContribuicoes[index].anoInicio = e.target.value;
                    setFormData(prev => ({...prev, contribuicoes: newContribuicoes}));
                  }}
                  className="flex-1 p-2 border rounded"
                >
                  <option value="">Ano</option>
                  {anos.map(ano => (
                    <option key={ano} value={ano}>{ano}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Período Final</label>
              <div className="flex gap-2">
                <select
                  value={contrib.mesFim}
                  onChange={(e) => {
                    const newContribuicoes = [...formData.contribuicoes];
                    newContribuicoes[index].mesFim = e.target.value;
                    setFormData(prev => ({...prev, contribuicoes: newContribuicoes}));
                  }}
                  className="flex-1 p-2 border rounded"
                >
                  <option value="">Mês</option>
                  {meses.map((mes, i) => (
                    <option key={i} value={i+1}>{mes}</option>
                  ))}
                </select>
                <select
                  value={contrib.anoFim}
                  onChange={(e) => {
                    const newContribuicoes = [...formData.contribuicoes];
                    newContribuicoes[index].anoFim = e.target.value;
                    setFormData(prev => ({...prev, contribuicoes: newContribuicoes}));
                  }}
                  className="flex-1 p-2 border rounded"
                >
                  <option value="">Ano</option>
                  {anos.map(ano => (
                    <option key={ano} value={ano}>{ano}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {index > 0 && (
            <button
              onClick={() => {
                const newContribuicoes = formData.contribuicoes.filter((_, i) => i !== index);
                setFormData(prev => ({...prev, contribuicoes: newContribuicoes}));
              }}
              className="text-red-500 text-sm hover:text-red-700"
            >
              Remover contribuição
            </button>
          )}
        </div>
      ))}

      <button
        onClick={adicionarContribuicao}
        className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
      >
        Adicionar Nova Contribuição
      </button>

      <div className="flex space-x-2 mt-4">
        <button
          onClick={() => setStep(2)}
          className="w-1/2 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
        >
          Voltar
        </button>
        <button
          onClick={handleSubmit}
          className="w-1/2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          disabled={formData.contribuicoes.length === 0}
        >
          Calcular
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Calculadora Previdenciária</h1>
      
      {resultado && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Resultado</AlertTitle>
          <AlertDescription>
            Cálculo realizado com sucesso!
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <div className="flex justify-between text-sm">
          <span className={step >= 1 ? 'text-blue-500 font-medium' : ''}>Dados Pessoais</span>
          <span className={step >= 2 ? 'text-blue-500 font-medium' : ''}>Categoria</span>
          <span className={step >= 3 ? 'text-blue-500 font-medium' : ''}>Contribuições</span>
        </div>
        <div className="relative pt-1">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
            <div
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
};

export default CalculadoraPrevidenciaria;

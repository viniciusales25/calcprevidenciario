import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

// Constantes do sistema previdenciário
const CONSTANTES = {
  TETO_INSS_2025: 8157.41,
  IDADE_MINIMA_NORMAL: { M: 64, F: 59 },
  IDADE_MINIMA_PROFESSOR: { M: 59, F: 54 },
  TEMPO_CONTRIBUICAO_MINIMO: { M: 35, F: 30 },
  TEMPO_CONTRIBUICAO_PROFESSOR: { M: 30, F: 25 },
  PONTOS_NECESSARIOS: {
    NORMAL: { M: 102, F: 92 },
    PROFESSOR: { M: 97, F: 87 },
  },
  PERCENTUAL_BASE: 60,
  INCREMENTO_ANUAL: 2,
  TEMPO_MINIMO_PERCENTUAL: { M: 20, F: 15 },
};

// Constantes de moedas e conversões
const MOEDAS = {
  REAL: {
    nome: "Real (R$)",
    inicio: "1994-07",
    fim: "2025-12",
    simbolo: "R$",
    fatorBase: 1,
  },
  CRUZEIRO_REAL: {
    nome: "Cruzeiro Real (CR$)",
    inicio: "1993-08",
    fim: "1994-06",
    simbolo: "CR$",
    fatorBase: 2750,
  },
  CRUZEIRO: {
    nome: "Cruzeiro (Cr$)",
    inicio: "1990-03",
    fim: "1993-07",
    simbolo: "Cr$",
    fatorBase: 2750000,
  },
  CRUZADO_NOVO: {
    nome: "Cruzado Novo (NCz$)",
    inicio: "1989-01",
    fim: "1990-02",
    simbolo: "NCz$",
    fatorBase: 2750000000,
  },
  CRUZADO: {
    nome: "Cruzado (Cz$)",
    inicio: "1986-02",
    fim: "1988-12",
    simbolo: "Cz$",
    fatorBase: 2750000000000,
  },
  UFIR: {
    nome: "UFIR",
    inicio: "1964-01",
    fim: "2000-12",
    simbolo: "UFIR",
    fatorBase: null, // Usa tabela específica
  },
};

// Valores UFIR por período (exemplo simplificado)
const VALORES_UFIR = {
  "1994": { valor: 0.6767 },
  "1995": { valor: 0.7061 },
  "1996": { valor: 0.8287 },
  "1997": { valor: 0.9108 },
  "1998": { valor: 0.9611 },
  "1999": { valor: 1.0641 },
  "2000": { valor: 1.0641 },
};

// Funções auxiliares de cálculo
const converterParaReal = (valor: number, moeda: string, ano: string) => {
  if (moeda === "REAL") return valor;
  if (moeda === "UFIR") {
    const valorUfir = VALORES_UFIR[ano]?.valor || 1.0641; // Usa último valor conhecido
    return valor * valorUfir;
  }
  return valor / MOEDAS[moeda].fatorBase;
};

const calcularIdade = (dataNascimento: string): number => {
  const hoje = new Date(2025, 0, 1); // Fixado para 2025
  const nasc = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
    idade--;
  }
  return idade;
};

const calcularTempoContribuicao = (contribuicoes) => {
  let tempoTotal = 0;
  contribuicoes.forEach((contrib) => {
    const inicio = new Date(`${contrib.anoInicio}-${contrib.mesInicio}-01`);
    const fim = new Date(`${contrib.anoFim}-${contrib.mesFim}-01`);
    const diffMeses =
      (fim.getFullYear() - inicio.getFullYear()) * 12 +
      fim.getMonth() -
      inicio.getMonth() +
      1;
    tempoTotal += diffMeses / 12;
  });
  return tempoTotal;
};

const calcularMediaSalarial = (contribuicoes) => {
  let totalContribuicoes = 0;
  let quantidadeMeses = 0;

  contribuicoes.forEach((contrib) => {
    const valorReal = converterParaReal(
      Number(contrib.valor),
      contrib.moeda,
      contrib.anoInicio
    );

    const inicio = new Date(`${contrib.anoInicio}-${contrib.mesInicio}-01`);
    const fim = new Date(`${contrib.anoFim}-${contrib.mesFim}-01`);
    const diffMeses =
      (fim.getFullYear() - inicio.getFullYear()) * 12 +
      fim.getMonth() -
      inicio.getMonth() +
      1;

    totalContribuicoes += valorReal * diffMeses;
    quantidadeMeses += diffMeses;
  });

  return quantidadeMeses > 0 ? totalContribuicoes / quantidadeMeses : 0;
};

const calcularBeneficio = (
  mediaSalarial: number,
  tempoContribuicao: number,
  genero: string
) => {
  const tempoMinimo = CONSTANTES.TEMPO_MINIMO_PERCENTUAL[genero];
  const anosExcedentes = Math.max(0, tempoContribuicao - tempoMinimo);

  let percentual =
    CONSTANTES.PERCENTUAL_BASE + anosExcedentes * CONSTANTES.INCREMENTO_ANUAL;
  percentual = Math.min(100, percentual);

  const beneficio = mediaSalarial * (percentual / 100);
  return Math.min(beneficio, CONSTANTES.TETO_INSS_2025);
};

const verificarElegibilidade = (
  idade: number,
  tempoContribuicao: number,
  genero: string,
  ehProfessor: boolean
) => {
  const idadeMinima = ehProfessor
    ? CONSTANTES.IDADE_MINIMA_PROFESSOR[genero]
    : CONSTANTES.IDADE_MINIMA_NORMAL[genero];

  const tempoMinimoContrib = ehProfessor
    ? CONSTANTES.TEMPO_CONTRIBUICAO_PROFESSOR[genero]
    : CONSTANTES.TEMPO_CONTRIBUICAO_MINIMO[genero];

  const pontos = idade + tempoContribuicao;
  const pontosNecessarios = ehProfessor
    ? CONSTANTES.PONTOS_NECESSARIOS.PROFESSOR[genero]
    : CONSTANTES.PONTOS_NECESSARIOS.NORMAL[genero];

  return {
    porIdade: idade >= idadeMinima && tempoContribuicao >= tempoMinimoContrib,
    porPontos:
      pontos >= pontosNecessarios && tempoContribuicao >= tempoMinimoContrib,
    tempoFaltante: Math.max(0, tempoMinimoContrib - tempoContribuicao),
    idadeFaltante: Math.max(0, idadeMinima - idade),
    pontosFaltantes: Math.max(0, pontosNecessarios - pontos),
  };
};

const anos = Array.from({ length: 2025 - 1970 + 1 }, (_, i) => 1970 + i);
const meses = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const CalculadoraPrevidenciaria = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    dataNascimento: "",
    genero: "",
    ehProfessor: false,
    ehSeguradoEspecial: false,
    contribuicoes: [
      {
        valor: "",
        moeda: "REAL",
        mesInicio: "",
        anoInicio: "",
        mesFim: "",
        anoFim: "",
      },
    ],
  });

  const [resultado, setResultado] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const adicionarContribuicao = () => {
    setFormData((prev) => ({
      ...prev,
      contribuicoes: [
        ...prev.contribuicoes,
        {
          valor: "",
          moeda: "REAL",
          mesInicio: "",
          anoInicio: "",
          mesFim: "",
          anoFim: "",
        },
      ],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const idade = calcularIdade(formData.dataNascimento);
    const tempoContrib = calcularTempoContribuicao(formData.contribuicoes);
    const mediaSalarial = calcularMediaSalarial(formData.contribuicoes);

    const elegibilidade = verificarElegibilidade(
      idade,
      tempoContrib,
      formData.genero,
      formData.ehProfessor
    );

    const beneficio = calcularBeneficio(
      mediaSalarial,
      tempoContrib,
      formData.genero
    );

    setResultado({
      idade,
      tempoContribuicao: tempoContrib,
      mediaSalarial,
      beneficio,
      ...elegibilidade,
    });
  };

  const getMoedasValidas = (ano) => {
    if (!ano) return Object.keys(MOEDAS);
    return Object.keys(MOEDAS).filter((moeda) => {
      const inicioMoeda = new Date(MOEDAS[moeda].inicio);
      const fimMoeda = new Date(MOEDAS[moeda].fim);
      const dataReferencia = new Date(`${ano}-01-01`);
      return dataReferencia >= inicioMoeda && dataReferencia <= fimMoeda;
    });
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Data de Nascimento
        </label>
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
                  setFormData((prev) => ({
                    ...prev,
                    contribuicoes: newContribuicoes,
                  }));
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
                  setFormData((prev) => ({
                    ...prev,
                    contribuicoes: newContribuicoes,
                  }));
                }}
                className="w-full p-2 border rounded"
              >
                {getMoedasValidas(contrib.anoInicio).map((moedaKey) => (
                  <option key={moedaKey} value={moedaKey}>
                    {MOEDAS[moedaKey].nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Período Inicial
              </label>
              <div className="flex gap-2">
                <select
                  value={contrib.mesInicio}
                  onChange={(e) => {
                    const newContribuicoes = [...formData.contribuicoes];
                    newContribuicoes[index].mesInicio = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      contribuicoes: newContribuicoes,
                    }));
                  }}
                  className="flex-1 p-2 border rounded"
                >
                  <option value="">Mês</option>
                  {meses.map((mes, i) => (
                    <option key={i} value={i + 1}>
                      {mes}
                    </option>
                  ))}
                </select>
                <select
                  value={contrib.anoInicio}
                  onChange={(e) => {
                    const newContribuicoes = [...formData.contribuicoes];
                    newContribuicoes[index].anoInicio = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      contribuicoes: newContribuicoes,
                    }));
                  }}
                  className="flex-1 p-2 border rounded"
                >
                  <option value="">Ano</option>
                  {anos.map((ano) => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
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
                    setFormData((prev) => ({
                      ...prev,
                      contribuicoes: newContribuicoes,
                    }));
                  }}
                  className="flex-1 p-2 border rounded"
                >
                  <option value="">Mês</option>
                  {meses.map((mes, i) => (
                    <option key={i} value={i + 1}>
                      {mes}
                    </option>
                  ))}
                </select>
                <select
                  value={contrib.anoFim}
                  onChange={(e) => {
                    const newContribuicoes = [...formData.contribuicoes];
                    newContribuicoes[index].anoFim = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      contribuicoes: newContribuicoes,
                    }));
                  }}
                  className="flex-1 p-2 border rounded"
                >
                  <option value="">Ano</option>
                  {anos.map((ano) => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {index > 0 && (
            <button
              onClick={() => {
                const newContribuicoes = formData.contribuicoes.filter(
                  (_, i) => i !== index
                );
                setFormData((prev) => ({
                  ...prev,
                  contribuicoes: newContribuicoes,
                }));
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
          disabled={
            !formData.contribuicoes.some(
              (c) =>
                c.valor && c.mesInicio && c.anoInicio && c.mesFim && c.anoFim
            )
          }
        >
          Calcular
        </button>
      </div>
    </div>
  );

  const renderResultado = () => {
    if (!resultado) return null;

    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Resultado da Análise</h2>

        <div className="space-y-3">
          <div>
            <p className="font-medium">Situação Atual:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Idade: {resultado.idade} anos</li>
              <li>
                Tempo de Contribuição: {resultado.tempoContribuicao.toFixed(1)}{" "}
                anos
              </li>
              <li>Média Salarial: R$ {resultado.mediaSalarial.toFixed(2)}</li>
            </ul>
          </div>

          <div>
            <p className="font-medium">Elegibilidade:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Por Idade: {resultado.porIdade ? "Elegível" : "Não elegível"}
              </li>
              <li>
                Por Pontos: {resultado.porPontos ? "Elegível" : "Não elegível"}
              </li>
            </ul>
          </div>

          {resultado.porIdade || resultado.porPontos ? (
            <div>
              <p className="font-medium">Benefício Calculado:</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {resultado.beneficio.toFixed(2)}
              </p>
            </div>
          ) : (
            <div>
              <p className="font-medium">Tempo Faltante:</p>
              <ul className="list-disc pl-5 space-y-1">
                {resultado.tempoFaltante > 0 && (
                  <li>
                    Contribuição: {resultado.tempoFaltante.toFixed(1)} anos
                  </li>
                )}
                {resultado.idadeFaltante > 0 && (
                  <li>Idade: {resultado.idadeFaltante} anos</li>
                )}
                {resultado.pontosFaltantes > 0 && (
                  <li>Pontos: {resultado.pontosFaltantes} pontos</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Calculadora Previdenciária
      </h1>

      <div className="mb-6">
        <div className="flex justify-between text-sm">
          <span className={step >= 1 ? "text-blue-500 font-medium" : ""}>
            Dados Pessoais
          </span>
          <span className={step >= 2 ? "text-blue-500 font-medium" : ""}>
            Categoria
          </span>
          <span className={step >= 3 ? "text-blue-500 font-medium" : ""}>
            Contribuições
          </span>
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
      {renderResultado()}
    </div>
  );
};

export default CalculadoraPrevidenciaria;

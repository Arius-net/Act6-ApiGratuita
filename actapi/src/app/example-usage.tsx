// Example: Using the draw-hearthstone API endpoint from a React component

'use client';

import { useState } from 'react';

interface DrawnCardInfo {
  valor: string;
  palo: string;
  code: string;
}

interface HearthstoneCardInfo {
  id: number;
  name: string;
  manaCost: number;
  image?: string;
  rarity?: string;
  text?: string;
  attack?: number;
  health?: number;
}

interface ApiResponse {
  success: boolean;
  drawnCard: DrawnCardInfo;
  hearthstoneCard: HearthstoneCardInfo;
  error?: string;
  message?: string;
}

export default function DrawCardExample() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const drawCard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/draw-hearthstone');
      const jsonData: ApiResponse = await response.json();
      
      setData(jsonData);
      
      if (!jsonData.success) {
        setError(jsonData.message || 'Error desconocido');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al conectar con la API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Draw Hearthstone Card</h1>
      
      <button
        onClick={drawCard}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Robando carta...' : 'Robar Carta'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Carta Robada */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Carta Robada</h2>
            <div className="space-y-2">
              <p><strong>Valor:</strong> {data.drawnCard.valor}</p>
              <p><strong>Palo:</strong> {data.drawnCard.palo}</p>
              <p><strong>Código:</strong> {data.drawnCard.code}</p>
            </div>
          </div>

          {/* Carta de Hearthstone */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Carta de Hearthstone</h2>
            <div className="space-y-2">
              <p><strong>Nombre:</strong> {data.hearthstoneCard.name}</p>
              <p><strong>Costo de Maná:</strong> {data.hearthstoneCard.manaCost}</p>
              {data.hearthstoneCard.rarity && (
                <p><strong>Rareza:</strong> {data.hearthstoneCard.rarity}</p>
              )}
              {data.hearthstoneCard.attack !== undefined && (
                <p><strong>Ataque:</strong> {data.hearthstoneCard.attack}</p>
              )}
              {data.hearthstoneCard.health !== undefined && (
                <p><strong>Salud:</strong> {data.hearthstoneCard.health}</p>
              )}
              {data.hearthstoneCard.text && (
                <p className="mt-2 text-sm text-gray-600">
                  <strong>Descripción:</strong> {data.hearthstoneCard.text}
                </p>
              )}
              {data.hearthstoneCard.image && (
                <img
                  src={data.hearthstoneCard.image}
                  alt={data.hearthstoneCard.name}
                  className="mt-4 rounded-lg shadow-md max-w-full"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* JSON Response (for debugging) */}
      {data && (
        <details className="mt-8">
          <summary className="cursor-pointer text-blue-600 hover:text-blue-800 font-semibold">
            Ver Respuesta JSON Completa
          </summary>
          <pre className="mt-2 p-4 bg-gray-100 rounded-lg overflow-auto text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

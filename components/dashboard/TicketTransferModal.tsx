'use client';

import { useState } from 'react';

export default function TicketTransferModal({ ticketId, onClose }: { ticketId: string; onClose: () => void }) {
  const [mode, setMode] = useState<'internal' | 'external'>('internal');
  const [toEmail, setToEmail] = useState('');
  const [resalePrice, setResalePrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [qrCode, setQrCode] = useState('');

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setQrCode('');
    try {
      const res = await fetch('/api/tickets/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          type: mode,
          toEmail: mode === 'internal' ? toEmail : undefined,
          resalePrice: mode === 'external' ? resalePrice : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || (mode === 'internal' ? 'Ticket transferred!' : 'Ticket ready for resale!'));
        if (data.qrCode) setQrCode(data.qrCode);
      } else {
        setError(data.error || 'Transfer failed.');
      }
    } catch (err) {
      setError('Transfer failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl">×</button>
        <h2 className="text-xl font-bold mb-4">Transfer or Resell Ticket</h2>
        <div className="flex space-x-2 mb-6">
          <button
            className={`flex-1 py-2 rounded ${mode === 'internal' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setMode('internal')}
          >
            Internal Transfer
          </button>
          <button
            className={`flex-1 py-2 rounded ${mode === 'external' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setMode('external')}
          >
            External Resale
          </button>
        </div>
        <form onSubmit={handleTransfer} className="space-y-4">
          {mode === 'internal' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
              <input
                type="email"
                value={toEmail}
                onChange={e => setToEmail(e.target.value)}
                className="input-field"
                required
                placeholder="user@email.com"
              />
            </div>
          )}
          {mode === 'external' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resale Price (USD)</label>
              <input
                type="number"
                min="0"
                value={resalePrice}
                onChange={e => setResalePrice(e.target.value)}
                className="input-field"
                required
                placeholder="e.g. 50"
              />
            </div>
          )}
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Processing...' : mode === 'internal' ? 'Transfer Ticket' : 'Resell Ticket'}
          </button>
        </form>
        {qrCode && (
          <div className="mt-6 text-center">
            <h3 className="font-semibold mb-2">Download QR Code</h3>
            <img src={qrCode} alt="Ticket QR" className="mx-auto mb-2 w-40 h-40 object-contain bg-gray-50 p-2 rounded" />
            <a
              href={qrCode}
              download={`ticket-qr-${ticketId}.png`}
              className="btn-secondary inline-block mt-2"
            >
              Download QR
            </a>
          </div>
        )}
      </div>
    </div>
  );
} 
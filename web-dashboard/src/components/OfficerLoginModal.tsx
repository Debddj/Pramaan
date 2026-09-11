import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { loginOfficer } from '../api/auth';
import { OfficerSession } from '../api/types';

interface OfficerLoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (session: OfficerSession) => void;
  onClose?: () => void;
}

export const OfficerLoginModal: React.FC<OfficerLoginModalProps> = ({
  isOpen,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('officer@consumer.gov.in');
  const [password, setPassword] = useState('sih2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const session = await loginOfficer(email, password);
      onLoginSuccess(session);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Authentication failed. Please verify officer credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDefaultCredentials = () => {
    setEmail('officer@consumer.gov.in');
    setPassword('sih2026');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl border border-gray-200 max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center mx-auto shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2
              className="text-2xl font-medium tracking-tight text-black"
              style={{ letterSpacing: '-0.03em' }}
            >
              Officer Authentication
            </h2>
            <p className="text-xs text-black/60 mt-0.5">
              Department of Consumer Affairs • Legal Metrology Directorate
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700">
              Officer Official Email / Gov ID
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black/20 transition"
              placeholder="officer@consumer.gov.in"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700">
              Security Passkey
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-black focus:outline-none focus:ring-2 focus:ring-black/20 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-black hover:bg-gray-800 active:scale-98 text-white rounded-full text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 group"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In as Enforcement Officer</span>
                <div className="bg-white rounded-full p-1 transition-transform group-hover:translate-x-0.5">
                  <ArrowRight className="w-3.5 h-3.5 text-black" />
                </div>
              </>
            )}
          </button>
        </form>

        {/* Demo Quick Fill Helper */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Testing Environment</span>
          <button
            type="button"
            onClick={fillDefaultCredentials}
            className="text-black hover:underline font-semibold"
          >
            Load Inspector Credentials
          </button>
        </div>
      </motion.div>
    </div>
  );
};

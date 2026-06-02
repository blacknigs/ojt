/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Mail, Lock, AlertCircle, ArrowRight, UserPlus, LogIn, CheckCircle2 } from 'lucide-react';

interface LogInPageProps {
  onLoginSuccess: (email: string) => void;
  initialEmail?: string;
}

interface Account {
  email: string;
  passphrase?: string;
}

export default function LogInPage({ onLoginSuccess, initialEmail = 'nythanjanbagasani@gmail.com' }: LogInPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize accounts database from localStorage
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem('aft_saas_accounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    // Seed with initial auditor user
    return [{ email: 'nythanjanbagasani@gmail.com', passphrase: 'password' }];
  });

  // Pre-fill initial email when loading sign in page
  useEffect(() => {
    if (!isSignUp) {
      setEmail(initialEmail);
      setPassword('password'); // Use "password" as standard placeholder
    } else {
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
    setError('');
    setSuccessMessage('');
  }, [isSignUp, initialEmail]);

  // Synchronize accounts with localStorage when it updates
  useEffect(() => {
    localStorage.setItem('aft_saas_accounts', JSON.stringify(accounts));
  }, [accounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    // Simple Email Regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (isSignUp) {
      // Sign Up Registration Flow
      if (password.length < 6) {
        setError('Passphrase must be at least 6 characters long for cryptographic compliance.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Secured Passphrase confirmation does not match.');
        return;
      }

      // Check if account already exists
      const exists = accounts.some(acc => acc.email.toLowerCase() === trimmedEmail);
      if (exists) {
        setError('This email address is already registered inside the SaaS registry.');
        return;
      }

      setIsLoading(true);

      setTimeout(() => {
        const newAccount: Account = { email: trimmedEmail, passphrase: password };
        const updatedAccounts = [...accounts, newAccount];
        setAccounts(updatedAccounts);
        
        setIsLoading(false);
        setSuccessMessage('Account provisioned successfully! Authenticating securely...');
        
        // Auto sign-in the fresh-registered account after showing success
        setTimeout(() => {
          onLoginSuccess(trimmedEmail);
        }, 1200);
      }, 1000);

    } else {
      // Sign In Flow
      setIsLoading(true);

      setTimeout(() => {
        setIsLoading(false);
        
        // Match account credentials
        const existingAccount = accounts.find(
          acc => acc.email.toLowerCase() === trimmedEmail
        );

        // For backwards compatibility, tolerate the default key or placeholder '••••••••'
        const isDefaultDevUser = trimmedEmail === 'nythanjanbagasani@gmail.com' && (password === '••••••••' || password === 'password');
        const isMatchedUser = existingAccount && (existingAccount.passphrase === password);

        if (isDefaultDevUser || isMatchedUser) {
          onLoginSuccess(trimmedEmail);
        } else {
          setError('Invalid credentials. Please verify your email or cryptologically matched passphrase.');
        }
      }, 850);
    }
  };

  return (
    <div id="login-container" className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 relative overflow-hidden px-4">
      {/* Decorative Blueprint Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-80" />
      
      {/* Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <motion.div
        id="login-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10 backdrop-blur-md"
      >
        <div id="login-header" className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold font-sans tracking-tight text-white mb-2">
            Accountable Forms Tracker
          </h1>
          <p className="text-sm text-slate-400">
            Secure Audit & Records Dashboard (SaaS Portal)
          </p>
        </div>

        <NotificationPanel error={error} successMessage={successMessage} />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 font-sans uppercase tracking-wider block">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@municipality.gov"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 font-sans uppercase tracking-wider block">
              Secured Passphrase
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {isSignUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1.5 overflow-hidden"
            >
              <label className="text-xs font-medium text-slate-300 font-sans uppercase tracking-wider block">
                Confirm Passphrase
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="confirm-password-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                  required={isSignUp}
                />
              </div>
            </motion.div>
          )}

          {!isSignUp && (
            <div className="text-right">
              <span className="text-xs text-emerald-400 hover:underline cursor-pointer">
                Forgot security key?
              </span>
            </div>
          )}

          <button
            id="submit-auth-btn"
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium text-sm py-3 px-4 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center justify-center mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isSignUp ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Initialize Auditor Account</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Access Secure Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <button
            id="toggle-auth-mode-btn"
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 mx-auto"
          >
            {isSignUp ? (
              <>
                Already registered in registry? <span className="text-emerald-400 font-medium hover:underline">Sign In Instead</span>
              </>
            ) : (
              <>
                Need custom credentials? <span className="text-emerald-400 font-medium hover:underline">Create an Account</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Separate Notification Panel to keep views neat and clean
function NotificationPanel({ error, successMessage }: { error: string; successMessage: string }) {
  return (
    <AnimatePresence mode="popLayout">
      {error && (
        <motion.div
          key="error-panel"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="mb-6 p-4 bg-red-950/40 border border-red-900/50 text-red-400 rounded-lg flex items-start gap-3 text-xs"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </motion.div>
      )}

      {successMessage && (
        <motion.div
          key="success-panel"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="mb-6 p-4 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 rounded-lg flex items-start gap-3 text-xs"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import React from 'react';

interface Step {
  numero: number;
  label: string;
}

interface WizardStepperProps {
  pasoActual: number;
  pasos: Step[];
}

export const WizardStepper: React.FC<WizardStepperProps> = ({ pasoActual, pasos }) => (
  <div className="max-w-3xl mx-auto mb-8 px-4">
    <div className="relative flex items-start justify-between">
      {/* Background connector */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/20 z-0" />
      {/* Progress connector */}
      <div
        className="absolute top-5 left-0 h-0.5 bg-white/80 z-0 transition-all duration-500"
        style={{ width: `${((pasoActual - 1) / (pasos.length - 1)) * 100}%` }}
      />

      {pasos.map(paso => {
        const done   = paso.numero < pasoActual;
        const active = paso.numero === pasoActual;
        return (
          <div key={paso.numero} className="relative z-10 flex flex-col items-center gap-2 flex-1">
            <div
              className={[
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
                'transition-all duration-300 border-2',
                done   ? 'bg-white border-white text-green-600'
                       : active
                         ? 'bg-white border-white text-blue-900 shadow-lg shadow-white/30'
                         : 'bg-transparent border-white/30 text-white/40',
              ].join(' ')}
            >
              {done ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : paso.numero}
            </div>
            <span
              className={[
                'text-xs font-semibold text-center leading-tight hidden sm:block',
                active ? 'text-white' : done ? 'text-blue-200' : 'text-blue-400/60',
              ].join(' ')}
            >
              {paso.label}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

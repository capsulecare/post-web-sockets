import React, { useState, useEffect } from 'react';
import { X, Check, Shield, Users, ChevronRight } from 'lucide-react';
import { 
  Gamepad2, 
  Leaf, 
  Trophy, 
  Atom, 
  DollarSign, 
  GraduationCap,
  Heart,
  Palette,
  HandHeart,
  TrendingUp,
  Code,
  Brain,
  Blocks,
  ShoppingCart,
  MapPin,
  ChefHat,
  Shirt,
  Music,
  Sprout
} from 'lucide-react';
import type { UserRole, UserInterest } from '../types/auth';

interface UnifiedModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRole: UserRole | '';
  selectedInterests: UserInterest[];
  onRoleChange: (role: UserRole) => void;
  onInterestToggle: (interest: UserInterest) => void;
}

export const UnifiedModal: React.FC<UnifiedModalProps> = ({
  isOpen,
  onClose,
  selectedRole,
  selectedInterests,
  onRoleChange,
  onInterestToggle
}) => {
  const [currentStep, setCurrentStep] = useState<'role' | 'interests'>('role');

  useEffect(() => {
    if (isOpen) {
      if (selectedRole) {
        setCurrentStep('interests');
      } else {
        setCurrentStep('role');
      }
    }
  }, [isOpen, selectedRole]);

  const roles = [
    {
      value: 'mentor' as UserRole,
      label: 'Mentor',
      description: 'Guía y facilita la comunidad',
      icon: Shield,
      gradient: 'from-purple-500 to-indigo-600'
    },
    {
      value: 'colaborador' as UserRole,
      label: 'Colaborador',
      description: 'Participa activamente en proyectos',
      icon: Users,
      gradient: 'from-cyan-500 to-teal-600'
    }
  ];

  const interests = [
    { value: 'videojuegos' as UserInterest, label: 'Videojuegos', icon: Gamepad2, color: 'from-purple-500 to-pink-500' },
    { value: 'ambiental' as UserInterest, label: 'Ambiental', icon: Leaf, color: 'from-green-500 to-emerald-500' },
    { value: 'deportes' as UserInterest, label: 'Deportes', icon: Trophy, color: 'from-orange-500 to-red-500' },
    { value: 'ciencia-tecnologia' as UserInterest, label: 'Ciencia & Tech', icon: Atom, color: 'from-blue-500 to-cyan-500' },
    { value: 'finanzas' as UserInterest, label: 'Finanzas', icon: DollarSign, color: 'from-yellow-500 to-orange-500' },
    { value: 'educacion' as UserInterest, label: 'Educación', icon: GraduationCap, color: 'from-indigo-500 to-purple-500' },
    { value: 'salud-bienestar' as UserInterest, label: 'Salud', icon: Heart, color: 'from-pink-500 to-rose-500' },
    { value: 'arte-creatividad' as UserInterest, label: 'Arte', icon: Palette, color: 'from-violet-500 to-purple-500' },
    { value: 'emprendimiento-social' as UserInterest, label: 'Social', icon: HandHeart, color: 'from-teal-500 to-cyan-500' },
    { value: 'marketing-ventas' as UserInterest, label: 'Marketing', icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
    { value: 'desarrollo-software' as UserInterest, label: 'Software', icon: Code, color: 'from-slate-500 to-gray-600' },
    { value: 'inteligencia-artificial' as UserInterest, label: 'IA', icon: Brain, color: 'from-purple-600 to-indigo-600' },
    { value: 'blockchain-crypto' as UserInterest, label: 'Blockchain', icon: Blocks, color: 'from-amber-500 to-yellow-500' },
    { value: 'e-commerce' as UserInterest, label: 'E-commerce', icon: ShoppingCart, color: 'from-blue-600 to-indigo-600' },
    { value: 'turismo-viajes' as UserInterest, label: 'Turismo', icon: MapPin, color: 'from-sky-500 to-blue-500' },
    { value: 'gastronomia' as UserInterest, label: 'Gastronomía', icon: ChefHat, color: 'from-red-500 to-pink-500' },
    { value: 'moda-diseno' as UserInterest, label: 'Moda', icon: Shirt, color: 'from-fuchsia-500 to-pink-500' },
    { value: 'musica-entretenimiento' as UserInterest, label: 'Música', icon: Music, color: 'from-violet-600 to-purple-600' },
    { value: 'agricultura-sostenible' as UserInterest, label: 'Agricultura', icon: Sprout, color: 'from-lime-500 to-green-500' }
  ];

  if (!isOpen) return null;

  const handleRoleSelect = (role: UserRole) => {
    onRoleChange(role);
    setCurrentStep('interests');
  };

  const handleClose = () => {
    setCurrentStep('role');
    onClose();
  };

  const canProceed = selectedRole && selectedInterests.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 w-full max-w-md max-h-[70vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold text-white">
              {currentStep === 'role' ? 'Selecciona tu rol' : 'Selecciona tus intereses'}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                currentStep === 'role' ? 'bg-cyan-400' : 'bg-cyan-400/50'
              }`}></div>
              <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                currentStep === 'interests' ? 'bg-cyan-400' : 'bg-white/30'
              }`}></div>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-white/50 hover:text-white transition-colors cursor-pointer duration-300 p-1 hover:bg-white/10 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[45vh]">
          {currentStep === 'role' ? (
            <div className="space-y-3">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.value;
                
                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => handleRoleSelect(role.value)}
                    className={`w-full p-3 cursor-pointer rounded-xl border transition-all duration-300 text-left group hover:scale-[1.01] ${
                      isSelected
                        ? `border-transparent bg-gradient-to-r ${role.gradient} shadow-lg`
                        : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          isSelected 
                            ? 'bg-white/20' 
                            : 'bg-white/10 group-hover:bg-white/15'
                        }`}>
                          <Icon className={`w-4 h-4 ${
                            isSelected ? 'text-white' : 'text-white/70'
                          }`} />
                        </div>
                        
                        <div className="flex-1">
                          <h4 className={`font-semibold text-sm ${
                            isSelected ? 'text-white' : 'text-white/90'
                          }`}>
                            {role.label}
                          </h4>
                          <p className={`text-xs mt-1 ${
                            isSelected ? 'text-white/80' : 'text-white/60'
                          }`}>
                            {role.description}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className={`w-4 h-4 transition-colors duration-300 ${
                        isSelected ? 'text-white' : 'text-white/50'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div>
              <p className="text-white/70 text-sm mb-3">
                {selectedInterests.length} intereses seleccionados
              </p>
              <div className="grid grid-cols-2 gap-2">
                {interests.map((interest) => {
                  const Icon = interest.icon;
                  const isSelected = selectedInterests.includes(interest.value);
                  
                  return (
                    <button
                      key={interest.value}
                      type="button"
                      onClick={() => onInterestToggle(interest.value)}
                      className={`relative p-2.5 cursor-pointer rounded-xl border transition-all duration-300 text-center group hover:scale-[1.02] ${
                        isSelected
                          ? `border-transparent bg-gradient-to-r ${interest.color} shadow-lg`
                          : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-1.5">
                        <div className={`p-1.5 rounded-lg ${
                          isSelected 
                            ? 'bg-white/20' 
                            : 'bg-white/10 group-hover:bg-white/15'
                        }`}>
                          <Icon className={`w-3.5 h-3.5 ${
                            isSelected ? 'text-white' : 'text-white/70'
                          }`} />
                        </div>
                        
                        <span className={`text-xs font-medium leading-tight ${
                          isSelected ? 'text-white' : 'text-white/80'
                        }`}>
                          {interest.label}
                        </span>
                      </div>
                      
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-2.5 h-2.5 text-green-600" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          {currentStep === 'interests' ? (
            <div className="flex space-x-3">
              <button
                onClick={() => setCurrentStep('role')}
                className="flex-1 cursor-pointer bg-white/10 text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-white/15 transition-all duration-300 text-sm"
              >
                Volver
              </button>
              <button
                onClick={handleClose}
                disabled={!canProceed}
                className={`flex-2 cursor-pointer font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.01] text-sm ${
                  canProceed
                    ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white hover:from-cyan-700 hover:to-emerald-700'
                    : 'bg-white/10 text-white/50 cursor-not-allowed'
                }`}
              >
                Confirmar ({selectedInterests.length})
              </button>
            </div>
          ) : (
            <p className="text-white/60 text-xs text-center">
              Selecciona un rol para continuar
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
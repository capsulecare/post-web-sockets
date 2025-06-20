export type AuthMode = 'login' | 'register' | 'forgot';

export type UserRole = 'mentor' | 'colaborador';

export type UserInterest = 
  | 'videojuegos'
  | 'ambiental'
  | 'deportes'
  | 'ciencia-tecnologia'
  | 'finanzas'
  | 'educacion'
  | 'salud-bienestar'
  | 'arte-creatividad'
  | 'emprendimiento-social'
  | 'marketing-ventas'
  | 'desarrollo-software'
  | 'inteligencia-artificial'
  | 'blockchain-crypto'
  | 'e-commerce'
  | 'turismo-viajes'
  | 'gastronomia'
  | 'moda-diseno'
  | 'musica-entretenimiento'
  | 'agricultura-sostenible';

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole | '';
  interests: UserInterest[];
}

export interface AuthContextType {
  authMode: AuthMode;
  formData: FormData;
  isTransitioning: boolean;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  switchMode: (mode: AuthMode) => void;
}

// Interfaces para la API de registro
export interface RegisterRequest {
    nombre: string;
    apellido: string;
    correo: string;
    contra: string;
    rol: UserRole;
    intereses: UserInterest[];
}

export interface RegisterResponse {
    id: number;
    nombre: string;
    apellido: string;
    correo: string;
    rol: UserRole;
    intereses: UserInterest[];
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    userId: number;
    email: string;
    role: string;
}

export interface ForgotPasswordRequest {
    correo: string;
}

export interface ForgotPasswordResponse {
    mensaje: string;
    exito: boolean;
    correo?: string;
}
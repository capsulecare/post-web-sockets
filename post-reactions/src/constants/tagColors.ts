// src/constants/tagColors.ts
export const tagColors: Record<string, string> = {
  // 🔵 Tecnología - Azul (innovación, digital)
  'Tecnología': 'bg-blue-100 text-blue-800 border-blue-200',
  
  // 🟢 Negocios - Verde (crecimiento, dinero)
  'Negocios y Emprendimiento': 'bg-green-100 text-green-800 border-green-200',
  
  // 🟣 Arte - Púrpura (creatividad, imaginación)
  'Arte y Creatividad': 'bg-purple-100 text-purple-800 border-purple-200',
  
  // 🟠 Ciencia - Naranja (conocimiento, energía)
  'Ciencia y Educación': 'bg-orange-100 text-orange-800 border-orange-200',
  
  // 🔴 Cultura - Rosa/Rojo (pasión, diversidad)
  'Idiomas y Cultura': 'bg-rose-100 text-rose-800 border-rose-200',
  
  // 🟢 Salud - Verde claro (bienestar, vida)
  'Salud y Bienestar': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  
  // 🔵 Deportes - Azul índigo (fuerza, competencia)
  'Deportes': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  
  // 🟢 Medio ambiente - Verde oscuro (naturaleza, sostenibilidad)
  'Medio ambiente y Sostenibilidad': 'bg-teal-100 text-teal-800 border-teal-200',
  
  // 🟡 Desarrollo Personal - Amarillo (crecimiento, luz)
  'Desarrollo Personal': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  
  // 🟣 Gaming - Púrpura oscuro (diversión, entretenimiento)
  'Video Juegos y Entretenimiento': 'bg-violet-100 text-violet-800 border-violet-200',
  
  // Color por defecto para etiquetas no definidas
  'default': 'bg-slate-100 text-slate-700 border-slate-200'
};

// Función helper para obtener el color de una etiqueta
export const getTagColor = (tagName: string): string => {
  return tagColors[tagName] || tagColors.default;
};

// Colores para gradientes en botones (Header)
export const tagGradients: Record<string, string> = {
  'all': 'bg-gradient-to-r from-purple-500 to-pink-500',
  'tecnologia': 'bg-gradient-to-r from-blue-500 to-cyan-500',
  'negocios': 'bg-gradient-to-r from-green-500 to-emerald-500',
  'arte': 'bg-gradient-to-r from-purple-500 to-violet-500',
  'ciencia': 'bg-gradient-to-r from-orange-500 to-red-500',
  'cultura': 'bg-gradient-to-r from-rose-500 to-pink-500',
  'salud': 'bg-gradient-to-r from-emerald-500 to-teal-500',
  'deportes': 'bg-gradient-to-r from-indigo-500 to-blue-500',
  'ambiente': 'bg-gradient-to-r from-teal-500 to-green-500',
  'desarrollo': 'bg-gradient-to-r from-yellow-500 to-orange-500',
  'gaming': 'bg-gradient-to-r from-violet-500 to-purple-500'
};
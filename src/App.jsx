import React, { useState, useMemo, useRef } from 'react';
import { 
  Home, Users, User, Star, MapPin, 
  Search, Heart, MessageCircle, Leaf, 
  X, Info, BookOpen, ChevronRight, Send, 
} from 'lucide-react';

// --- ESCUDO DE ERRORES ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("Error UI:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 text-red-900 min-h-screen">
          <h1 className="text-2xl font-bold mb-4">¡Ups! Ocurrió un error.</h1>
          <pre className="bg-red-100 p-4 rounded overflow-auto text-sm">{this.state.error && this.state.error.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- FUNCIONES SEGURAS Y FALLBACKS ---
const formatDate = (dateStr) => {
  try {
    if (!dateStr) return 'Reciente';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? 'Reciente' : d.toLocaleDateString();
  } catch(e) {
    return 'Reciente';
  }
};

// Imagen de respaldo confiable
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80';

const handleImageError = (e) => {
  if (e.currentTarget.src !== FALLBACK_IMAGE) {
    e.currentTarget.src = FALLBACK_IMAGE;
  }
};

// --- DATOS INICIALES CON IMÁGENES CORRECTAS ---
// Todas las URLs usan el formato ?w=800&q=80 que es más estable
const SEED_PARKS = [
  {
    id: 'p1',
    name: 'Parque Cultural de Valparaíso',
    address: 'Calle Cárcel 471, C° Cárcel',
    description: 'Antigua ex-cárcel transformada en el pulmón verde y cultural más importante del cerro Cárcel. Cuenta con amplias áreas de pasto, murales de arte urbano y actividades culturales durante todo el año.',
    categories: ['Familiar', 'Cultura'],
    rating: 4.8,
    status: 'Abierto',
    hours: '10:00 - 18:00',
    lat: -33.0456,
    lng: -71.6267,
    // Parque con césped y árboles — lugar cultural al aire libre
    imageUrl: 'https://images.unsplash.com/photo-1579534928584-7b70b06b7618?w=800&q=80'
  },
  {
    id: 'p2',
    name: 'Paseo Yugoslavo',
    address: 'Paseo Yugoslavo, C° Alegre',
    description: 'Uno de los miradores más icónicos de la ciudad, ubicado en el Cerro Alegre. Ofrece una vista panorámica espectacular de la bahía de Valparaíso y el Océano Pacífico.',
    categories: ['Mirador', 'Turismo'],
    rating: 4.7,
    status: 'Abierto 24hrs',
    hours: '24 hrs',
    lat: -33.0416,
    lng: -71.6285,
    // Vista panorámica de ciudad y bahía desde mirador
    imageUrl: 'https://images.unsplash.com/photo-1598135753163-6167c1a1ad65?w=800&q=80'
  },
  {
    id: 'p3',
    name: 'Plaza Victoria',
    address: 'Av. Pedro Montt s/n, Plan',
    description: 'El corazón del plan de Valparaíso. Una plaza histórica con árboles añosos, estatuas, fuentes de agua y juegos infantiles rodeada de arquitectura patrimonial.',
    categories: ['Familiar', 'Historico'],
    rating: 4.2,
    status: 'Abierto',
    hours: '24 hrs',
    lat: -33.0450,
    lng: -71.6186,
    // Plaza urbana histórica con árboles y senderos
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80'
  },
  {
    id: 'p4',
    name: 'Parque Quebrada Verde',
    address: 'Camino a Laguna Verde Km 3.5',
    description: 'Extenso parque periurbano ideal para desconectarse de la ciudad. Cuenta con senderos de trekking, zonas de picnic bajo los árboles y esculturas al aire libre.',
    categories: ['Deporte', 'Naturaleza'],
    rating: 4.5,
    status: 'Abierto',
    hours: '09:00 - 18:00',
    lat: -33.0811,
    lng: -71.6442,
    // Sendero en bosque natural / parque con vegetación densa
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80'
  }
];

const SEED_REVIEWS = [
  {
    id: 'r1',
    type: 'report',
    reportCategory: 'Basural',
    parkId: 'p4',
    userId: 'u5',
    userName: 'Carlos Pino',
    userPhoto: null,
    text: 'Gente irresponsable dejó un montón de basura y plásticos cerca del sendero principal. Hay que organizar una limpieza comunitaria.',
    // Basura en entorno natural — imagen de problema ambiental real
    imageUrl: 'https://images.unsplash.com/photo-1604187352009-5c9d7e3e3c9d?w=800&q=80',
    createdAt: new Date(Date.now() - 43200000).toISOString()
  },
  {
    id: 'r2',
    type: 'review',
    parkId: 'p1',
    userId: 'u2',
    userName: 'Camila Ríos',
    userPhoto: null,
    text: 'Excelente lugar para ir con los niños y mascotas. Muy limpio y seguro, la explanada es perfecta para tenderse en el pasto.',
    rating: 5,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'r3',
    type: 'review',
    parkId: 'p2',
    userId: 'u3',
    userName: 'Diego Vega',
    userPhoto: null,
    text: 'La mejor vista de la bahía y el puerto, ideal para tomar fotos al atardecer en Valparaíso. Un must para los turistas.',
    rating: 5,
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 'r4',
    type: 'report',
    reportCategory: 'Mobiliario Dañado',
    parkId: 'p3',
    userId: 'u6',
    userName: 'María Soto',
    userPhoto: null,
    text: 'Uno de los columpios de la plaza está roto y es peligroso para los niños. Por favor tener precaución hasta que sea reparado.',
    imageUrl: null,
    createdAt: new Date(Date.now() - 200000000).toISOString()
  }
];

const WIKI_ARTICLES = [
  {
    id: 'w1',
    title: 'Cómo iniciar tu primer huerto en macetas',
    category: 'Huertos Urbanos',
    readTime: '5 min',
    // Huerto en macetas / balcón con plantas de verduras y hierbas
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
    content: 'Tener un huerto en departamento es totalmente posible. Lo principal es elegir macetas con buen drenaje y plantas que no requieran raíces profundas, como lechugas o hierbas aromáticas. Asegúrate de ubicarlas en un balcón o ventana que reciba al menos 4 a 6 horas de sol directo al día. Comienza con semillas fáciles como cilantro, albahaca o rábanos, que germinan rápido y te darán satisfacción casi inmediata.'
  },
  {
    id: 'w2',
    title: 'Guía de compostaje para departamentos',
    category: 'Sustentabilidad',
    readTime: '7 min',
    // Compost con restos vegetales y tierra — imagen de compostaje real
    imageUrl: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&q=80',
    content: 'El vermicompostaje es ideal para espacios pequeños porque no emite malos olores si se maneja correctamente. Agrega restos de vegetales crudos, cáscaras de huevo y borra de café, equilibrando siempre con material seco como cartón sin tinta. En pocas semanas tendrás abono de alta calidad para tus plantas y reducirás significativamente tus residuos orgánicos.'
  },
  {
    id: 'w3',
    title: 'Especies nativas de Valparaíso para tu jardín',
    category: 'Flora Local',
    readTime: '6 min',
    // Flores nativas chilenas — quillay, copihue o flora mediterránea local
    imageUrl: 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&q=80',
    content: 'Plantas como el litre, el molle y la pica-pica son ideales para jardines en la Región de Valparaíso porque están adaptadas al clima mediterráneo local y requieren muy poco riego. Al usar flora nativa contribuyes a la biodiversidad y apoyas a los insectos polinizadores nativos de la zona.'
  },
  {
    id: 'w4',
    title: 'Cómo reportar un problema en tu parque',
    category: 'Participación Ciudadana',
    readTime: '3 min',
    // Persona tomando foto con celular en parque — reporte ciudadano
    imageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80',
    content: 'Usando la sección Comunidad de ValpoVerde puedes generar una alerta en segundos. Selecciona el parque afectado, elige la categoría del problema (basural, mobiliario dañado, fuga de agua, etc.), describe la situación con el mayor detalle posible y adjunta una foto si tienes. Mientras más información compartas, más fácil será para las autoridades municipales actuar rápidamente.'
  }
];

// --- SHARED UI COMPONENTS ---
function UserAvatar({ name, photoURL, sizeClasses = "w-10 h-10 text-lg" }) {
  if (photoURL) return (
    <img
      src={photoURL}
      alt={name || 'Usuario'}
      className={`${sizeClasses} rounded-full object-cover shadow-sm border border-slate-200 dark:border-slate-700 shrink-0`}
    />
  );
  const initial = typeof name === 'string' && name.length > 0 ? name.charAt(0).toUpperCase() : 'U';
  return (
    <div className={`${sizeClasses} rounded-full bg-gradient-to-tr from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0`}>
      {initial}
    </div>
  );
}

function SidebarButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${active
        ? 'bg-gradient-to-r from-emerald-100 to-teal-50 dark:from-emerald-900/60 dark:to-teal-900/40 text-emerald-700 dark:text-emerald-300 shadow-md border border-emerald-200 dark:border-emerald-800/50'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-200'}`}
    >
      <span className={active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}>{icon}</span>
      {label}
    </button>
  );
}

function MobileNavButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-2 min-w-[60px] transition-colors ${active
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
    >
      {icon}
      <span className="text-[10px] font-medium mt-1">{label}</span>
    </button>
  );
}

function Footer() {
  return (
    <footer className="mt-16 py-10 text-center border-t-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="flex flex-col items-center justify-center gap-3">
        <Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-400 opacity-70" />
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
          Proyecto formativo desarrollado para{' '}
          <span className="font-black tracking-tight text-red-600 dark:text-red-500">@inacap</span>
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-500">ValpoVerde App © {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}

// --- MAPA OPENSTREETMAP ---
function OSMap({ parks, onSelectPark, darkMode }) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const ZOOM = 14;
  const TILE_SIZE = 256;
  const centerLng = -71.625;
  const centerLat = -33.045;

  const lng2tile = (lon, zoom) => (lon + 180) / 360 * Math.pow(2, zoom);
  const lat2tile = (lat, zoom) => (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom);

  const centerTileX = lng2tile(centerLng, ZOOM);
  const centerTileY = lat2tile(centerLat, ZOOM);

  const tiles = useMemo(() => {
    const t = [];
    const range = 3;
    const baseX = Math.floor(centerTileX);
    const baseY = Math.floor(centerTileY);
    for (let x = -range; x <= range; x++) {
      for (let y = -range; y <= range; y++) {
        t.push({
          tx: baseX + x,
          ty: baseY + y,
          left: (baseX + x - centerTileX) * TILE_SIZE,
          top: (baseY + y - centerTileY) * TILE_SIZE,
        });
      }
    }
    return t;
  }, [centerTileX, centerTileY]);

  const startDrag = (clientX, clientY, e) => {
    isDragging.current = true;
    lastPos.current = { x: clientX, y: clientY };
    if (e && e.currentTarget && e.pointerId) {
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch(_) {}
    }
  };

  const doDrag = (clientX, clientY) => {
    if (!isDragging.current) return;
    const dx = clientX - lastPos.current.x;
    const dy = clientY - lastPos.current.y;
    setPos(p => ({ x: p.x + dx, y: p.y + dy }));
    lastPos.current = { x: clientX, y: clientY };
  };

  const stopDrag = (e) => {
    isDragging.current = false;
    if (e && e.currentTarget && e.pointerId) {
      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch(_) {}
    }
  };

  return (
    <div
      className="absolute inset-0 bg-[#aad3df] dark:bg-[#1a2332] overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing"
      onPointerDown={(e) => startDrag(e.clientX, e.clientY, e)}
      onPointerMove={(e) => doDrag(e.clientX, e.clientY)}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
    >
      {/* Controles zoom */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
        <button
          onClick={() => setScale(s => Math.min(s + 0.4, 3))}
          className="w-11 h-11 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-white rounded-full shadow-xl flex items-center justify-center text-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
          onPointerDown={e => e.stopPropagation()}
        >+</button>
        <button
          onClick={() => setScale(s => Math.max(s - 0.4, 0.5))}
          className="w-11 h-11 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-white rounded-full shadow-xl flex items-center justify-center text-3xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all leading-none pb-1"
          onPointerDown={e => e.stopPropagation()}
        >−</button>
        <button
          onClick={() => { setScale(1); setPos({ x: 0, y: 0 }); }}
          className="w-11 h-11 mt-2 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 rounded-full shadow-xl flex items-center justify-center font-bold hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
          onPointerDown={e => e.stopPropagation()}
        ><MapPin className="w-5 h-5" /></button>
      </div>

      {/* Leyenda */}
      <div className="absolute top-6 right-6 z-20 bg-white dark:bg-slate-800 backdrop-blur-lg p-4 px-5 rounded-2xl shadow-2xl border-2 border-slate-200 dark:border-slate-700 text-center">
        <h3 className="font-black flex items-center justify-center gap-2 text-slate-900 dark:text-white text-sm md:text-base">
          <MapPin className="w-5 h-5 text-emerald-600" /> Calles de Valparaíso
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Arrastra para explorar • Zoom con +/-</p>
      </div>

      {/* Tiles + marcadores */}
      <div
        className="absolute top-1/2 left-1/2 pointer-events-none"
        style={{ transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(${scale})` }}
      >
        {tiles.map(t => (
          <img
            key={`${t.tx}-${t.ty}`}
            src={`https://tile.openstreetmap.org/${ZOOM}/${t.tx}/${t.ty}.png`}
            className={`absolute max-w-none pointer-events-none select-none ${darkMode ? 'invert hue-rotate-180 brightness-90 contrast-75 opacity-95' : ''}`}
            style={{ left: t.left, top: t.top, width: TILE_SIZE, height: TILE_SIZE }}
            alt=""
            draggable="false"
          />
        ))}

        {parks.map(park => {
          const px = (lng2tile(park.lng, ZOOM) - centerTileX) * TILE_SIZE;
          const py = (lat2tile(park.lat, ZOOM) - centerTileY) * TILE_SIZE;
          return (
            <div
              key={park.id}
              className="absolute group z-10 pointer-events-auto cursor-pointer"
              style={{ left: px, top: py, transform: 'translate(-50%, -100%)' }}
              onPointerDown={e => e.stopPropagation()}
              onClick={() => onSelectPark(park)}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-emerald-500/40 rounded-full animate-pulse"></div>
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-3 rounded-full text-white shadow-2xl hover:scale-125 transition-transform border-3 border-white dark:border-slate-800 relative z-10">
                  <MapPin className="w-6 h-6" />
                </div>
              </div>
              {/* Tooltip hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-52 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none border-2 border-slate-200 dark:border-slate-700 scale-95 group-hover:scale-100 origin-bottom z-50">
                <img src={park.imageUrl} alt="" className="w-full h-24 object-cover rounded-xl mb-2.5" onError={handleImageError} />
                <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight text-center">{park.name}</p>
                <div className="flex items-center justify-center gap-1 mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Ver detalles <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- MAIN APP COMPONENT ---
function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('valpoverde-theme') === 'dark';
    }
    return false;
  });

  const toggleDarkMode = (newMode) => {
    setDarkMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('valpoverde-theme', newMode ? 'dark' : 'light');
    }
  };

  const [userProfile] = useState({
    uid: 'local-dev-id',
    displayName: 'Usuario Explorador',
    bio: 'Amante de las áreas verdes de Valparaíso',
    photoURL: null
  });
  const [parks] = useState(SEED_PARKS);
  const [posts, setPosts] = useState(SEED_REVIEWS);

  const [activeTab, setActiveTab] = useState('home');
  const [selectedPark, setSelectedPark] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');

  const categories = ['Todos', 'Familiar', 'Mirador', 'Deporte', 'Mascotas', 'Cultura'];

  const filteredParks = useMemo(() => {
    return parks.filter(park => {
      const safeSearch = searchQuery ? searchQuery.toLowerCase() : '';
      const nameMatch = park.name && park.name.toLowerCase().includes(safeSearch);
      const addressMatch = park.address && park.address.toLowerCase().includes(safeSearch);
      const catMatch = activeCategory === 'Todos' || (park.categories && park.categories.includes(activeCategory));
      return (nameMatch || addressMatch) && catMatch;
    });
  }, [parks, searchQuery, activeCategory]);

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setSelectedPark(null);
    setSelectedArticle(null);
  };

  return (
    <div className={darkMode ? 'dark' : ''} style={{ width: '100%', height: '100%' }}>
      <div className="flex flex-col md:flex-row h-screen w-full bg-white dark:bg-slate-950 font-sans overflow-hidden text-slate-950 dark:text-slate-50 transition-colors duration-300">

        <style>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>

        {/* SIDEBAR DESKTOP */}
        <aside className="hidden md:flex flex-col w-64 lg:w-80 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-xl z-20 shrink-0 transition-colors duration-300">
          <div className="p-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black bg-gradient-to-br from-emerald-600 to-teal-700 bg-clip-text text-transparent tracking-tighter flex items-center gap-2">
                <Leaf className="w-8 h-8 text-emerald-600" /> ValpoVerde
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-2 uppercase tracking-wider">Red de Áreas Verdes</p>
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-1 px-4 mt-4 overflow-y-auto hide-scrollbar">
            <SidebarButton icon={<Home className="w-5 h-5" />} label="Inicio" active={activeTab === 'home' && !selectedPark} onClick={() => handleNavClick('home')} />
            <SidebarButton icon={<MapPin className="w-5 h-5" />} label="Mapa Interactivo" active={activeTab === 'map'} onClick={() => handleNavClick('map')} />
            <SidebarButton icon={<Users className="w-5 h-5" />} label="Comunidad" active={activeTab === 'community'} onClick={() => handleNavClick('community')} />
            <SidebarButton icon={<BookOpen className="w-5 h-5" />} label="Aprende (Wiki)" active={activeTab === 'wiki'} onClick={() => handleNavClick('wiki')} />
            <SidebarButton icon={<Info className="w-5 h-5" />} label="Soporte" active={activeTab === 'support'} onClick={() => handleNavClick('support')} />
            <SidebarButton icon={<User className="w-5 h-5" />} label="Mi Perfil" active={activeTab === 'profile'} onClick={() => handleNavClick('profile')} />
          </nav>

          <div className="px-6 py-4">
            <button
              onClick={() => toggleDarkMode(!darkMode)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-sm font-bold text-slate-600 dark:text-slate-300 shadow-sm hover:shadow-md"
            >
              <span className="text-lg">{darkMode ? '☀️' : '🌙'}</span>
              {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
            </button>
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <div
              className="bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-100 dark:border-emerald-900/50 p-4 rounded-2xl flex items-center gap-3 cursor-pointer transition-all shadow-sm"
              onClick={() => handleNavClick('profile')}
            >
              <UserAvatar name={userProfile.displayName} photoURL={userProfile.photoURL} sizeClasses="w-10 h-10 text-sm" />
              <div className="overflow-hidden flex-1">
                <div className="text-sm font-bold text-emerald-900 dark:text-emerald-200 truncate">{userProfile.displayName}</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate uppercase font-bold tracking-wider">Ver perfil</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ÁREA PRINCIPAL */}
        <div className="flex-1 flex flex-col relative overflow-hidden w-full bg-white dark:bg-slate-950 transition-colors duration-300">

          {/* HEADER MÓVIL */}
          <header className="md:hidden bg-white dark:bg-slate-950 px-5 py-4 shadow-md z-20 flex justify-between items-center shrink-0 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('home')}>
              <Leaf className="w-6 h-6 text-emerald-600" />
              <h1 className="text-xl font-black bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent leading-none">ValpoVerde</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleDarkMode(!darkMode)}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center w-10 h-10 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="text-lg">{darkMode ? '☀️' : '🌙'}</span>
              </button>
              <div onClick={() => handleNavClick('profile')} className="cursor-pointer">
                <UserAvatar name={userProfile.displayName} photoURL={userProfile.photoURL} sizeClasses="w-8 h-8 text-sm" />
              </div>
            </div>
          </header>

          <main className="flex-1 relative w-full h-full overflow-hidden">
            {activeTab === 'map' && !selectedPark && !selectedArticle ? (
              <div className="absolute inset-0 z-0">
                <OSMap parks={parks} onSelectPark={setSelectedPark} darkMode={darkMode} />
              </div>
            ) : (
              <div className="absolute inset-0 z-0 overflow-y-auto pb-20 md:pb-0 flex flex-col justify-between hide-scrollbar scroll-smooth">
                <div className="flex-1">
                  {selectedPark ? (
                    <ParkDetailView
                      park={selectedPark}
                      posts={posts}
                      onBack={() => setSelectedPark(null)}
                      userProfile={userProfile}
                      setPosts={setPosts}
                    />
                  ) : selectedArticle ? (
                    <ArticleDetailView article={selectedArticle} onBack={() => setSelectedArticle(null)} />
                  ) : (
                    <>
                      {activeTab === 'home' && (
                        <HomeView
                          parks={filteredParks}
                          categories={categories}
                          activeCategory={activeCategory}
                          setActiveCategory={setActiveCategory}
                          searchQuery={searchQuery}
                          setSearchQuery={setSearchQuery}
                          onSelectPark={setSelectedPark}
                        />
                      )}
                      {activeTab === 'community' && (
                        <CommunityView
                          posts={posts}
                          parks={parks}
                          onSelectPark={setSelectedPark}
                          userProfile={userProfile}
                          setPosts={setPosts}
                        />
                      )}
                      {activeTab === 'wiki' && (
                        <WikiView
                          articles={WIKI_ARTICLES}
                          onSelectArticle={setSelectedArticle}
                        />
                      )}
                      {activeTab === 'support' && <SupportView />}
                      {activeTab === 'profile' && (
                        <ProfileView
                          userProfile={userProfile}
                          myPosts={posts.filter(p => p.userId === userProfile.uid)}
                        />
                      )}
                    </>
                  )}
                </div>
                <Footer />
              </div>
            )}
          </main>

          {/* NAV MÓVIL */}
          <nav className="md:hidden absolute bottom-0 w-full bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-around py-2 px-1 z-30 shadow-[0_-4px_25px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.5)]">
            <MobileNavButton icon={<Home />} label="Inicio" active={activeTab === 'home'} onClick={() => handleNavClick('home')} />
            <MobileNavButton icon={<MapPin />} label="Mapa" active={activeTab === 'map'} onClick={() => handleNavClick('map')} />
            <MobileNavButton icon={<Users />} label="Comunidad" active={activeTab === 'community'} onClick={() => handleNavClick('community')} />
            <MobileNavButton icon={<BookOpen />} label="Aprende" active={activeTab === 'wiki'} onClick={() => handleNavClick('wiki')} />
            <MobileNavButton icon={<User />} label="Perfil" active={activeTab === 'profile'} onClick={() => handleNavClick('profile')} />
          </nav>
        </div>
      </div>
    </div>
  );
}

// --- VISTAS ---

function HomeView({ parks, categories, activeCategory, setActiveCategory, searchQuery, setSearchQuery, onSelectPark }) {
  return (
    <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-10 md:space-y-16">
      <div className="space-y-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-950 dark:text-white mb-2 tracking-tight">Descubre lugares</h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Explora las áreas verdes de Valparaíso</p>
        </div>
        <div className="relative w-full max-w-md">
          <Search className="absolute inset-y-0 left-4 my-auto h-5 w-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none shadow-md transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
            placeholder="Buscar parques..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categorías */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Filtrar por categoría</h3>
        <div className="flex overflow-x-auto gap-2 pb-3 hide-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold border-2 transition-all ${activeCategory === cat
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-700 shadow-lg shadow-emerald-600/30'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
            >{cat}</button>
          ))}
        </div>
      </div>

      {/* Grilla parques */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-7">
          {parks.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-400 dark:text-slate-600">
              <MapPin className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="font-bold text-lg">No se encontraron parques con ese filtro.</p>
            </div>
          ) : parks.map(park => (
            <div
              key={park.id}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl dark:shadow-slate-950 border border-slate-100 dark:border-slate-700 overflow-hidden cursor-pointer transition-all hover:-translate-y-1 group flex flex-col"
              onClick={() => onSelectPark(park)}
            >
              <div className="h-48 relative bg-slate-200 dark:bg-slate-700 shrink-0 overflow-hidden">
                <img src={park.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={handleImageError} alt={park.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-3 right-3 bg-white dark:bg-slate-900 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sm font-bold shadow-lg border border-white/20 dark:border-slate-700">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-slate-900 dark:text-white">{Number(park.rating || 0).toFixed(1)}</span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-950 dark:text-white line-clamp-1 text-lg mb-2">{park.name}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-1.5 mt-auto">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" /> 
                  <span className="line-clamp-1">{park.categories?.[0] || 'Parque'}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Misión y Visión */}
      <div className="mt-20 pt-16 border-t-2 border-slate-200 dark:border-slate-800">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">Nuestro Propósito</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">Más que una aplicación, ValpoVerde es un movimiento para recuperar y cuidar la naturaleza urbana.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-3xl shadow-lg border-2 border-emerald-100 dark:border-emerald-900/30 relative overflow-hidden group hover:shadow-2xl transition-all">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Leaf className="w-40 h-40 text-emerald-600" /></div>
            <div className="bg-emerald-100 dark:bg-emerald-900/50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg border-2 border-emerald-200 dark:border-emerald-800">
              <Leaf className="w-8 h-8 text-emerald-700 dark:text-emerald-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-950 dark:text-white mb-4">Misión</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg relative z-10 font-medium">
              Conectar a los ciudadanos de Valparaíso con sus áreas verdes, facilitando la información, el cuidado y la apropiación de los espacios públicos mediante la participación activa y el reporte ciudadano.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-3xl shadow-lg border-2 border-teal-100 dark:border-teal-900/30 relative overflow-hidden group hover:shadow-2xl transition-all">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Search className="w-40 h-40 text-teal-600" /></div>
            <div className="bg-teal-100 dark:bg-teal-900/50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg border-2 border-teal-200 dark:border-teal-800">
              <Search className="w-8 h-8 text-teal-700 dark:text-teal-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-950 dark:text-white mb-4">Visión</h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg relative z-10 font-medium">
              Convertir a Valparaíso en una ciudad más verde, limpia y sustentable, donde la comunidad sea la principal guardiana de sus parques y plazas, asegurando un entorno sano para las futuras generaciones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ParkDetailView({ park, posts, onBack, userProfile, setPosts }) {
  const parkPosts = posts.filter(p => p.parkId === park.id);
  const reviews = parkPosts.filter(p => p.type === 'review');
  const safeParkRating = Number(park.rating || 0);
  const avg = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)
    : safeParkRating.toFixed(1);

  return (
    <div className="bg-white dark:bg-slate-950 min-h-full relative pb-10 transition-colors duration-300">
      <div className="h-72 md:h-96 relative w-full bg-slate-200 dark:bg-slate-800">
        <button
          onClick={onBack}
          className="absolute top-5 left-5 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-2.5 rounded-full shadow-xl text-slate-800 dark:text-white hover:scale-110 transition-transform border-2 border-white dark:border-slate-700"
        >
          <X className="w-6 h-6" />
        </button>
        <img src={park.imageUrl} className="w-full h-full object-cover" onError={handleImageError} alt={park.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-10 text-white w-full">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-3">{park.name}</h1>
          <p className="text-slate-100 flex items-center gap-2 text-lg font-semibold"><MapPin className="w-5 h-5" /> {park.address}</p>
        </div>
      </div>

      <div className="p-6 md:p-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-10">
          <section>
            <h2 className="text-2xl font-black mb-4 flex items-center gap-3 text-slate-950 dark:text-white">
              <Info className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /> Acerca de
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg font-medium">{park.description}</p>
          </section>
          <section>
            <h2 className="text-2xl font-black mb-5 flex items-center gap-3 text-slate-950 dark:text-white">
              <MessageCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /> Muro del Parque
            </h2>
            <div className="space-y-5">
              {parkPosts.length === 0 ? (
                <p className="text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center text-lg">
                  No hay publicaciones aquí todavía.
                </p>
              ) : parkPosts.map(post => (
                <PostCard key={post.id} post={post} parkName={park.name} />
              ))}
            </div>
          </section>
        </div>
        <div>
          <div className="sticky top-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/30 p-8 rounded-3xl border-2 border-emerald-200 dark:border-emerald-800/50 text-center mb-6 shadow-lg">
            <div className="text-6xl font-black text-emerald-700 dark:text-emerald-400 mb-2">{avg}</div>
            <p className="text-sm text-emerald-800 dark:text-emerald-500 font-black uppercase tracking-wider">Calificación</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-semibold">Basado en {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 space-y-4 text-sm">
            <div className="flex items-center gap-3 font-bold text-slate-700 dark:text-slate-300">
              <span className="text-2xl">🕐</span> <div><div className="text-xs text-slate-500 dark:text-slate-400 font-normal">Horario</div>{park.hours}</div>
            </div>
            <div className="flex items-center gap-3 font-bold">
              <span className={`text-2xl ${park.status.includes('Abierto') ? 'text-emerald-500' : 'text-red-500'}`}>●</span>
              <div><div className="text-xs text-slate-500 dark:text-slate-400 font-normal">Estado</div><span className="text-slate-700 dark:text-slate-300">{park.status}</span></div>
            </div>
            {park.categories && (
              <div className="pt-2">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-2">Categorías</div>
                <div className="flex flex-wrap gap-2">
                  {park.categories.map(c => (
                    <span key={c} className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-black px-3 py-1.5 rounded-lg">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CommunityView({ posts, parks, onSelectPark, userProfile, setPosts }) {
  const [showReportModal, setShowReportModal] = useState(false);

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [posts]);

  const getParkName = (parkId) => parks.find(p => p.id === parkId)?.name || 'Lugar Desconocido';

  return (
    <div className="p-4 md:p-12 max-w-4xl mx-auto">
      <div className="mb-10 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-900 dark:to-teal-900 p-8 md:p-10 rounded-3xl text-white shadow-2xl border-2 border-emerald-500 dark:border-emerald-800">
        <div className="text-center sm:text-left">
          <h2 className="text-3xl md:text-4xl font-black mb-2 flex items-center justify-center sm:justify-start gap-2">
            <Users className="w-8 h-8 md:w-10 md:h-10 text-emerald-100" /> Comunidad
          </h2>
          <p className="text-emerald-50 font-semibold text-sm md:text-base">Comparte experiencias o reporta problemas en áreas verdes.</p>
        </div>
        <button
          onClick={() => setShowReportModal(true)}
          className="bg-white dark:bg-slate-100 text-teal-700 dark:text-teal-900 font-black px-6 py-3.5 rounded-xl shadow-xl hover:scale-105 hover:shadow-2xl transition-all flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center border-b-4 border-teal-200"
        >
          <span className="text-2xl">⚠️</span> Generar Alerta
        </button>
      </div>

      <div className="space-y-6">
        {sortedPosts.length === 0 ? (
          <div className="text-center py-16 text-slate-400 dark:text-slate-600">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="font-bold text-lg">Sin publicaciones aún.</p>
          </div>
        ) : sortedPosts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            parkName={getParkName(post.parkId)}
            onClickPark={() => { const p = parks.find(x => x.id === post.parkId); if (p) onSelectPark(p); }}
          />
        ))}
      </div>

      {showReportModal && (
        <ReportModal
          parks={parks}
          userProfile={userProfile}
          onClose={() => setShowReportModal(false)}
          onSubmit={(newReport) => setPosts(prev => [newReport, ...prev])}
        />
      )}
    </div>
  );
}

function PostCard({ post, parkName, onClickPark }) {
  const isReport = post.type === 'report';

  return (
    <div className={`bg-white dark:bg-slate-800 p-6 md:p-7 rounded-3xl shadow-lg border-2 ${isReport
      ? 'border-red-200 dark:border-red-900/50'
      : 'border-slate-200 dark:border-slate-700'} hover:shadow-xl dark:hover:shadow-slate-950 transition-all`}
    >
      <div className="flex justify-between items-start mb-4 gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <UserAvatar name={post.userName} photoURL={post.userPhoto} sizeClasses="w-12 h-12 text-lg" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-950 dark:text-slate-100 leading-tight">{post.userName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{formatDate(post.createdAt)}</p>
          </div>
        </div>
        <div
          className={`text-xs font-black px-3 py-2 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 ${isReport
            ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/50'
            : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'}`}
          onClick={onClickPark}
        >
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="line-clamp-1">{parkName}</span>
        </div>
      </div>

      {isReport ? (
        <div className="mb-4 inline-flex items-center gap-1.5 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide border border-red-200 dark:border-red-800/50">
          <span>⚠️</span> Alerta: {post.reportCategory}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 mb-4 bg-slate-50 dark:bg-slate-700/50 w-fit px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
          {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} className={`w-4 h-4 ${i <= (post.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300 dark:text-slate-600'}`} />
          ))}
        </div>
      )}

      <p className="text-slate-800 dark:text-slate-300 leading-relaxed text-base md:text-lg font-medium mb-4">{post.text}</p>

      {post.imageUrl && (
        <div className="mb-5 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
          <img src={post.imageUrl} alt="Foto adjunta" className="w-full h-56 md:h-72 object-cover" onError={handleImageError} />
        </div>
      )}

      <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex gap-6 text-slate-600 dark:text-slate-400 text-sm">
        <button className="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition font-bold">
          <Heart className="w-5 h-5" /> Apoyar
        </button>
        <button className="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition font-bold">
          <MessageCircle className="w-5 h-5" /> Comentar
        </button>
      </div>
    </div>
  );
}

function ReportModal({ parks, userProfile, onClose, onSubmit }) {
  const [parkId, setParkId] = useState(parks[0]?.id || '');
  const [reportCategory, setReportCategory] = useState('Basural');
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState(null);

  const CATEGORIES = ['Basural', 'Mobiliario Dañado', 'Fuga de Agua', 'Iluminación', 'Otro'];

  // Imagen de reporte: basura en naturaleza
  const handleFakeUpload = () => setImageUrl('https://images.unsplash.com/photo-1604187352009-5c9d7e3e3c9d?w=800&q=80');

  const handleSubmit = () => {
    if (!text.trim()) return;
    const newReport = {
      id: `rep${Date.now()}`,
      type: 'report',
      reportCategory,
      parkId,
      userId: userProfile.uid,
      userName: userProfile.displayName,
      userPhoto: userProfile.photoURL,
      text,
      imageUrl,
      createdAt: new Date().toISOString()
    };
    onSubmit(newReport);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh] border border-slate-100 dark:border-slate-700">
        <div className="px-6 py-4 border-b border-red-100 dark:border-red-900/50 flex justify-between items-center bg-red-50 dark:bg-red-900/20">
          <h3 className="font-bold text-lg text-red-800 dark:text-red-400 flex items-center gap-2"><span>⚠️</span> Generar Alerta</h3>
          <button onClick={onClose} className="text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-white dark:bg-red-900/50 p-1 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto hide-scrollbar">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">¿Dónde es el problema?</label>
            <select
              value={parkId}
              onChange={e => setParkId(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-700 font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-red-500"
            >
              {parks.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Tipo de Problema</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setReportCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${reportCategory === cat
                    ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800 shadow-sm'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                >{cat}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Descripción</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Describe el problema detalladamente..."
              rows="3"
              className="w-full border border-slate-300 dark:border-slate-600 rounded-xl p-4 focus:ring-2 focus:ring-red-500 outline-none resize-none bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Evidencia (Foto)</label>
            {!imageUrl ? (
              <button
                onClick={handleFakeUpload}
                className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-300 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400 transition-colors flex flex-col items-center justify-center gap-2 group"
              >
                <div className="bg-white dark:bg-slate-700 p-3 rounded-full shadow-sm border border-slate-100 dark:border-slate-600 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">📷</span>
                </div>
                <span className="font-semibold text-sm">Tocar para subir foto</span>
              </button>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600">
                <img src={imageUrl} alt="Evidencia" className="w-full h-40 object-cover" onError={handleImageError} />
                <button onClick={() => setImageUrl(null)} className="absolute top-2 right-2 bg-red-600/90 backdrop-blur-sm text-white p-1.5 rounded-lg shadow-md hover:bg-red-700 transition">
                  <span>🗑️</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold py-3.5 rounded-xl hover:from-red-700 hover:to-rose-700 transition shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-b-4 border-red-800"
          >
            <Send className="w-5 h-5" /> Publicar Alerta
          </button>
        </div>
      </div>
    </div>
  );
}

// ✅ CORRECCIÓN CRÍTICA: WikiView ahora usa onSelectArticle en el onClick de cada artículo
function WikiView({ articles, onSelectArticle }) {
  return (
    <div className="p-4 md:p-12 max-w-6xl mx-auto">
      <div className="mb-12">
        <h2 className="text-4xl md:text-5xl font-black mb-3 flex items-center gap-3 text-slate-950 dark:text-white">
          <BookOpen className="w-10 h-10 text-emerald-600" /> Aprende (Wiki)
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg">Encuentra artículos útiles sobre huertos urbanos, sustentabilidad y más.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        {articles.map(a => (
          <div
            key={a.id}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg hover:shadow-2xl dark:shadow-slate-950 overflow-hidden border border-slate-200 dark:border-slate-700 transition-all cursor-pointer hover:-translate-y-1 group"
            onClick={() => onSelectArticle(a)}
          >
            <div className="relative h-60 overflow-hidden">
              <img
                src={a.imageUrl}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={handleImageError}
                alt={a.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 shadow-lg">
                <BookOpen className="w-3.5 h-3.5" /> {a.readTime}
              </div>
            </div>
            <div className="p-6">
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2.5 block">{a.category}</span>
              <h3 className="font-black text-xl mb-3 text-slate-950 dark:text-white leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{a.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3">{a.content}</p>
              <div className="mt-5 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
                Leer más <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SupportView() {
  return (
    <div className="p-4 md:p-12 max-w-2xl mx-auto text-center mt-12 md:mt-16">
      <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/40 w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-700 dark:text-emerald-400 shadow-lg border-2 border-emerald-200 dark:border-emerald-800">
        <Info className="w-14 h-14" />
      </div>
      <h2 className="text-4xl md:text-5xl font-black mb-5 text-slate-950 dark:text-white">Centro de Soporte</h2>
      <p className="text-slate-700 dark:text-slate-300 mb-10 text-lg md:text-xl leading-relaxed">Para soporte técnico, agregar un parque o reportar problemas con tu cuenta, utiliza nuestros canales oficiales.</p>
      <button className="bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-600 dark:to-teal-600 text-white font-black px-10 py-5 rounded-2xl shadow-xl hover:scale-105 transition-transform border-b-4 border-emerald-900 dark:border-emerald-800 text-lg">
        Contactar Administración
      </button>
    </div>
  );
}

function ProfileView({ userProfile, myPosts }) {
  return (
    <div className="p-4 md:p-12 max-w-5xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden mb-10">
        <div className="h-40 md:h-48 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600"></div>
        <div className="px-6 md:px-10 pb-10 -mt-20 relative">
          <UserAvatar name={userProfile.displayName} sizeClasses="w-32 h-32 md:w-40 md:h-40 text-5xl shadow-2xl mb-5 border-4 border-white dark:border-slate-800" />
          <h1 className="text-4xl md:text-5xl font-black text-slate-950 dark:text-white">{userProfile.displayName}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-3 text-lg md:text-xl font-semibold">{userProfile.bio}</p>
        </div>
      </div>
      <h3 className="text-2xl font-black mb-7 text-slate-950 dark:text-white border-b-2 border-slate-200 dark:border-slate-800 pb-4">
        Mi Actividad ({myPosts.length})
      </h3>
      <div className="space-y-5">
        {myPosts.length === 0
          ? <p className="text-slate-600 dark:text-slate-400 italic text-lg text-center py-12">Sin actividad registrada aún.</p>
          : myPosts.map(post => <PostCard key={post.id} post={post} parkName="Lugar Registrado" />)
        }
      </div>
    </div>
  );
}

function ArticleDetailView({ article, onBack }) {
  return (
    <div className="bg-white dark:bg-slate-950 min-h-full p-6 md:p-12 max-w-4xl mx-auto border-x border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <button
        onClick={onBack}
        className="mb-10 flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-6 py-3 rounded-full font-black text-sm hover:bg-emerald-200 dark:hover:bg-emerald-800/70 transition-colors border-2 border-emerald-200 dark:border-emerald-800"
      >
        <ChevronRight className="w-5 h-5 rotate-180" /> Volver a la Wiki
      </button>
      <span className="text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest text-sm mb-5 block">{article.category}</span>
      <h1 className="text-5xl md:text-6xl font-black mb-8 text-slate-950 dark:text-white leading-tight tracking-tight">{article.title}</h1>
      <img
        src={article.imageUrl}
        className="w-full h-80 md:h-96 object-cover rounded-3xl mb-12 shadow-xl border-2 border-slate-200 dark:border-slate-800"
        onError={handleImageError}
        alt={article.title}
      />
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <p className="text-slate-800 dark:text-slate-200 text-xl md:text-2xl leading-relaxed font-medium whitespace-pre-line">{article.content}</p>
      </div>
    </div>
  );
}

export default function Main() {
  return <ErrorBoundary><App /></ErrorBoundary>;
}

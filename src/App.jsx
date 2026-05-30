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
const FALLBACK_IMAGE = 'blob:https://web.whatsapp.com/734780c5-17cb-4eb1-9e00-3c5d8b3e08b5';

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
    imageUrl: 'https://parquecultural.cl/wp-content/uploads/2022/04/Parque_Cultural_de_Valparaiso-768x513.jpg'
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
    imageUrl: 'https://chileestuyo.cl/wp-content/uploads/2019/11/paseoyugoslavo.jpg'
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
    imageUrl: 'https://www.rutaschile.com/configurador/Parques/Atractivo_2752020171925.jpg'
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
    imageUrl: 'https://64.media.tumblr.com/b1ed1ed1442441d2c65becfbeeafa317/tumblr_nup7cd3PkC1rlw0blo2_1280.jpg'
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
    text: 'Gente irresponsable dejó un montón de basura y plásticos cerca del camino principal. Hay que organizar una limpieza comunitaria.',
    // Basura en entorno natural — imagen de problema ambiental real
    imageUrl: 'https://s2.ppllstatics.com/diariosur/www/multimedia/201809/25/media/cortadas/parque2-kyQH-U601023065386SyE-624x385@Diario%20Sur.jpg',
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
    imageUrl: 'https://ciudadccs.info/gestor/archivos/imagenes/blobs/fileblob231205091814.jpg',
    content: 'Tener un huerto en departamento es totalmente posible. Lo principal es elegir macetas con buen drenaje y plantas que no requieran raíces profundas, como lechugas o hierbas aromáticas. Asegúrate de ubicarlas en un balcón o ventana que reciba al menos 4 a 6 horas de sol directo al día. Comienza con semillas fáciles como cilantro, albahaca o rábanos, que germinan rápido y te darán satisfacción casi inmediata.'
  },
  {
    id: 'w2',
    title: 'Guía de compostaje para departamentos',
    category: 'Sustentabilidad',
    readTime: '7 min',
    // Compost con restos vegetales y tierra — imagen de compostaje real
    imageUrl: 'https://efecomunica.efe.com/wp-content/uploads/2024/01/rss-efedf4060fb5b0e3540251c4351ab519b953bc78e2dw.jpg',
    content: 'El vermicompostaje es ideal para espacios pequeños porque no emite malos olores si se maneja correctamente. Agrega restos de vegetales crudos, cáscaras de huevo y borra de café, equilibrando siempre con material seco como cartón sin tinta. En pocas semanas tendrás abono de alta calidad para tus plantas y reducirás significativamente tus residuos orgánicos.'
  },
  {
    id: 'w3',
    title: 'Especies nativas de Valparaíso para tu jardín',
    category: 'Flora Local',
    readTime: '6 min',
    // Flores nativas chilenas — quillay, copihue o flora mediterránea local
    imageUrl: 'https://www.gochile.cl/fotos/catalogo-2/63179-chilco-alejandro-bayer@2x.jpg',
    content: 'Plantas como el litre, el molle y la pica-pica son ideales para jardines en la Región de Valparaíso porque están adaptadas al clima mediterráneo local y requieren muy poco riego. Al usar flora nativa contribuyes a la biodiversidad y apoyas a los insectos polinizadores nativos de la zona.'
  },
  {
    id: 'w4',
    title: 'Cómo reportar un problema en tu parque',
    category: 'Participación Ciudadana',
    readTime: '3 min',
    // Persona tomando foto con celular en parque — reporte ciudadano
    imageUrl: 'https://www.infraestructurapublica.cl/wp-content/uploads/2021/12/not7-02122021-696x461.jpg',
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
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${active
        ? 'bg-gradient-to-r from-emerald-100 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/20 text-emerald-700 dark:text-emerald-400 shadow-sm'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}`}
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
    <footer className="mt-12 py-8 text-center border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-colors duration-300">
      <div className="flex flex-col items-center justify-center gap-2">
        <Leaf className="w-5 h-5 text-emerald-500 opacity-50" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Proyecto formativo desarrollado para{' '}
          <span className="font-black tracking-tight text-red-600 dark:text-red-500">@inacap</span>
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500">ValpoVerde App © {new Date().getFullYear()}</p>
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
      className="absolute inset-0 bg-[#aad3df] dark:bg-[#0f172a] overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing"
      onPointerDown={(e) => startDrag(e.clientX, e.clientY, e)}
      onPointerMove={(e) => doDrag(e.clientX, e.clientY)}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
    >
      {/* Controles zoom */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
        <button
          onClick={() => setScale(s => Math.min(s + 0.4, 3))}
          className="w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-xl shadow-lg flex items-center justify-center text-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
          onPointerDown={e => e.stopPropagation()}
        >+</button>
        <button
          onClick={() => setScale(s => Math.max(s - 0.4, 0.5))}
          className="w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-xl shadow-lg flex items-center justify-center text-3xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all leading-none pb-1"
          onPointerDown={e => e.stopPropagation()}
        >-</button>
        <button
          onClick={() => { setScale(1); setPos({ x: 0, y: 0 }); }}
          className="w-10 h-10 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 rounded-xl shadow-lg flex items-center justify-center font-bold hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
          onPointerDown={e => e.stopPropagation()}
        ><MapPin className="w-5 h-5" /></button>
      </div>

      {/* Leyenda */}
      <div className="absolute top-6 right-6 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-3 px-4 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 text-center pointer-events-none">
        <h3 className="font-bold flex items-center justify-center gap-2 text-slate-900 dark:text-white">
          <MapPin className="w-4 h-4 text-emerald-500" /> Calles de Valparaíso
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Arrastra el mapa para explorar</p>
      </div>

      {/* Tiles + marcadores */}
      <div
        className="absolute top-1/2 left-1/2 pointer-events-none"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }}
      >
        {tiles.map(t => (
          <img
            key={`${t.tx}-${t.ty}`}
            src={`https://tile.openstreetmap.org/${ZOOM}/${t.tx}/${t.ty}.png`}
            className={`absolute max-w-none pointer-events-none ${darkMode ? 'invert hue-rotate-180 brightness-90 contrast-75' : ''}`}
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
                <div className="absolute -inset-4 bg-emerald-500/30 rounded-full animate-ping"></div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-full text-white shadow-xl hover:scale-110 transition-transform border-2 border-white dark:border-slate-800 relative z-10">
                  <MapPin className="w-6 h-6" />
                </div>
              </div>
              {/* Tooltip hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none border border-slate-100 dark:border-slate-700 scale-95 group-hover:scale-100 origin-bottom">
                <img src={park.imageUrl} alt="" className="w-full h-20 object-cover rounded-xl mb-2" onError={handleImageError} />
                <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight text-center">{park.name}</p>
                <div className="flex items-center justify-center gap-1 mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
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
  const [darkMode, setDarkMode] = useState(false);
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
    <div className={`${darkMode ? 'dark' : ''} w-full h-screen overflow-hidden`}>
      <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 dark:bg-slate-900 font-sans overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-300">

        <style>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>

        {/* SIDEBAR DESKTOP */}
        <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-sm z-20 shrink-0 transition-colors duration-300">
          <div className="p-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black bg-gradient-to-br from-emerald-500 to-teal-600 bg-clip-text text-transparent tracking-tight flex items-center gap-2">
                <Leaf className="w-8 h-8 text-emerald-500" /> ValpoVerde
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Red de Áreas Verdes</p>
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-2 px-4 mt-2 overflow-y-auto hide-scrollbar">
            <SidebarButton icon={<Home />} label="Inicio" active={activeTab === 'home' && !selectedPark} onClick={() => handleNavClick('home')} />
            <SidebarButton icon={<MapPin />} label="Mapa Interactivo" active={activeTab === 'map'} onClick={() => handleNavClick('map')} />
            <SidebarButton icon={<Users />} label="Comunidad" active={activeTab === 'community'} onClick={() => handleNavClick('community')} />
            <SidebarButton icon={<BookOpen />} label="Aprende (Wiki)" active={activeTab === 'wiki'} onClick={() => handleNavClick('wiki')} />
            <SidebarButton icon={<Info />} label="Soporte" active={activeTab === 'support'} onClick={() => handleNavClick('support')} />
            <SidebarButton icon={<User />} label="Mi Perfil" active={activeTab === 'profile'} onClick={() => handleNavClick('profile')} />
          </nav>

          <div className="px-6 py-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-sm font-bold text-slate-600 dark:text-slate-200 shadow-sm"
            >
              <span className="text-lg">{darkMode ? '☀️' : '🌙'}</span>
              {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
            </button>
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-700">
            <div
              className="bg-emerald-50/50 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-slate-600 border border-transparent dark:border-slate-600 p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all shadow-sm"
              onClick={() => handleNavClick('profile')}
            >
              <UserAvatar name={userProfile.displayName} photoURL={userProfile.photoURL} />
              <div className="overflow-hidden">
                <div className="text-sm font-bold text-emerald-900 dark:text-slate-100 truncate">{userProfile.displayName}</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 truncate uppercase font-bold tracking-wider">Ver perfil</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ÁREA PRINCIPAL */}
        <div className="flex-1 flex flex-col relative overflow-hidden w-full bg-slate-50 dark:bg-slate-900 transition-colors duration-300">

          {/* HEADER MÓVIL */}
          <header className="md:hidden bg-white dark:bg-slate-800 px-5 py-4 shadow-sm z-20 flex justify-between items-center shrink-0 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('home')}>
              <Leaf className="w-6 h-6 text-emerald-500" />
              <h1 className="text-xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent leading-none">ValpoVerde</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center w-10 h-10"
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 md:space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Descubre lugares</h2>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute inset-y-0 left-3 my-auto h-5 w-5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm transition-colors"
            placeholder="Buscar plazas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categorías */}
      <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold border transition-all ${activeCategory === cat
              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white border-transparent shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >{cat}</button>
        ))}
      </div>

      {/* Grilla parques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {parks.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-400 dark:text-slate-600">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No se encontraron parques con ese filtro.</p>
          </div>
        ) : parks.map(park => (
          <div
            key={park.id}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-xl dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 overflow-hidden cursor-pointer transition-all hover:-translate-y-1 flex flex-col"
            onClick={() => onSelectPark(park)}
          >
            <div className="h-48 relative bg-slate-200 dark:bg-slate-700 shrink-0">
              <img src={park.imageUrl} className="w-full h-full object-cover" onError={handleImageError} alt={park.name} />
              <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-sm font-bold shadow-sm border border-white/20 dark:border-slate-600">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                {Number(park.rating || 0).toFixed(1)}
              </div>
            </div>
            <div className="p-4 flex-1">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{park.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {park.categories?.[0] || 'Parque'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Misión y Visión */}
      <div className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent mb-4">Nuestro Propósito</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Más que una aplicación, ValpoVerde es un movimiento para recuperar y cuidar la naturaleza urbana.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Leaf className="w-32 h-32 text-emerald-500" /></div>
            <div className="bg-emerald-100 dark:bg-emerald-900/30 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-emerald-200 dark:border-emerald-800/50">
              <Leaf className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Misión</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg relative z-10">
              Conectar a los ciudadanos de Valparaíso con sus áreas verdes, facilitando la información, el cuidado y la apropiación de los espacios públicos mediante la participación activa y el reporte ciudadano.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Search className="w-32 h-32 text-teal-500" /></div>
            <div className="bg-teal-100 dark:bg-teal-900/30 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-teal-200 dark:border-teal-800/50">
              <Search className="w-7 h-7 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Visión</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg relative z-10">
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
    <div className="bg-white dark:bg-slate-900 min-h-full relative pb-10 transition-colors duration-300">
      <div className="h-64 md:h-80 relative w-full bg-slate-200 dark:bg-slate-800">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-2 rounded-full shadow-md text-slate-800 dark:text-white hover:scale-105 transition-transform"
        >
          <X className="w-6 h-6" />
        </button>
        <img src={park.imageUrl} className="w-full h-full object-cover" onError={handleImageError} alt={park.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white w-full">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">{park.name}</h1>
          <p className="text-slate-200 flex items-center gap-1.5 opacity-90"><MapPin className="w-4 h-4" /> {park.address}</p>
        </div>
      </div>

      <div className="p-6 md:p-8 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-slate-900 dark:text-white">
              <Info className="w-5 h-5 text-emerald-500" /> Acerca de
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">{park.description}</p>
          </section>
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
              <MessageCircle className="w-5 h-5 text-emerald-500" /> Muro del Parque
            </h2>
            <div className="space-y-4">
              {parkPosts.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
                  No hay publicaciones aquí todavía.
                </p>
              ) : parkPosts.map(post => (
                <PostCard key={post.id} post={post} parkName={park.name} />
              ))}
            </div>
          </section>
        </div>
        <div>
          <div className="bg-gradient-to-b from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-900/30 text-center mb-6 shadow-sm">
            <div className="text-5xl font-black text-emerald-700 dark:text-emerald-400 mb-2">{avg}</div>
            <p className="text-sm text-emerald-800 dark:text-emerald-500 font-bold uppercase tracking-wider">Calificación general</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Basado en {reviews.length} reseñas</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-3 text-sm">
            <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
              <span className="text-emerald-500">🕐</span> Horario: {park.hours}
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <span className={park.status.includes('Abierto') ? 'text-emerald-500' : 'text-red-500'}>●</span>
              <span className="text-slate-700 dark:text-slate-300">{park.status}</span>
            </div>
            {park.categories && (
              <div className="flex flex-wrap gap-1 pt-1">
                {park.categories.map(c => (
                  <span key={c} className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded-lg">{c}</span>
                ))}
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
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gradient-to-br from-emerald-600 to-teal-700 dark:from-emerald-800 dark:to-teal-900 p-6 md:p-8 rounded-3xl text-white shadow-xl">
        <div className="text-center sm:text-left">
          <h2 className="text-2xl md:text-3xl font-black mb-1 flex items-center justify-center sm:justify-start gap-2">
            <Users className="w-6 h-6 md:w-8 md:h-8 text-teal-200" /> Comunidad
          </h2>
          <p className="text-emerald-100 font-medium text-sm md:text-base">Comparte experiencias o reporta problemas en áreas verdes.</p>
        </div>
        <button
          onClick={() => setShowReportModal(true)}
          className="bg-white dark:bg-slate-100 text-teal-700 dark:text-teal-900 font-bold px-5 py-3 rounded-xl shadow-lg hover:scale-105 hover:shadow-xl transition-all flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center border-b-4 border-teal-200 dark:border-teal-300"
        >
          <span className="text-xl">⚠️</span> Generar Alerta
        </button>
      </div>

      <div className="space-y-6">
        {sortedPosts.map(post => (
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
    <div className={`bg-white dark:bg-slate-800 p-5 md:p-6 rounded-3xl shadow-sm border ${isReport
      ? 'border-red-200 dark:border-red-900/50'
      : 'border-slate-100 dark:border-slate-700'} hover:shadow-md dark:hover:shadow-slate-900/50 transition-shadow overflow-hidden`}
    >
      <div className="flex justify-between items-start mb-4 gap-2">
        <div className="flex items-center gap-3">
          <UserAvatar name={post.userName} photoURL={post.userPhoto} />
          <div>
            <p className="font-bold text-slate-900 dark:text-slate-100 leading-none">{post.userName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatDate(post.createdAt)}</p>
          </div>
        </div>
        <div
          className={`text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 cursor-pointer transition-colors max-w-[130px] md:max-w-[180px] ${isReport
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/50 hover:bg-red-100'
            : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-100'}`}
          onClick={onClickPark}
        >
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{parkName}</span>
        </div>
      </div>

      {isReport ? (
        <div className="mb-3 inline-flex items-center gap-1.5 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border border-red-200 dark:border-red-800/50">
          <span>⚠️</span> Alerta: {post.reportCategory}
        </div>
      ) : (
        <div className="flex items-center gap-1 mb-3 bg-slate-50 dark:bg-slate-700/50 w-fit px-2 py-1 rounded-md border border-slate-100 dark:border-slate-600">
          {[1, 2, 3, 4, 5].map(i => (
            <Star key={i} className={`w-3.5 h-3.5 ${i <= (post.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 dark:text-slate-600'}`} />
          ))}
        </div>
      )}

      <p className="text-slate-800 dark:text-slate-300 leading-relaxed text-sm md:text-base">{post.text}</p>

      {post.imageUrl && (
        <div className="mt-4 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 bg-slate-100 dark:bg-slate-900">
          <img src={post.imageUrl} alt="Foto adjunta" className="w-full h-48 md:h-64 object-cover" onError={handleImageError} />
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-6 text-slate-500 dark:text-slate-400 text-sm">
        <button className="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition font-semibold">
          <Heart className="w-4 h-4" /> Apoyar
        </button>
        <button className="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition font-semibold">
          <MessageCircle className="w-4 h-4" /> Comentar
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
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <h2 className="text-3xl font-black mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
        <BookOpen className="w-8 h-8 text-emerald-500" /> Aprende (Wiki)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map(a => (
          <div
            key={a.id}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm hover:shadow-xl dark:shadow-slate-900/50 overflow-hidden border border-slate-100 dark:border-slate-700 transition-all cursor-pointer hover:-translate-y-1 group"
            onClick={() => onSelectArticle(a)}
          >
            <div className="relative h-56 overflow-hidden">
              <img
                src={a.imageUrl}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={handleImageError}
                alt={a.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> {a.readTime}
              </div>
            </div>
            <div className="p-6">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 block">{a.category}</span>
              <h3 className="font-bold text-xl mb-3 text-slate-900 dark:text-white leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{a.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3">{a.content}</p>
              <div className="mt-4 flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
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
    <div className="p-4 md:p-8 max-w-2xl mx-auto text-center mt-10">
      <div className="bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400 shadow-inner border border-emerald-200 dark:border-emerald-800/50">
        <Info className="w-12 h-12" />
      </div>
      <h2 className="text-3xl font-black mb-4 text-slate-900 dark:text-white">Centro de Soporte</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">Para soporte técnico, agregar un parque o reportar problemas con tu cuenta, utiliza nuestros canales oficiales.</p>
      <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-transform">
        Contactar Administración
      </button>
    </div>
  );
}

function ProfileView({ userProfile, myPosts }) {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden mb-8">
        <div className="h-32 md:h-40 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
        <div className="px-6 md:px-8 pb-8 -mt-16 relative">
          <UserAvatar name={userProfile.displayName} sizeClasses="w-24 h-24 md:w-32 md:h-32 text-4xl shadow-2xl mb-4 border-4 border-white dark:border-slate-800" />
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">{userProfile.displayName}</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">{userProfile.bio}</p>
        </div>
      </div>
      <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
        Mi Actividad ({myPosts.length})
      </h3>
      <div className="space-y-4">
        {myPosts.length === 0
          ? <p className="text-slate-500 dark:text-slate-400 italic">Sin actividad registrada aún.</p>
          : myPosts.map(post => <PostCard key={post.id} post={post} parkName="Lugar Registrado" />)
        }
      </div>
    </div>
  );
}

function ArticleDetailView({ article, onBack }) {
  return (
    <div className="bg-white dark:bg-slate-900 min-h-full p-6 md:p-10 max-w-3xl mx-auto border-x border-slate-100 dark:border-slate-700 transition-colors duration-300">
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        <ChevronRight className="w-4 h-4 rotate-180" /> Volver a la Wiki
      </button>
      <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest text-sm mb-4 block">{article.category}</span>
      <h1 className="text-4xl md:text-5xl font-black mb-8 text-slate-900 dark:text-white leading-tight">{article.title}</h1>
      <img
        src={article.imageUrl}
        className="w-full h-64 md:h-96 object-cover rounded-3xl mb-8 shadow-md"
        onError={handleImageError}
        alt={article.title}
      />
      <p className="text-slate-700 dark:text-slate-300 text-lg md:text-xl leading-relaxed">{article.content}</p>
    </div>
  );
}

export default function Main() {
  return <ErrorBoundary><App /></ErrorBoundary>;
}

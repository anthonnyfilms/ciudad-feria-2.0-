import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { LayoutDashboard, Calendar, Settings, LogOut, Tag, ShoppingCart, CreditCard, Shield, Table2, Upload, Move, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '../../components/ui/sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDisenoEntrada = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState('');
  const [fondoImagen, setFondoImagen] = useState(null);
  const [fondoPreview, setFondoPreview] = useState(null);
  const [qrConfig, setQrConfig] = useState({
    x: 50,
    y: 50,
    size: 150,
    rotation: 0
  });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    cargarEventos();
  }, []);

  useEffect(() => {
    if (eventoSeleccionado) {
      cargarConfiguracionEvento();
    }
  }, [eventoSeleccionado]);

  const cargarEventos = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API}/admin/eventos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEventos(response.data);
      if (response.data.length > 0) {
        setEventoSeleccionado(response.data[0].id);
      }
    } catch (error) {
      console.error('Error cargando eventos:', error);
    }
  };

  const cargarConfiguracionEvento = async () => {
    const evento = eventos.find(e => e.id === eventoSeleccionado);
    if (evento) {
      if (evento.template_entrada) {
        setFondoPreview(evento.template_entrada);
      }
      if (evento.posicion_qr) {
        setQrConfig({
          x: evento.posicion_qr.x || 50,
          y: evento.posicion_qr.y || 50,
          size: evento.posicion_qr.size || 150,
          rotation: evento.posicion_qr.rotation || 0
        });
      }
    }
  };

  const handleFondoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview local
    const reader = new FileReader();
    reader.onloadend = () => {
      setFondoPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload al servidor
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/upload-imagen`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFondoImagen(`${BACKEND_URL}${response.data.url}`);
      toast.success('Imagen de fondo cargada');
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      toast.error('Error al subir imagen');
    }
  };

  const handleMouseDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDragging(true);
    setDragStart({
      x: e.clientX - rect.left - qrConfig.x,
      y: e.clientY - rect.top - qrConfig.y
    });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const newX = Math.max(0, Math.min(100, ((e.clientX - rect.left - dragStart.x) / rect.width) * 100));
    const newY = Math.max(0, Math.min(100, ((e.clientY - rect.top - dragStart.y) / rect.height) * 100));
    setQrConfig(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const guardarConfiguracion = async () => {
    if (!eventoSeleccionado) {
      toast.error('Selecciona un evento');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      await axios.put(
        `${API}/admin/eventos/${eventoSeleccionado}`,
        {
          template_entrada: fondoImagen || fondoPreview,
          posicion_qr: qrConfig
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Configuración guardada');
    } catch (error) {
      console.error('Error guardando:', error);
      toast.error('Error al guardar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/secure-admin-panel-2026');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Calendar, label: 'Eventos', path: '/admin/eventos' },
    { icon: Tag, label: 'Categorías', path: '/admin/categorias' },
    { icon: Table2, label: 'Categorías Mesas', path: '/admin/categorias-mesas' },
    { icon: ShoppingCart, label: 'Compras', path: '/admin/compras' },
    { icon: CreditCard, label: 'Métodos de Pago', path: '/admin/metodos-pago' },
    { icon: Shield, label: 'Validar Entradas', path: '/admin/validar' },
    { icon: Upload, label: 'Diseño Entrada', path: '/admin/diseno-entrada', active: true },
    { icon: Settings, label: 'Configuración', path: '/admin/configuracion' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />
      
      <header className="glass-card border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎪</span>
              <div>
                <h1 className="text-xl font-heading font-black text-primary">Panel Admin</h1>
                <p className="text-xs text-foreground/50">Ciudad Feria 2026</p>
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 rounded-full glass-card hover:border-accent/50 transition-all text-foreground/80 hover:text-accent">
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 glass-card border-r border-white/10 min-h-screen p-6">
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  item.active ? 'bg-primary text-primary-foreground' : 'text-foreground/70 hover:bg-white/5 hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <div className="mb-8">
            <h2 className="text-4xl font-heading font-black text-foreground">
              Diseño de Entrada QR
            </h2>
            <p className="text-foreground/60 mt-2">
              Personaliza el diseño de las entradas y la posición del código QR
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Panel de Configuración */}
            <div className="space-y-6">
              {/* Selector de Evento */}
              <div className="glass-card p-6 rounded-2xl">
                <label className="block text-foreground/80 mb-2 font-medium">
                  Evento
                </label>
                <select
                  value={eventoSeleccionado}
                  onChange={(e) => setEventoSeleccionado(e.target.value)}
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none"
                >
                  {eventos.map(evento => (
                    <option key={evento.id} value={evento.id}>{evento.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Upload de Fondo */}
              <div className="glass-card p-6 rounded-2xl">
                <label className="block text-foreground/80 mb-4 font-medium">
                  Imagen de Fondo (Flyer de la Entrada)
                </label>
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-primary/50 transition-all">
                    <Upload className="w-10 h-10 mx-auto mb-3 text-foreground/50" />
                    <p className="text-foreground/70">Haz clic para subir imagen</p>
                    <p className="text-xs text-foreground/50 mt-1">PNG, JPG (Recomendado: 600x900px)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFondoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Controles del QR */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Move className="w-5 h-5 text-primary" />
                  Posición del QR
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-foreground/70">Posición X: {qrConfig.x.toFixed(0)}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={qrConfig.x}
                      onChange={(e) => setQrConfig(prev => ({ ...prev, x: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-foreground/70">Posición Y: {qrConfig.y.toFixed(0)}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={qrConfig.y}
                      onChange={(e) => setQrConfig(prev => ({ ...prev, y: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-foreground/70 flex items-center gap-2">
                      <ZoomIn className="w-4 h-4" /> Tamaño: {qrConfig.size}px
                    </label>
                    <input
                      type="range"
                      min="80"
                      max="300"
                      value={qrConfig.size}
                      onChange={(e) => setQrConfig(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Botón Guardar */}
              <motion.button
                onClick={guardarConfiguracion}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary text-primary-foreground py-4 rounded-full font-bold text-lg disabled:opacity-50"
              >
                {loading ? 'Guardando...' : 'Guardar Configuración'}
              </motion.button>
            </div>

            {/* Vista Previa */}
            <div className="glass-card p-6 rounded-2xl">
              <h3 className="font-bold text-foreground mb-4">Vista Previa de la Entrada</h3>
              
              <div 
                className="relative bg-gray-800 rounded-xl overflow-hidden mx-auto"
                style={{ width: '300px', height: '450px' }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Fondo */}
                {fondoPreview ? (
                  <img 
                    src={fondoPreview} 
                    alt="Fondo entrada" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                    <div className="text-center">
                      <span className="text-6xl">🎪</span>
                      <p className="text-foreground/50 mt-4">Feria San Sebastián 2026</p>
                    </div>
                  </div>
                )}
                
                {/* QR Simulado */}
                <div 
                  className="absolute bg-white p-2 rounded-lg shadow-lg cursor-move"
                  style={{
                    left: `${qrConfig.x}%`,
                    top: `${qrConfig.y}%`,
                    transform: `translate(-50%, -50%) rotate(${qrConfig.rotation}deg)`,
                    width: `${qrConfig.size * 0.5}px`,
                    height: `${qrConfig.size * 0.5}px`
                  }}
                >
                  <div className="w-full h-full bg-gray-900 rounded grid grid-cols-5 grid-rows-5 gap-0.5 p-1">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Info de ejemplo */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-xs">
                  <p className="font-bold">Gran Concierto de la Feria</p>
                  <p className="text-white/70">Silla 5 - Mesa VIP 1</p>
                  <p className="text-white/70">20/01/2026 - 20:00</p>
                </div>
              </div>
              
              <p className="text-center text-xs text-foreground/50 mt-4">
                Arrastra el QR para ajustar su posición
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDisenoEntrada;

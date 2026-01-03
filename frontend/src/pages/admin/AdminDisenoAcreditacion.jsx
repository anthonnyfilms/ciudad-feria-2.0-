import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { LayoutDashboard, Calendar, Settings, LogOut, Tag, ShoppingCart, CreditCard, Shield, Table2, Upload, Move, ZoomIn, ZoomOut, RotateCw, Save, Eye, Users, BarChart3, BadgeCheck, Activity, Type, QrCode, Building, CreditCard as IdCard, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '../../components/ui/sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDisenoAcreditacion = () => {
  const navigate = useNavigate();
  const previewRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [eventoSeleccionado, setEventoSeleccionado] = useState('');
  const [fondoImagen, setFondoImagen] = useState(null);
  const [fondoPreview, setFondoPreview] = useState(null);
  
  // Elementos del diseño con posiciones individuales
  const [elementos, setElementos] = useState({
    nombre: { visible: true, x: 50, y: 20, size: 24, color: '#FFFFFF', rotation: 0 },
    cedula: { visible: true, x: 50, y: 35, size: 16, color: '#FFFFFF', rotation: 0 },
    departamento: { visible: true, x: 50, y: 50, size: 18, color: '#FFFFFF', rotation: 0 },
    categoria: { visible: true, x: 50, y: 65, size: 14, color: '#FFD700', rotation: 0 },
    evento: { visible: true, x: 50, y: 80, size: 12, color: '#CCCCCC', rotation: 0 },
    qr: { visible: true, x: 85, y: 75, size: 80, rotation: 0 }
  });
  
  const [elementoActivo, setElementoActivo] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Datos de ejemplo para preview
  const datosEjemplo = {
    nombre: 'JUAN PÉREZ',
    cedula: 'V-12.345.678',
    departamento: 'PRENSA',
    categoria: 'PRESS',
    evento: 'FESTIVAL DEL HUMOR 2026'
  };

  useEffect(() => {
    cargarEventos();
  }, []);

  useEffect(() => {
    if (eventoSeleccionado && eventos.length > 0) {
      cargarConfiguracionEvento();
    }
  }, [eventoSeleccionado, eventos]);

  const cargarEventos = async () => {
    try {
      const response = await axios.get(`${API}/eventos`);
      setEventos(response.data);
      if (response.data.length > 0 && !eventoSeleccionado) {
        setEventoSeleccionado(response.data[0].id);
      }
    } catch (error) {
      console.error('Error cargando eventos:', error);
    }
  };

  const cargarConfiguracionEvento = async () => {
    const evento = eventos.find(e => e.id === eventoSeleccionado);
    if (evento) {
      if (evento.template_acreditacion) {
        setFondoPreview(evento.template_acreditacion);
        setFondoImagen(evento.template_acreditacion);
      } else {
        setFondoPreview(null);
        setFondoImagen(null);
      }
      if (evento.config_acreditacion) {
        setElementos(prev => ({
          ...prev,
          ...evento.config_acreditacion
        }));
      } else {
        // Reset to default
        setElementos({
          nombre: { visible: true, x: 50, y: 20, size: 24, color: '#FFFFFF', rotation: 0 },
          cedula: { visible: true, x: 50, y: 35, size: 16, color: '#FFFFFF', rotation: 0 },
          departamento: { visible: true, x: 50, y: 50, size: 18, color: '#FFFFFF', rotation: 0 },
          categoria: { visible: true, x: 50, y: 65, size: 14, color: '#FFD700', rotation: 0 },
          evento: { visible: true, x: 50, y: 80, size: 12, color: '#CCCCCC', rotation: 0 },
          qr: { visible: true, x: 85, y: 75, size: 80, rotation: 0 }
        });
      }
    }
  };

  const handleFondoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFondoPreview(reader.result);
    };
    reader.readAsDataURL(file);

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

  // Drag & Drop para elementos
  const handleMouseDown = (e, elementoKey) => {
    if (!previewRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    
    const rect = previewRef.current.getBoundingClientRect();
    const elemento = elementos[elementoKey];
    const currentX = (elemento.x / 100) * rect.width;
    const currentY = (elemento.y / 100) * rect.height;
    
    setDragOffset({
      x: e.clientX - rect.left - currentX,
      y: e.clientY - rect.top - currentY
    });
    setElementoActivo(elementoKey);
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !previewRef.current || !elementoActivo) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    const newX = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const newY = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100;
    
    setElementos(prev => ({
      ...prev,
      [elementoActivo]: {
        ...prev[elementoActivo],
        x: Math.max(5, Math.min(95, newX)),
        y: Math.max(5, Math.min(95, newY))
      }
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch support
  const handleTouchStart = (e, elementoKey) => {
    if (!previewRef.current) return;
    const touch = e.touches[0];
    
    const rect = previewRef.current.getBoundingClientRect();
    const elemento = elementos[elementoKey];
    const currentX = (elemento.x / 100) * rect.width;
    const currentY = (elemento.y / 100) * rect.height;
    
    setDragOffset({
      x: touch.clientX - rect.left - currentX,
      y: touch.clientY - rect.top - currentY
    });
    setElementoActivo(elementoKey);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !previewRef.current || !elementoActivo) return;
    const touch = e.touches[0];
    
    const rect = previewRef.current.getBoundingClientRect();
    const newX = ((touch.clientX - rect.left - dragOffset.x) / rect.width) * 100;
    const newY = ((touch.clientY - rect.top - dragOffset.y) / rect.height) * 100;
    
    setElementos(prev => ({
      ...prev,
      [elementoActivo]: {
        ...prev[elementoActivo],
        x: Math.max(5, Math.min(95, newX)),
        y: Math.max(5, Math.min(95, newY))
      }
    }));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const actualizarElemento = (key, campo, valor) => {
    setElementos(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [campo]: valor
      }
    }));
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
          template_acreditacion: fondoImagen || fondoPreview,
          config_acreditacion: elementos
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('✅ Diseño de acreditación guardado');
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
    { icon: Tag, label: 'Diseño Entrada', path: '/admin/diseno-entrada' },
    { icon: BadgeCheck, label: 'Acreditaciones', path: '/admin/acreditaciones' },
    { icon: BadgeCheck, label: 'Diseño Acreditación', path: '/admin/diseno-acreditacion', active: true },
    { icon: Activity, label: 'Aforo', path: '/admin/aforo' },
    { icon: Users, label: 'Usuarios', path: '/admin/usuarios' },
    { icon: Settings, label: 'Configuración', path: '/admin/configuracion' },
  ];

  const elementosConfig = [
    { key: 'nombre', label: 'Nombre', icon: Type },
    { key: 'cedula', label: 'Cédula', icon: IdCard },
    { key: 'departamento', label: 'Departamento', icon: Building },
    { key: 'categoria', label: 'Categoría', icon: Tag },
    { key: 'evento', label: 'Evento', icon: Calendar },
    { key: 'qr', label: 'Código QR', icon: QrCode },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />
      
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen glass-card border-r border-white/10 p-6 hidden lg:block">
          <div className="mb-8">
            <h2 className="text-2xl font-heading font-bold text-primary">Ciudad Feria</h2>
            <p className="text-foreground/60 text-sm">Panel Admin</p>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  item.active 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-foreground/70 hover:bg-white/5 hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/70 hover:bg-accent/10 hover:text-accent transition-all mt-8 w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-heading font-bold text-foreground">
                  🎫 Diseño de Acreditación
                </h1>
                <p className="text-foreground/60 mt-1">
                  Personaliza el diseño de las acreditaciones para cada evento
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Panel de Controles */}
              <div className="space-y-6">
                {/* Selector de Evento */}
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Evento
                  </h3>
                  <select
                    value={eventoSeleccionado}
                    onChange={(e) => setEventoSeleccionado(e.target.value)}
                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none"
                  >
                    {eventos.map(evento => (
                      <option key={evento.id} value={evento.id}>{evento.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Imagen de Fondo */}
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    Fondo de Acreditación
                  </h3>
                  <label className="block">
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="w-10 h-10 text-foreground/40 mx-auto mb-2" />
                      <p className="text-foreground/60 text-sm">
                        {fondoPreview ? 'Cambiar imagen' : 'Subir imagen de fondo'}
                      </p>
                      <p className="text-foreground/40 text-xs mt-1">PNG, JPG (Recomendado: 400x600px)</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFondoUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>

                {/* Configuración de Elementos */}
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    Elementos
                  </h3>
                  <p className="text-foreground/50 text-xs mb-4">
                    Arrastra los elementos en la vista previa para posicionarlos
                  </p>
                  
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {elementosConfig.map(({ key, label, icon: Icon }) => (
                      <div 
                        key={key} 
                        className={`p-3 rounded-xl border transition-all ${
                          elementoActivo === key 
                            ? 'border-primary bg-primary/10' 
                            : 'border-white/10 bg-background/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-primary" />
                            <span className="text-foreground text-sm font-medium">{label}</span>
                          </div>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={elementos[key].visible}
                              onChange={(e) => actualizarElemento(key, 'visible', e.target.checked)}
                              className="rounded border-white/20"
                            />
                            <span className="text-xs text-foreground/50">Visible</span>
                          </label>
                        </div>
                        
                        {elementos[key].visible && (
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <label className="text-xs text-foreground/50">Tamaño</label>
                              <input
                                type="number"
                                value={elementos[key].size}
                                onChange={(e) => actualizarElemento(key, 'size', parseInt(e.target.value) || 12)}
                                min="8"
                                max={key === 'qr' ? 200 : 48}
                                className="w-full bg-background/50 border border-white/10 rounded-lg px-2 py-1 text-sm text-foreground"
                              />
                            </div>
                            {key !== 'qr' && (
                              <div>
                                <label className="text-xs text-foreground/50">Color</label>
                                <input
                                  type="color"
                                  value={elementos[key].color}
                                  onChange={(e) => actualizarElemento(key, 'color', e.target.value)}
                                  className="w-full h-8 rounded-lg cursor-pointer border border-white/10"
                                />
                              </div>
                            )}
                            <div>
                              <label className="text-xs text-foreground/50">Rotación</label>
                              <input
                                type="number"
                                value={elementos[key].rotation}
                                onChange={(e) => actualizarElemento(key, 'rotation', parseInt(e.target.value) || 0)}
                                min="-180"
                                max="180"
                                className="w-full bg-background/50 border border-white/10 rounded-lg px-2 py-1 text-sm text-foreground"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botón Guardar */}
                <motion.button
                  onClick={guardarConfiguracion}
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Guardando...' : 'Guardar Diseño'}
                </motion.button>
              </div>

              {/* Vista Previa */}
              <div className="lg:col-span-2">
                <div className="glass-card p-6 rounded-2xl">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    Vista Previa
                  </h3>
                  <p className="text-foreground/50 text-xs mb-4">
                    Arrastra los elementos para posicionarlos donde desees
                  </p>
                  
                  {/* Contenedor de Preview - Formato credencial vertical */}
                  <div 
                    ref={previewRef}
                    className="relative mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl"
                    style={{ 
                      width: '350px', 
                      height: '500px',
                      backgroundImage: fondoPreview ? `url(${fondoPreview})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    {/* Fondo por defecto si no hay imagen */}
                    {!fondoPreview && (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                        <div className="absolute inset-0 opacity-20">
                          <div className="absolute top-0 left-0 w-full h-full" style={{
                            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)'
                          }} />
                        </div>
                      </div>
                    )}

                    {/* Elementos arrastrables */}
                    {elementos.nombre.visible && (
                      <div
                        className={`absolute cursor-move select-none font-bold text-center ${isDragging && elementoActivo === 'nombre' ? 'ring-2 ring-primary' : ''}`}
                        style={{
                          left: `${elementos.nombre.x}%`,
                          top: `${elementos.nombre.y}%`,
                          transform: `translate(-50%, -50%) rotate(${elementos.nombre.rotation}deg)`,
                          fontSize: `${elementos.nombre.size}px`,
                          color: elementos.nombre.color,
                          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                        }}
                        onMouseDown={(e) => handleMouseDown(e, 'nombre')}
                        onTouchStart={(e) => handleTouchStart(e, 'nombre')}
                      >
                        {datosEjemplo.nombre}
                      </div>
                    )}

                    {elementos.cedula.visible && (
                      <div
                        className={`absolute cursor-move select-none font-medium text-center ${isDragging && elementoActivo === 'cedula' ? 'ring-2 ring-primary' : ''}`}
                        style={{
                          left: `${elementos.cedula.x}%`,
                          top: `${elementos.cedula.y}%`,
                          transform: `translate(-50%, -50%) rotate(${elementos.cedula.rotation}deg)`,
                          fontSize: `${elementos.cedula.size}px`,
                          color: elementos.cedula.color,
                          textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                        }}
                        onMouseDown={(e) => handleMouseDown(e, 'cedula')}
                        onTouchStart={(e) => handleTouchStart(e, 'cedula')}
                      >
                        {datosEjemplo.cedula}
                      </div>
                    )}

                    {elementos.departamento.visible && (
                      <div
                        className={`absolute cursor-move select-none font-semibold text-center uppercase tracking-wider ${isDragging && elementoActivo === 'departamento' ? 'ring-2 ring-primary' : ''}`}
                        style={{
                          left: `${elementos.departamento.x}%`,
                          top: `${elementos.departamento.y}%`,
                          transform: `translate(-50%, -50%) rotate(${elementos.departamento.rotation}deg)`,
                          fontSize: `${elementos.departamento.size}px`,
                          color: elementos.departamento.color,
                          textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                        }}
                        onMouseDown={(e) => handleMouseDown(e, 'departamento')}
                        onTouchStart={(e) => handleTouchStart(e, 'departamento')}
                      >
                        {datosEjemplo.departamento}
                      </div>
                    )}

                    {elementos.categoria.visible && (
                      <div
                        className={`absolute cursor-move select-none font-bold text-center px-4 py-1 rounded-full ${isDragging && elementoActivo === 'categoria' ? 'ring-2 ring-primary' : ''}`}
                        style={{
                          left: `${elementos.categoria.x}%`,
                          top: `${elementos.categoria.y}%`,
                          transform: `translate(-50%, -50%) rotate(${elementos.categoria.rotation}deg)`,
                          fontSize: `${elementos.categoria.size}px`,
                          color: elementos.categoria.color,
                          backgroundColor: 'rgba(0,0,0,0.4)',
                          border: `2px solid ${elementos.categoria.color}`
                        }}
                        onMouseDown={(e) => handleMouseDown(e, 'categoria')}
                        onTouchStart={(e) => handleTouchStart(e, 'categoria')}
                      >
                        {datosEjemplo.categoria}
                      </div>
                    )}

                    {elementos.evento.visible && (
                      <div
                        className={`absolute cursor-move select-none text-center ${isDragging && elementoActivo === 'evento' ? 'ring-2 ring-primary' : ''}`}
                        style={{
                          left: `${elementos.evento.x}%`,
                          top: `${elementos.evento.y}%`,
                          transform: `translate(-50%, -50%) rotate(${elementos.evento.rotation}deg)`,
                          fontSize: `${elementos.evento.size}px`,
                          color: elementos.evento.color,
                          opacity: 0.8
                        }}
                        onMouseDown={(e) => handleMouseDown(e, 'evento')}
                        onTouchStart={(e) => handleTouchStart(e, 'evento')}
                      >
                        {datosEjemplo.evento}
                      </div>
                    )}

                    {elementos.qr.visible && (
                      <div
                        className={`absolute cursor-move select-none bg-white p-2 rounded-lg ${isDragging && elementoActivo === 'qr' ? 'ring-2 ring-primary' : ''}`}
                        style={{
                          left: `${elementos.qr.x}%`,
                          top: `${elementos.qr.y}%`,
                          transform: `translate(-50%, -50%) rotate(${elementos.qr.rotation}deg)`,
                          width: `${elementos.qr.size}px`,
                          height: `${elementos.qr.size}px`
                        }}
                        onMouseDown={(e) => handleMouseDown(e, 'qr')}
                        onTouchStart={(e) => handleTouchStart(e, 'qr')}
                      >
                        <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                          <QrCode className="w-2/3 h-2/3 text-gray-800" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Instrucciones */}
                  <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20">
                    <h4 className="font-bold text-foreground mb-2">💡 Instrucciones</h4>
                    <ul className="text-sm text-foreground/70 space-y-1">
                      <li>• Arrastra cada elemento para posicionarlo</li>
                      <li>• Usa los controles del panel izquierdo para ajustar tamaño y color</li>
                      <li>• Puedes rotar los elementos para dar un efecto inclinado</li>
                      <li>• No olvides guardar tu diseño cuando termines</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDisenoAcreditacion;

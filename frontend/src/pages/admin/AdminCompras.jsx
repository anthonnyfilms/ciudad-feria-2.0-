import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { LayoutDashboard, Calendar, Settings, LogOut, Tag, ShoppingCart, CheckCircle, XCircle, Filter, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '../../components/ui/sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminCompras = () => {
  const navigate = useNavigate();
  const [compras, setCompras] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventoFiltro, setEventoFiltro] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [eventoFiltro, estadoFiltro]);

  const cargarDatos = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const [comprasRes, eventosRes] = await Promise.all([
        axios.get(`${API}/admin/compras`, {
          params: {
            evento_id: eventoFiltro || undefined,
            estado: estadoFiltro || undefined
          },
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/eventos`)
      ]);
      setCompras(comprasRes.data);
      setEventos(eventosRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar compras');
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (entradaIds) => {
    const token = localStorage.getItem('admin_token');
    try {
      await axios.post(
        `${API}/admin/aprobar-compra`,
        { entrada_ids: Array.isArray(entradaIds) ? entradaIds : [entradaIds] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Compra(s) aprobada(s) exitosamente');
      cargarDatos();
    } catch (error) {
      console.error('Error aprobando compra:', error);
      toast.error('Error al aprobar compra');
    }
  };

  const handleRechazar = async (entradaIds) => {
    if (!window.confirm('¿Estás seguro de rechazar esta compra? Se eliminará permanentemente.')) return;

    const token = localStorage.getItem('admin_token');
    try {
      await axios.post(
        `${API}/admin/rechazar-compra`,
        { entrada_ids: Array.isArray(entradaIds) ? entradaIds : [entradaIds] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Compra(s) rechazada(s)');
      cargarDatos();
    } catch (error) {
      console.error('Error rechazando compra:', error);
      toast.error('Error al rechazar compra');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    toast.success('Sesión cerrada');
    navigate('/secure-admin-panel-2026');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Calendar, label: 'Eventos', path: '/admin/eventos' },
    { icon: Tag, label: 'Categorías', path: '/admin/categorias' },
    { icon: ShoppingCart, label: 'Compras', path: '/admin/compras', active: true },
    { icon: Users, label: 'Métodos de Pago', path: '/admin/metodos-pago' },
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
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 rounded-full glass-card hover:border-accent/50 transition-all text-foreground/80 hover:text-accent"
            >
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
        </aside>

        <main className="flex-1 p-8">
          <div className="mb-8">
            <h2 className="text-4xl font-heading font-black text-foreground mb-6">
              Gestión de Compras
            </h2>

            <div className="flex gap-4 mb-6">
              <select
                value={eventoFiltro}
                onChange={(e) => setEventoFiltro(e.target.value)}
                className="bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none"
              >
                <option value="">Todos los eventos</option>
                {eventos.map((evento) => (
                  <option key={evento.id} value={evento.id}>{evento.nombre}</option>
                ))}
              </select>

              <select
                value={estadoFiltro}
                onChange={(e) => setEstadoFiltro(e.target.value)}
                className="bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="aprobado">Aprobados</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {compras.map((compra) => (
                <motion.div
                  key={compra.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6 rounded-2xl"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-2">
                      <h3 className="text-xl font-heading font-bold text-foreground mb-2">
                        {compra.nombre_comprador}
                      </h3>
                      <p className="text-foreground/70 text-sm mb-1">{compra.email_comprador}</p>
                      {compra.telefono_comprador && (
                        <p className="text-foreground/70 text-sm mb-2">📱 {compra.telefono_comprador}</p>
                      )}
                      <p className="text-foreground/80 font-medium mt-3">{compra.nombre_evento}</p>
                      {compra.asiento && (
                        <p className="text-foreground/60 text-sm">Asiento: {compra.asiento}</p>
                      )}
                    </div>

                    <div>
                      <p className="text-foreground/50 text-sm mb-1">Método de Pago</p>
                      <p className="text-foreground font-medium mb-3">{compra.metodo_pago}</p>
                      {compra.comprobante_pago && (
                        <a
                          href={compra.comprobante_pago}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm"
                        >
                          Ver comprobante
                        </a>
                      )}
                      <div className="mt-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            compra.estado_pago === 'aprobado'
                              ? 'bg-primary/20 text-primary'
                              : 'bg-accent/20 text-accent'
                          }`}
                        >
                          {compra.estado_pago === 'aprobado' ? 'Aprobado' : 'Pendiente'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {compra.estado_pago === 'pendiente' && (
                        <>
                          <button
                            onClick={() => handleAprobar(compra.id)}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-all font-medium"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleRechazar(compra.id)}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-all font-medium"
                          >
                            <XCircle className="w-4 h-4" />
                            Rechazar
                          </button>
                        </>
                      )}
                      {compra.estado_pago === 'aprobado' && (
                        <div className="text-center text-primary font-medium">
                          ✓ Compra aprobada
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {compras.length === 0 && (
                <div className="glass-card p-12 rounded-3xl text-center">
                  <ShoppingCart className="w-16 h-16 text-foreground/30 mx-auto mb-4" />
                  <p className="text-foreground/50 text-lg">
                    No hay compras{eventoFiltro || estadoFiltro ? ' con estos filtros' : ''}
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminCompras;

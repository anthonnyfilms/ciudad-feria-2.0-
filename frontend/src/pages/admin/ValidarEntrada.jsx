import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import { LayoutDashboard, Calendar, Settings, LogOut, Tag, ShoppingCart, CreditCard, CheckCircle, XCircle, Scan, Shield, Table2, Camera, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '../../components/ui/sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ValidarEntrada = () => {
  const navigate = useNavigate();
  const [escaneando, setEscaneando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [modoEscaneo, setModoEscaneo] = useState('entrada');
  const [cameraError, setCameraError] = useState(null);
  const html5QrCodeRef = useRef(null);
  const videoContainerRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    toast.success('Sesión cerrada');
    navigate('/secure-admin-panel-2026');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Calendar, label: 'Eventos', path: '/admin/eventos' },
    { icon: Tag, label: 'Categorías', path: '/admin/categorias' },
    { icon: Table2, label: 'Categorías Mesas', path: '/admin/categorias-mesas' },
    { icon: ShoppingCart, label: 'Compras', path: '/admin/compras' },
    { icon: CreditCard, label: 'Métodos de Pago', path: '/admin/metodos-pago' },
    { icon: Shield, label: 'Validar Entradas', path: '/admin/validar', active: true },
    { icon: Tag, label: 'Diseño Entrada', path: '/admin/diseno-entrada' },
    { icon: Settings, label: 'Configuración', path: '/admin/configuracion' },
  ];

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState();
        if (state === 2) { // SCANNING state
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current = null;
      } catch (err) {
        console.log('Error stopping scanner:', err);
      }
    }
  };

  const iniciarEscaneo = async () => {
    setEscaneando(true);
    setResultado(null);
    setCameraError(null);

    // Small delay to ensure DOM is ready
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      // Create new instance
      html5QrCodeRef.current = new Html5Qrcode("qr-reader-container");
      
      const qrCodeSuccessCallback = async (decodedText) => {
        // Stop scanning immediately after detecting
        await stopScanner();
        setEscaneando(false);
        await validarQR(decodedText);
      };

      const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      // Try back camera first, then any camera
      try {
        await html5QrCodeRef.current.start(
          { facingMode: "environment" },
          config,
          qrCodeSuccessCallback,
          (errorMessage) => {
            // Ignore "No QR code found" messages
          }
        );
      } catch (err) {
        console.log('Back camera failed, trying front camera:', err);
        // Try front camera
        try {
          await html5QrCodeRef.current.start(
            { facingMode: "user" },
            config,
            qrCodeSuccessCallback,
            (errorMessage) => {}
          );
        } catch (err2) {
          // Try any available camera
          const cameras = await Html5Qrcode.getCameras();
          if (cameras && cameras.length > 0) {
            await html5QrCodeRef.current.start(
              cameras[0].id,
              config,
              qrCodeSuccessCallback,
              (errorMessage) => {}
            );
          } else {
            throw new Error('No se encontraron cámaras disponibles');
          }
        }
      }
    } catch (err) {
      console.error('Error starting scanner:', err);
      setCameraError(err.message || 'Error al iniciar la cámara');
      toast.error('Error al iniciar la cámara: ' + (err.message || 'Verifica los permisos'));
      setEscaneando(false);
    }
  };

  const validarQR = async (qrPayload) => {
    try {
      const response = await axios.post(`${API}/validar-entrada`, {
        qr_payload: qrPayload,
        accion: modoEscaneo
      });

      setResultado(response.data);

      if (response.data.valido) {
        toast.success(response.data.mensaje);
        playSound(true);
      } else {
        toast.error(response.data.mensaje);
        if (response.data.tipo_alerta) {
          playSound(false);
        }
      }
    } catch (error) {
      console.error('Error validando entrada:', error);
      const mensajeError = error.response?.data?.detail || 'Error al validar la entrada';
      setResultado({
        valido: false,
        mensaje: mensajeError,
        entrada: null
      });
      toast.error(mensajeError);
      playSound(false);
    }
  };

  const playSound = (success) => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (success) {
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.3;
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } else {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.value = 300;
            osc.type = 'square';
            gain.gain.value = 0.5;
            osc.start(audioContext.currentTime);
            osc.stop(audioContext.currentTime + 0.3);
          }, i * 400);
        }
      }
    }
  };

  const reiniciarEscaneo = async () => {
    await stopScanner();
    setResultado(null);
    setEscaneando(false);
    setCameraError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />
      
      {/* Header */}
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
        {/* Sidebar */}
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

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-5xl font-heading font-black text-primary glow-text mb-4">
                Validar Entradas
              </h1>
              <p className="text-lg text-foreground/70">
                Escanea el código QR para validar entradas
              </p>
            </motion.div>

        {!escaneando && !resultado && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-12 rounded-3xl text-center"
          >
            <Scan className="w-24 h-24 text-primary mx-auto mb-6" />
            <h2 className="text-2xl font-heading font-bold text-foreground mb-4">
              Escanear Código QR
            </h2>
            <p className="text-foreground/70 mb-8">
              Haz clic en el botón para iniciar el escaneo
            </p>
            <motion.button
              onClick={iniciarEscaneo}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-primary-foreground px-12 py-5 rounded-full font-bold text-lg btn-glow"
              data-testid="button-iniciar-escaneo"
            >
              Iniciar Escaneo
            </motion.button>
          </motion.div>
        )}

        {escaneando && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-6 rounded-3xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-primary animate-pulse" />
              <span className="text-foreground font-medium">Cámara activa - Apunta al código QR</span>
            </div>
            
            {/* Video container with explicit dimensions */}
            <div 
              id="qr-reader-container" 
              ref={videoContainerRef}
              className="rounded-xl overflow-hidden mb-6 bg-black"
              style={{ 
                width: '100%', 
                minHeight: '350px',
                maxWidth: '500px',
                margin: '0 auto'
              }}
            ></div>

            {cameraError && (
              <div className="bg-accent/20 border border-accent/50 rounded-xl p-4 mb-4 text-center">
                <p className="text-accent font-medium">{cameraError}</p>
                <p className="text-foreground/60 text-sm mt-2">
                  Verifica que has dado permisos de cámara al navegador
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={reiniciarEscaneo}
                className="flex-1 glass-card px-6 py-4 rounded-full font-bold text-foreground hover:border-accent/50 transition-all flex items-center justify-center gap-2"
                data-testid="button-cancelar-escaneo"
              >
                <XCircle className="w-5 h-5" />
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await reiniciarEscaneo();
                  setTimeout(() => iniciarEscaneo(), 500);
                }}
                className="flex-1 glass-card px-6 py-4 rounded-full font-bold text-foreground hover:border-primary/50 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Reiniciar
              </button>
            </div>
          </motion.div>
        )}

        {resultado && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`glass-card p-12 rounded-3xl text-center ${
              resultado.valido ? 'border-2 border-primary' : 'border-2 border-accent'
            }`}
            data-testid="resultado-validacion"
          >
            {resultado.valido ? (
              <CheckCircle className="w-24 h-24 text-primary mx-auto mb-6" />
            ) : (
              <XCircle className="w-24 h-24 text-accent mx-auto mb-6" />
            )}

            <h2 className={`text-3xl font-heading font-bold mb-4 ${
              resultado.valido ? 'text-primary' : 'text-accent'
            }`}>
              {resultado.valido ? 'Entrada Válida' : 'Entrada Inválida'}
            </h2>

            <p className="text-lg text-foreground/80 mb-8">
              {resultado.mensaje}
            </p>

            {resultado.entrada && (
              <div className="glass-card p-6 rounded-2xl mb-8 text-left">
                <h3 className="text-xl font-bold text-foreground mb-4">Detalles de la Entrada</h3>
                <div className="space-y-2 text-foreground/70">
                  <p><strong>Evento:</strong> {resultado.entrada.nombre_evento}</p>
                  <p><strong>Nombre:</strong> {resultado.entrada.nombre_comprador}</p>
                  <p><strong>Email:</strong> {resultado.entrada.email_comprador}</p>
                </div>
              </div>
            )}

            <motion.button
              onClick={reiniciarEscaneo}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-primary-foreground px-12 py-5 rounded-full font-bold text-lg btn-glow"
              data-testid="button-escanear-otra"
            >
              Escanear Otra Entrada
            </motion.button>
          </motion.div>
        )}
      </div>
    </main>
    </div>
  </div>
  );
};

export default ValidarEntrada;
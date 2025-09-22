import { useEffect, useRef, useState } from "react";
import "./App.css"; // 👈 Importa los estilos

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [fotos, setFotos] = useState(() => {
    const guardadas = localStorage.getItem("fotos");
    return guardadas ? JSON.parse(guardadas) : [];
  });

  const [streamActivo, setStreamActivo] = useState(false);
  const [usarFrontal, setUsarFrontal] = useState(false);

  const iniciarCamara = async (frontal = false) => {
    try {
      const constraints = { video: { facingMode: frontal ? "user" : "environment" } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActivo(true);
      }
    } catch (err) {
      alert("No se pudo acceder a la cámara. Revisa permisos.");
    }
  };

  const detenerCamara = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach(track => track.stop());
    setStreamActivo(false);
  };

  const tomarFoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvasRef.current.toDataURL("image/png");
    setFotos(prev => {
      const nuevas = [...prev, dataUrl];
      localStorage.setItem("fotos", JSON.stringify(nuevas));
      return nuevas;
    });
  };

  const cambiarCamara = () => {
    const nuevoModo = !usarFrontal;
    setUsarFrontal(nuevoModo);
    detenerCamara();
    iniciarCamara(nuevoModo);
  };

  const eliminarFoto = index => {
    const nuevas = fotos.filter((_, i) => i !== index);
    setFotos(nuevas);
    localStorage.setItem("fotos", JSON.stringify(nuevas));
  };

  useEffect(() => () => detenerCamara(), []);

  return (
    <div className="container">
      <h1>📷 Mini Galería</h1>

      <div className="camara">
        <video ref={videoRef} autoPlay playsInline />
      </div>

      <div className="botones">
        {!streamActivo ? (
          <button className="iniciar" onClick={() => iniciarCamara(usarFrontal)}>
            Iniciar Cámara
          </button>
        ) : (
          <>
            <button className="tomar" onClick={tomarFoto}>Tomar Foto</button>
            <button className="detener" onClick={detenerCamara}>Detener</button>
            <button className="switch" onClick={cambiarCamara}>
              Cambiar a {usarFrontal ? "Trasera" : "Frontal"}
            </button>
          </>
        )}
      </div>

      <h2>Mis Fotos</h2>
      <div className="galeria">
        {fotos.length === 0 && <p>No hay fotos guardadas.</p>}
        {fotos.map((foto, i) => (
          <div key={i} className="img-container">
            <img src={foto} alt={`foto-${i}`} />
            <button className="eliminar" onClick={() => eliminarFoto(i)}>✕</button>
          </div>
        ))}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

import { useEffect, useRef, useState } from "react";

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [fotos, setFotos] = useState(() => {
    // Cargar fotos almacenadas al iniciar
    const guardadas = localStorage.getItem("fotos");
    return guardadas ? JSON.parse(guardadas) : [];
  });

  const [streamActivo, setStreamActivo] = useState(false);
  const [usarFrontal, setUsarFrontal] = useState(false); // false = trasera

  // 🔹 Inicia la cámara con el modo actual (frontal/trasera)
  const iniciarCamara = async (frontal = false) => {
    try {
      // "user" = frontal | "environment" = trasera
      const constraints = {
        video: { facingMode: frontal ? "user" : "environment" }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActivo(true);
      }
    } catch (err) {
      console.error("Error al acceder a la cámara:", err);
      alert("No se pudo acceder a la cámara. Revisa permisos.");
    }
  };

  // 🔹 Detiene la cámara
  const detenerCamara = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach(track => track.stop());
    setStreamActivo(false);
  };

  // 🔹 Toma la foto y la guarda en localStorage
  const tomarFoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvasRef.current.toDataURL("image/png");

    setFotos(prev => {
      const nuevas = [...prev, dataUrl];
      localStorage.setItem("fotos", JSON.stringify(nuevas)); // Guardar
      return nuevas;
    });
  };

  // 🔄 Cambia entre cámara frontal/trasera
  const cambiarCamara = () => {
    const nuevoModo = !usarFrontal;
    setUsarFrontal(nuevoModo);
    detenerCamara();
    iniciarCamara(nuevoModo);
  };

  // 🗑️ Eliminar una foto
  const eliminarFoto = index => {
    const nuevas = fotos.filter((_, i) => i !== index);
    setFotos(nuevas);
    localStorage.setItem("fotos", JSON.stringify(nuevas));
  };

  // Limpiar cámara al desmontar
  useEffect(() => {
    return () => detenerCamara();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.titulo}>📷 Mini Galería</h1>

      {/* Vista previa */}
      <div style={styles.camara}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ width: "100%", borderRadius: "10px" }}
        />
      </div>

      <div style={styles.botones}>
        {!streamActivo ? (
          <button onClick={() => iniciarCamara(usarFrontal)}>
            Iniciar Cámara
          </button>
        ) : (
          <>
            <button onClick={tomarFoto}>Tomar Foto</button>
            <button onClick={detenerCamara}>Detener</button>
            <button onClick={cambiarCamara}>
              Cambiar a {usarFrontal ? "Trasera" : "Frontal"}
            </button>
          </>
        )}
      </div>

      <h2 style={{ marginTop: "20px" }}>Mis Fotos</h2>
      <div style={styles.galeria}>
        {fotos.length === 0 && <p>No hay fotos guardadas.</p>}
        {fotos.map((foto, i) => (
          <div key={i} style={styles.imgContainer}>
            <img src={foto} alt={`foto-${i}`} style={styles.imagen} />
            <button onClick={() => eliminarFoto(i)} style={styles.eliminar}>
              ✕
            </button>
          </div>
        ))}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

// 🎨 Estilos básicos
const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
    textAlign: "center",
    fontFamily: "sans-serif"
  },
  titulo: { fontSize: "1.8rem", marginBottom: "10px" },
  camara: {
    width: "100%",
    maxWidth: "400px",
    margin: "0 auto",
    backgroundColor: "#000",
    borderRadius: "10px",
    overflow: "hidden"
  },
  botones: {
    marginTop: "10px",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "10px"
  },
  galeria: {
    marginTop: "20px",
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    justifyContent: "center"
  },
  imgContainer: {
    position: "relative"
  },
  imagen: {
    width: "100px",
    height: "100px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid #ccc"
  },
  eliminar: {
    position: "absolute",
    top: "-8px",
    right: "-8px",
    background: "red",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    cursor: "pointer",
    width: "20px",
    height: "20px",
    fontSize: "0.8rem",
    lineHeight: "20px"
  }
};

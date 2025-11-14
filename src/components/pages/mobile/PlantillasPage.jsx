import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Button, Box, TextField, Typography, CircularProgress, FormControl, InputLabel, Select, MenuItem, Paper } from "@mui/material";
import { Editor } from "@tinymce/tinymce-react";
import { useAuth } from "../../context/GlobalAuth";

export default function PlantillasPage() {
  const { usuarioFetch } = useAuth();
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [contenidoHtml, setContenidoHtml] = useState("");
  const [grupo, setGrupo] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const editorRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!usuarioFetch?.id) return;
    setLoading(false);
  }, [usuarioFetch]);

  const crearPlantilla = async () => {
    try {
      await axios.post(`${API_URL}/plantillas/crear`, {
        nombre,
        descripcion,
        contenidoHtml,
        usuarioId: usuarioFetch.id
      }, { withCredentials: true });
      setNombre("");
      setDescripcion("");
      setContenidoHtml("");
    } catch (err) {
      console.error("Error al crear plantilla", err);
    }
  };

  const grupos = {
    inquilino: [
      { label: "Nombre completo", value: "{inquilino_nombre}" },
      { label: "DNI", value: "{inquilino_dni}" },
    ],
    propietario: [
      { label: "Nombre completo", value: "{propietario_nombre}" },
    ],
    propiedad: [
      { label: "Dirección", value: "{propiedad_direccion}" },
      { label: "Localidad", value: "{propiedad_localidad}" },
      { label: "Partido", value: "{propiedad_partido}" },
    ],
    contrato: [
      { label: "Monto", value: "{contrato_monto}" },
      { label: "Monto en letras", value: "{contrato_monto_letras}" },
      { label: "Fecha inicio", value: "{contrato_fecha_inicio}" },
      { label: "Fecha fin", value: "{contrato_fecha_fin}" },
      { label: "Duración (meses)", value: "{contrato_duracion}" },
      { label: "Destino", value: "{contrato_destino}" },
    ],
    inmobiliaria: [
      { label: "Nombre negocio", value: "{usuario_nombre_negocio}" },
      { label: "Localidad", value: "{usuario_localidad}" },
      { label: "Partido", value: "{usuario_partido}" },
      { label: "Razón Social", value: "{usuario_razon_social}" },
    ],
    servicios: [
      { label: "Agua - empresa", value: "{agua_empresa}" },
      { label: "Luz - empresa", value: "{luz_empresa}" },
      { label: "Gas - empresa", value: "{gas_empresa}" },
      { label: "Municipal - empresa", value: "{municipal_empresa}" },
    ],
  };

  const handleInsert = () => {
    if (!placeholder) return;
    const editor = editorRef.current;
    if (editor) {
      editor.insertContent(placeholder);
    }
  };

  if (loading) return <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>Nueva plantilla</Typography>

      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
          <TextField label="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} fullWidth />
          <TextField label="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} fullWidth />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Grupo</InputLabel>
            <Select value={grupo} label="Grupo" onChange={(e) => { setGrupo(e.target.value); setPlaceholder(""); }}>
              <MenuItem value={"inquilino"}>Inquilino</MenuItem>
              <MenuItem value={"propietario"}>Propietario</MenuItem>
              <MenuItem value={"propiedad"}>Propiedad</MenuItem>
              <MenuItem value={"contrato"}>Contrato</MenuItem>
              <MenuItem value={"inmobiliaria"}>Inmobiliaria</MenuItem>
              <MenuItem value={"servicios"}>Servicios</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 220 }} disabled={!grupo}>
            <InputLabel>Placeholder</InputLabel>
            <Select value={placeholder} label="Placeholder" onChange={(e) => setPlaceholder(e.target.value)}>
              {(grupos[grupo] || []).map((p) => (
                <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="outlined" onClick={handleInsert} disabled={!placeholder}>Insertar</Button>
        </Box>

        <Editor
          onInit={(_evt, editor) => (editorRef.current = editor)}
          value={contenidoHtml}
          onEditorChange={(v) => setContenidoHtml(v)}
          init={{
            height: 420,
            menubar: false,
            plugins: [
              'advlist autolink lists link charmap preview anchor',
              'searchreplace visualblocks code fullscreen',
              'insertdatetime table paste help wordcount'
            ],
            toolbar:
              'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
            content_style: 'body { font-family:Inter,Arial,sans-serif; font-size:14px }',
          }}
        />

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button variant="contained" onClick={crearPlantilla}>Guardar plantilla</Button>
        </Box>
      </Paper>
    </Box>
  );
}

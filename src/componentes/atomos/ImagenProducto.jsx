function clasePara(miniatura, ficha) {
  if (miniatura) {
    return 'zone-imagen-miniatura'
  }

  return ficha ? 'zone-imagen-ficha w-100' : 'zone-imagen-producto w-100'
}

function ImagenProducto({ origen, descripcion, miniatura = false, ficha = false }) {
  return (
    <img
      src={origen}
      alt={descripcion}
      className={clasePara(miniatura, ficha)}
      loading="lazy"
    />
  )
}

export default ImagenProducto

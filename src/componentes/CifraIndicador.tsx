interface Props {
  /** Valor ya formateado, tal como lo devuelve el ayudante correspondiente. */
  valor: string
  className?: string
}

/**
 * Cifra de titular del panel.
 *
 * Separa el símbolo de moneda del número para darle tamaño y peso menores: a
 * 30 px, un `$` a la misma altura que las cifras compite con ellas y el número
 * deja de leerse como una sola pieza.
 */
export function CifraIndicador({ valor, className = '' }: Props) {
  const coincidencia = /^([^\d-]+)(.*)$/.exec(valor)

  if (coincidencia === null) {
    return <p className={`t-titular ${className}`}>{valor}</p>
  }

  const [, simbolo, resto] = coincidencia

  return (
    <p className={`t-titular ${className}`}>
      <span className="simbolo">{simbolo}</span>
      {resto}
    </p>
  )
}

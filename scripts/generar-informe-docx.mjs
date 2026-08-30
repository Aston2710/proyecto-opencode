/**
 * Convierte docs/informe-word.txt a Markdown y lo pasa por pandoc.
 *
 * El formato final (Arial 12 en negro) lo impone el parcheo posterior de la
 * hoja de estilos, que hace scripts/aplicar-formato-docx.ps1. Se hace así, y no
 * automatizando Word, porque Word por COM necesita una llamada entre procesos
 * por cada propiedad de cada párrafo y tarda varios minutos.
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const fuente = join(raiz, 'docs', 'informe-word.txt')
const destino = join(raiz, 'INFORME.docx')
const trabajo = mkdtempSync(join(tmpdir(), 'informe-'))

const lineas = readFileSync(fuente, 'utf8').split(/\r?\n/).filter((l) => l.trim() !== '')
const salida = []
let enCodigo = false

for (const linea of lineas) {
  const marca = linea[0]
  const texto = linea.slice(2)

  if (marca !== 'C' && enCodigo) {
    salida.push('```', '')
    enCodigo = false
  }

  switch (marca) {
    case 'T':
      salida.push(`# ${texto}`, '')
      break
    case 'S':
    case 'F':
      salida.push(texto, '')
      break
    case 'H':
      salida.push(`## ${texto}`, '')
      break
    case 'h':
      salida.push(`### ${texto}`, '')
      break
    case 'Q':
      salida.push(`> ${texto}`, '')
      break
    case 'C':
      if (!enCodigo) {
        salida.push('```')
        enCodigo = true
      }
      salida.push(texto)
      break
    default:
      salida.push(texto, '')
  }
}
if (enCodigo) salida.push('```', '')

const rutaMarkdown = join(trabajo, 'informe.md')
writeFileSync(rutaMarkdown, salida.join('\n'), 'utf8')

execFileSync('pandoc', [rutaMarkdown, '-o', destino], { maxBuffer: 1 << 28 })

rmSync(trabajo, { recursive: true, force: true })
console.log(`markdown convertido: ${destino}`)

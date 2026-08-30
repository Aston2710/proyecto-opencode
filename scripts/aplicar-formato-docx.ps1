# Impone el formato de entrega sobre INFORME.docx.
#
# Un .docx es un contenedor ZIP con documentos XML dentro, asi que el formato se
# fija reescribiendo la hoja de estilos en lugar de automatizar Word. Es
# instantaneo y no depende de que Word este instalado.
#
# Lo que se impone: Arial 12 en todo el documento, texto en negro y sin
# subrayados, y propiedades de archivo limpias.

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

$raiz = Split-Path $PSScriptRoot -Parent
$documento = Join-Path $raiz 'INFORME.docx'
if (-not (Test-Path $documento)) { throw "No existe $documento" }

$utf8 = New-Object System.Text.UTF8Encoding($false)
$zip = [System.IO.Compression.ZipFile]::Open($documento, 'Update')

function Set-Entrada {
    param([string]$Ruta, [scriptblock]$Transformar)

    $entrada = $zip.Entries | Where-Object { $_.FullName -eq $Ruta }
    if ($null -eq $entrada) { return $false }

    $lector = New-Object System.IO.StreamReader($entrada.Open(), $utf8)
    $xml = $lector.ReadToEnd()
    $lector.Close()

    $nuevo = & $Transformar $xml
    if ($nuevo -eq $xml) { return $false }

    $flujo = $entrada.Open()
    $flujo.SetLength(0)
    $escritor = New-Object System.IO.StreamWriter($flujo, $utf8)
    $escritor.Write($nuevo)
    $escritor.Flush()
    $escritor.Close()
    return $true
}

$tocados = @()

if (Set-Entrada 'word/styles.xml' {
        param($xml)
        $xml `
            -replace 'w:ascii="[^"]*"', 'w:ascii="Arial"' `
            -replace 'w:hAnsi="[^"]*"', 'w:hAnsi="Arial"' `
            -replace 'w:cs="[^"]*"', 'w:cs="Arial"' `
            -replace 'w:asciiTheme="[^"]*"', 'w:ascii="Arial"' `
            -replace 'w:hAnsiTheme="[^"]*"', 'w:hAnsi="Arial"' `
            -replace 'w:cstheme="[^"]*"', 'w:cs="Arial"' `
            -replace '<w:color w:val="[^"]*"[^>]*/>', '<w:color w:val="000000"/>' `
            -replace '<w:u w:val="single"[^>]*/>', '' `
            -replace '<w:sz w:val="\d+"[^>]*/>', '<w:sz w:val="24"/>' `
            -replace '<w:szCs w:val="\d+"[^>]*/>', '<w:szCs w:val="24"/>'
    }) { $tocados += 'styles.xml' }

if (Set-Entrada 'word/theme/theme1.xml' {
        param($xml)
        $xml -replace '<a:latin typeface="[^"]*"', '<a:latin typeface="Arial"'
    }) { $tocados += 'theme1.xml' }

if (Set-Entrada 'word/document.xml' {
        param($xml)
        $xml `
            -replace '<w:color w:val="[^"]*"[^>]*/>', '<w:color w:val="000000"/>' `
            -replace 'w:ascii="[^"]*"', 'w:ascii="Arial"' `
            -replace 'w:hAnsi="[^"]*"', 'w:hAnsi="Arial"'
    }) { $tocados += 'document.xml' }

if (Set-Entrada 'docProps/core.xml' {
        param($xml)
        $xml `
            -replace '<dc:creator>[^<]*</dc:creator>', '<dc:creator>Jesus Redondo</dc:creator>' `
            -replace '<cp:lastModifiedBy>[^<]*</cp:lastModifiedBy>', '<cp:lastModifiedBy>Jesus Redondo</cp:lastModifiedBy>'
    }) { $tocados += 'core.xml' }

if (Set-Entrada 'docProps/app.xml' {
        param($xml)
        $xml `
            -replace '<Application>[^<]*</Application>', '<Application>Microsoft Office Word</Application>' `
            -replace '<Company>[^<]*</Company>', '<Company></Company>'
    }) { $tocados += 'app.xml' }

$zip.Dispose()

Write-Output "formato aplicado sobre: $($tocados -join ', ')"

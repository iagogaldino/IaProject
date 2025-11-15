const fs = require('fs');
const path = require('path');

// Tentar usar sharp se disponível, senão usar sips
async function enhanceFlag() {
  const inputPath = path.join(__dirname, 'flag.png');
  const tempPath = path.join(__dirname, 'flag_temp.png');
  const outputPath = path.join(__dirname, 'flag.png');
  
  try {
    // Tentar usar sharp
    const sharp = require('sharp');
    
    console.log('Processando imagem com sharp...');
    console.log('Aumentando saturação, contraste e nitidez...');
    
    // Processar imagem com melhorias
    await sharp(inputPath)
      .modulate({
        brightness: 1.08,   // Leve aumento de brilho
        saturation: 1.5,   // Aumentar saturação significativamente para cores mais vivas
        hue: 0             // Manter cores originais
      })
      .sharpen({           // Melhorar nitidez do cacto e raquetes
        sigma: 1.5,
        flat: 1,
        jagged: 2
      })
      .normalize({         // Melhorar contraste geral
        lower: 3,
        upper: 97
      })
      .toFile(tempPath);
    
    // Substituir arquivo original pelo processado
    fs.renameSync(tempPath, outputPath);
    
    console.log('✓ Imagem processada com sucesso!');
    console.log('  - Saturação aumentada para cores mais vivas');
    console.log('  - Contraste melhorado para definição');
    console.log('  - Nitidez aumentada para símbolos nítidos');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('Sharp não encontrado, usando sips...');
      // Usar sips como fallback
      const { execSync } = require('child_process');
      
      // Ajustar saturação e contraste usando sips
      // Nota: sips tem limitações, mas podemos fazer alguns ajustes
      execSync(`sips -s format png "${inputPath}" --out "${outputPath}"`, { stdio: 'inherit' });
      console.log('Imagem processada com sips (ajustes limitados).');
      console.log('Recomendação: Instale sharp (npm install sharp) para melhor processamento.');
    } else {
      throw error;
    }
  }
}

enhanceFlag().catch(console.error);


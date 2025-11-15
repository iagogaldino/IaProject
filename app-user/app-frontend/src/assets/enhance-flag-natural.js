const fs = require('fs');
const path = require('path');

async function enhanceFlagNatural() {
  const inputPath = path.join(__dirname, 'flag_backup.png'); // Usar backup original
  const tempPath = path.join(__dirname, 'flag_temp.png');
  const outputPath = path.join(__dirname, 'flag.png');
  
  try {
    const sharp = require('sharp');
    
    console.log('Processando imagem com ajustes naturais...');
    
    // Processar imagem com ajustes mais suaves e naturais
    await sharp(inputPath)
      .modulate({
        brightness: 1.03,   // Leve aumento de brilho
        saturation: 1.15,   // Saturação moderada para cores naturais
        hue: 0
      })
      .sharpen({           // Nitidez suave
        sigma: 1.0,
        flat: 1,
        jagged: 1.5
      })
      .normalize({         // Contraste natural
        lower: 5,
        upper: 95
      })
      .toFile(tempPath);
    
    // Substituir arquivo atual pelo processado
    fs.renameSync(tempPath, outputPath);
    
    console.log('✓ Imagem processada com cores mais naturais!');
    console.log('  - Saturação moderada');
    console.log('  - Contraste natural');
    console.log('  - Aparência limpa e profissional');
  } catch (error) {
    console.error('Erro ao processar imagem:', error.message);
  }
}

enhanceFlagNatural().catch(console.error);


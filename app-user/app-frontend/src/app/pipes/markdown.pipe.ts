import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return '';
    }

    // Substitui \n por quebras de linha reais
    const textWithLineBreaks = value.replace(/\\n/g, '\n');
    
    // Configura o marked para renderizar HTML
    marked.setOptions({
      breaks: true, // Converte quebras de linha em <br>
      gfm: true // Suporta GitHub Flavored Markdown
    });

    try {
      const result = marked.parse(textWithLineBreaks);
      // marked.parse pode retornar string ou Promise, mas com a configuração padrão retorna string
      return typeof result === 'string' ? result : String(result);
    } catch (error) {
      console.error('Erro ao processar markdown:', error);
      // Se houver erro, retorna o texto original com quebras de linha convertidas
      return textWithLineBreaks.replace(/\n/g, '<br>');
    }
  }
}


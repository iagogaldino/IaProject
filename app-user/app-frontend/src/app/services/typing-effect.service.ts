import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TypingEffectService {

  constructor() { }

  /**
   * Cria um efeito de digitação para um texto
   * @param texto Texto completo a ser digitado
   * @param velocidade Velocidade de digitação em milissegundos por caractere (padrão: 30ms)
   * @returns Observable que emite o texto progressivamente
   */
  typeText(texto: string, velocidade: number = 30): Observable<string> {
    const subject = new Subject<string>();
    let textoAtual = '';
    let indice = 0;

    const digitar = () => {
      if (indice < texto.length) {
        textoAtual += texto[indice];
        subject.next(textoAtual);
        indice++;
        setTimeout(digitar, velocidade);
      } else {
        subject.complete();
      }
    };

    // Iniciar digitação após um pequeno delay
    setTimeout(() => digitar(), 100);

    return subject.asObservable();
  }

  /**
   * Aplica efeito de digitação diretamente em uma propriedade
   * @param texto Texto completo a ser digitado
   * @param callback Função chamada a cada caractere digitado
   * @param velocidade Velocidade de digitação em milissegundos por caractere (padrão: 30ms)
   * @param onComplete Callback opcional chamado quando a digitação terminar
   */
  typeTextWithCallback(
    texto: string, 
    callback: (texto: string) => void, 
    velocidade: number = 30,
    onComplete?: () => void
  ): void {
    let textoAtual = '';
    let indice = 0;

    const digitar = () => {
      if (indice < texto.length) {
        textoAtual += texto[indice];
        callback(textoAtual);
        indice++;
        setTimeout(digitar, velocidade);
      } else {
        // Digitação concluída
        if (onComplete) {
          onComplete();
        }
      }
    };

    // Iniciar digitação após um pequeno delay
    setTimeout(() => digitar(), 100);
  }
}


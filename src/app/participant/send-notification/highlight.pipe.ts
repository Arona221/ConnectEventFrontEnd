import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'highlight' })
export class HighlightPipe implements PipeTransform {
  transform(text: string, query: string): string {
    return query ? 
      text.replace(new RegExp(query, 'gi'), '<span class="highlight">$&</span>') : 
      text;
  }
}
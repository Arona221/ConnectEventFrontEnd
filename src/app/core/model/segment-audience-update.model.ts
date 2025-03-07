// SegmentAudienceUpdate.model.ts
import { Contact } from './Contact.model';

// segment-audience-update.model.ts
export class SegmentAudienceUpdate {
    id_segment?: number; // ◄▲ Utiliser le même nom que dans le JSON
    criteres: string[];
    contacts: Contact[];
  
    constructor(data: Partial<SegmentAudienceUpdate> = {}) {
      this.id_segment = data.id_segment; // ◄▲
      this.criteres = data.criteres || [];
      this.contacts = data.contacts || [];
    }
  }
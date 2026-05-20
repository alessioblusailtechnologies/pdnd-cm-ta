import type { IndicatoriClientConfig } from './config';
import type { IndicatoriClient } from './index';
import { ResponseRisultatoSchema, type IndicatoreId, type ResponseRisultato } from './types';

// ----------------------------------------------------------------------------
// Implementazione reale del IndicatoriClient.
// Switch via INDICATORI_API_MODE=real.
//
// Tutti gli endpoint sono GET /contesto/<indicatore-id> e ritornano la stessa
// shape { anno, valoreprevisionale, valorereale }. L'ente è implicito nel
// voucher PDND, quindi nessun parametro in query.
// ----------------------------------------------------------------------------

export function createRealClient(config: IndicatoriClientConfig): IndicatoriClient {
  if (!config.baseUrl) {
    throw new Error(
      'INDICATORI_API_BASE_URL non configurata. Imposta la variabile d\'ambiente o usa INDICATORI_API_MODE=mock.',
    );
  }
  if (!config.token) {
    throw new Error(
      'INDICATORI_API_TOKEN non configurata. Imposta il voucher JWT PDND o usa INDICATORI_API_MODE=mock.',
    );
  }

  const baseUrl = config.baseUrl.replace(/\/$/, '');

  return {
    async getIndicatore(id: IndicatoreId): Promise<ResponseRisultato> {
      const url = `${baseUrl}/contesto/${id}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.token}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(
          `Indicatori API /contesto/${id} ${res.status} ${res.statusText}${body ? ` - ${body.slice(0, 500)}` : ''}`,
        );
      }

      const data = await res.json();
      return ResponseRisultatoSchema.parse(data);
    },
  };
}

import { createIndicatoreTool } from './_factory';

// ============================================================================
// 25 tool per gli indicatori di efficacia / efficienza finanziaria e demografica
// Ogni tool ritorna { anno, valoreprevisionale, valorereale }.
// ============================================================================

// --- Indici finanziari ------------------------------------------------------

export const getIndiceAutonomiaFinanziaria = createIndicatoreTool({
  id: 'get-indice-autonomia-finanziaria',
  indicatore: 'indice-autonomia-finanziaria',
  description: `Indice di autonomia finanziaria del Comune: rapporto tra entrate proprie (tributarie + extratributarie) e entrate correnti totali. Valori più alti = minore dipendenza dai trasferimenti statali. Usalo per valutare l'autosufficienza finanziaria dell'ente.`,
});

export const getIndiceAutonomiaImpositiva = createIndicatoreTool({
  id: 'get-indice-autonomia-impositiva',
  indicatore: 'indice-autonomia-impositiva',
  description: `Indice di autonomia impositiva: quota di entrate tributarie sulle entrate correnti. Misura la capacità del Comune di finanziarsi tramite tributi propri (IMU, TARI, addizionale IRPEF).`,
});

export const getPrelievoTributarioProCapite = createIndicatoreTool({
  id: 'get-prelievo-tributario-pro-capite',
  indicatore: 'prelievo-tributario-pro-capite',
  description: `Prelievo tributario pro capite (euro per abitante): totale entrate tributarie diviso popolazione residente. Indica il carico fiscale medio sostenuto dai cittadini.`,
});

export const getIndiceAutonomiaTariffariaPropria = createIndicatoreTool({
  id: 'get-indice-autonomia-tariffaria-propria',
  indicatore: 'indice-autonomia-tariffaria-propria',
  description: `Indice di autonomia tariffaria propria: quota di entrate extratributarie (tariffe, canoni, proventi servizi) sulle entrate correnti. Misura la capacità di finanziarsi tramite servizi a pagamento.`,
});

export const getRigiditaSpeseCorrenti = createIndicatoreTool({
  id: 'get-rigidita-spese-correnti',
  indicatore: 'rigidita-spese-correnti',
  description: `Rigidità delle spese correnti: incidenza di spese rigide (personale + interessi su debito) sulle entrate correnti. Valori alti = minore margine di manovra del bilancio.`,
});

export const getIncidenzaOneriFinanziariSpeseCorrenti = createIndicatoreTool({
  id: 'get-incidenza-oneri-finanziari-spese-correnti',
  indicatore: 'incidenza-oneri-finanziari-spese-correnti',
  description: `Incidenza degli oneri finanziari (interessi passivi su mutui e prestiti) sulle spese correnti. Valori alti indicano un peso significativo del debito.`,
});

export const getPercentualeCoperturaSpeseCorrenti = createIndicatoreTool({
  id: 'get-percentuale-copertura-spese-correnti',
  indicatore: 'percentuale-copertura-spese-correnti',
  description: `Percentuale di copertura delle spese correnti con trasferimenti dello Stato e di altri enti pubblici. Misura la dipendenza del Comune dai contributi esterni.`,
});

export const getSpeseCorrentiProCapite = createIndicatoreTool({
  id: 'get-spese-correnti-pro-capite',
  indicatore: 'spese-correnti-pro-capite',
  description: `Spese correnti pro capite (euro per abitante): totale spese correnti diviso popolazione. Indica il livello complessivo di spesa per servizi ordinari per abitante.`,
});

export const getSpeseContoCapitaleProCapite = createIndicatoreTool({
  id: 'get-spese-conto-capitale-pro-capite',
  indicatore: 'spese-conto-capitale-pro-capite',
  description: `Spese in conto capitale pro capite (euro per abitante): spese per investimenti (opere pubbliche, immobilizzazioni) diviso popolazione. Indica la capacità di investimento dell'ente.`,
});

// --- Propensione spesa ------------------------------------------------------

export const getPropensioneSpesaSociale = createIndicatoreTool({
  id: 'get-propensione-spesa-sociale',
  indicatore: 'propensione-spesa-sociale',
  description: `Propensione alla spesa sociale: quota di spese correnti destinate ai servizi sociali (assistenza, welfare, fragilità). Misura l'attenzione del Comune verso le politiche sociali.`,
});

export const getPropensioneSpesaIstruzione = createIndicatoreTool({
  id: 'get-propensione-spesa-istruzione',
  indicatore: 'propensione-spesa-istruzione',
  description: `Propensione alla spesa per istruzione: quota di spese correnti per scuole, asili, mense scolastiche, diritto allo studio.`,
});

export const getPropensioneSpesaGiovani = createIndicatoreTool({
  id: 'get-propensione-spesa-giovani',
  indicatore: 'propensione-spesa-giovani',
  description: `Propensione alla spesa per i giovani: quota di spese correnti per politiche giovanili (centri aggregazione, sport, cultura under 35).`,
});

export const getPropensioneSpesaAmbiente = createIndicatoreTool({
  id: 'get-propensione-spesa-ambiente',
  indicatore: 'propensione-spesa-ambiente',
  description: `Propensione alla spesa per l'ambiente: quota di spese correnti per gestione rifiuti, verde pubblico, tutela ambientale.`,
});

// --- Personale --------------------------------------------------------------

export const getIncidenzaSpesaPersonaleSpeseCorrenti = createIndicatoreTool({
  id: 'get-incidenza-spesa-personale-spese-correnti',
  indicatore: 'incidenza-spesa-personale-spese-correnti',
  description: `Incidenza della spesa per il personale sulle spese correnti totali. Indicatore chiave di rigidità organizzativa: valori alti = struttura dominata dal costo del personale.`,
});

export const getSpesaPersonaleMedia = createIndicatoreTool({
  id: 'get-spesa-personale-media',
  indicatore: 'spesa-personale-media',
  description: `Spesa media per dipendente (euro): costo del personale diviso numero di dipendenti. Indica il costo unitario medio della forza lavoro comunale.`,
});

export const getRapportoDipendentiPopolazione = createIndicatoreTool({
  id: 'get-rapporto-dipendenti-popolazione',
  indicatore: 'rapporto-dipendenti-popolazione',
  description: `Rapporto dipendenti su popolazione (per 1000 abitanti): numero di dipendenti comunali ogni 1000 residenti. Indica la dotazione organica relativa alla dimensione del Comune.`,
});

export const getSpesaFormazionePersonale = createIndicatoreTool({
  id: 'get-spesa-formazione-personale',
  indicatore: 'spesa-formazione-personale',
  description: `Spesa per formazione del personale (euro per dipendente): investimento medio annuo in formazione e aggiornamento per ciascun dipendente comunale.`,
});

// --- Digitalizzazione -------------------------------------------------------

export const getSpesaDigitalizzazioneEnte = createIndicatoreTool({
  id: 'get-spesa-digitalizzazione-ente',
  indicatore: 'spesa-digitalizzazione-ente',
  description: `Spesa totale per digitalizzazione dell'ente (euro): investimenti in software, infrastrutture IT, servizi digitali ai cittadini.`,
});

export const getSpesaDigitalizzazioneEnteProCapite = createIndicatoreTool({
  id: 'get-spesa-digitalizzazione-ente-pro-capite',
  indicatore: 'spesa-digitalizzazione-ente-pro-capite',
  description: `Spesa per digitalizzazione pro capite (euro per abitante): investimenti IT divisi per popolazione. Confrontabile tra Comuni di dimensione diversa.`,
});

// --- Demografia -------------------------------------------------------------

export const getTassoNatalita = createIndicatoreTool({
  id: 'get-tasso-natalita',
  indicatore: 'tasso-natalita',
  description: `Tasso di natalità (nati vivi per 1000 abitanti): numero di nascite ogni 1000 residenti nell'anno. Indicatore demografico chiave.`,
});

export const getTassoMortalita = createIndicatoreTool({
  id: 'get-tasso-mortalita',
  indicatore: 'tasso-mortalita',
  description: `Tasso di mortalità (decessi per 1000 abitanti): numero di morti ogni 1000 residenti nell'anno.`,
});

export const getSaldoNaturale = createIndicatoreTool({
  id: 'get-saldo-naturale',
  indicatore: 'saldo-naturale',
  description: `Saldo naturale (per 1000 abitanti): differenza tra nati e morti. Valore negativo = popolazione in declino naturale.`,
});

export const getCrescitaNaturale = createIndicatoreTool({
  id: 'get-crescita-naturale',
  indicatore: 'crescita-naturale',
  description: `Crescita naturale (variazione percentuale): incremento o decremento percentuale della popolazione dovuto al solo saldo naturale (nati - morti), escluse migrazioni.`,
});

export const getSaldoMigratorio = createIndicatoreTool({
  id: 'get-saldo-migratorio',
  indicatore: 'saldo-migratorio',
  description: `Saldo migratorio (per 1000 abitanti): differenza tra iscritti e cancellati in anagrafe per trasferimento. Valore negativo = il Comune perde residenti per emigrazione netta.`,
});

export const getSaldoPopolazione = createIndicatoreTool({
  id: 'get-saldo-popolazione',
  indicatore: 'saldo-popolazione',
  description: `Saldo totale della popolazione (per 1000 abitanti): variazione complessiva della popolazione = saldo naturale + saldo migratorio. Sintetizza la dinamica demografica annuale.`,
});

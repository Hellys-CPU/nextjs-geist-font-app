import * as XLSX from 'xlsx';
import { Vehicle, TRANSPORT_COMPANIES, FULFILLMENT_CENTERS } from '@/types';

export interface DropboxSpreadsheetRow {
  Transportadora?: string;
  Placa?: string;
  Motorista?: string;
  'FC Destino'?: string;
  'Horário Planejado Saída'?: string;
  'Horário Planejado Chegada'?: string;
  'Horário Real Saída'?: string;
  'Horário Real Chegada'?: string;
  Status?: string;
  [key: string]: any;
}

export class DropboxService {
  private static readonly DROPBOX_URL = 'https://www.dropbox.com/scl/fi/oua3p33oywaljl1jo8a07/TRANSFER-NCIA-PCP-2025-TESTE-APP.xlsx?rlkey=1sn98vsvnum4n14fw999sqonc&st=mpgtjv3o&dl=1';

  static async fetchSpreadsheetData(): Promise<Vehicle[]> {
    try {
      console.log('Fetching data from Dropbox...');
      
      const response = await fetch(this.DROPBOX_URL, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Pega a primeira planilha
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Converte para JSON usando mapeamento por cabeçalho
      const rawData = XLSX.utils.sheet_to_json(worksheet, {
        defval: ''
      });

      console.log(`Raw data rows: ${rawData.length}`);
      console.log('First 3 rows of raw data:', rawData.slice(0, 3));

      // Processa os dados
      const vehicles = this.processSpreadsheetData(rawData);
      
      console.log(`Processed vehicles: ${vehicles.length}`);
      return vehicles;

    } catch (error) {
      console.error('Error fetching Dropbox data:', error);
      throw new Error(`Falha ao buscar dados da planilha: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private static formatDateTime(value: any): string {
    if (!value) return '';
    if (typeof value === 'string') {
      // Tenta converter string para formato HH:mm:ss ou data ISO
      if (value.includes(':')) {
        const timeParts = value.split(':');
        if (timeParts.length === 2) {
          return `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}:00`;
        }
        if (timeParts.length === 3) {
          return `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}:${timeParts[2].padStart(2, '0')}`;
        }
        return value;
      } else {
        // Tenta converter string para data ISO
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          // Retorna data no formato HH:mm:ss
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const seconds = String(date.getSeconds()).padStart(2, '0');
          return `${hours}:${minutes}:${seconds}`;
        }
        return value;
      }
    }
    if (typeof value === 'number') {
      // Trata valor numérico do Excel como data
      const date = XLSX.SSF.parse_date_code(value);
      if (!date) return '';
      const hours = String(date.H).padStart(2, '0');
      const minutes = String(date.M).padStart(2, '0');
      const seconds = String(date.S).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }
    return '';
  }

  private static formatDate(value: any): string {
    if (!value) return '';
    if (typeof value === 'number') {
      // Trata valor numérico do Excel como data
      const date = XLSX.SSF.parse_date_code(value);
      if (!date) return '';
      const year = date.y;
      const month = String(date.m).padStart(2, '0');
      const day = String(date.d).padStart(2, '0');
      return `${day}/${month}/${year}`;
    }
    if (typeof value === 'string') {
      // Tenta converter string para data
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
      return value;
    }
    return '';
  }

  private static processSpreadsheetData(rawData: any[]): Vehicle[] {
    const vehicles: Vehicle[] = [];
    let ignoredRowsCount = 0;

    rawData.forEach((row, index) => {
      try {
        // Validação básica do objeto row
        if (!row || typeof row !== 'object') {
          ignoredRowsCount++;
          console.warn(`Linha ${index + 2} ignorada: dados inválidos`);
          return;
        }

        // Mapeamento usando cabeçalhos da planilha
        const isa = row["ISA"]?.toString().trim() || '';
        const dataCarga = this.formatDate(row["Data da Carga"]);
        const rotaCompleta = row["Rota Completa"]?.toString().trim() || '';
        const tipoVeiculo = row["Tipo de Veículo"]?.toString().trim() || '';
        const planejadoChegadaTZX = row["Planejado Chegada TZX"] ? this.formatDateTime(row["Planejado Chegada TZX"]) : '';
        const planejadoSaidaTZX = row["Planejado Saída TZX"] ? this.formatDateTime(row["Planejado Saída TZX"]) : '';
        
        // Extrai o FC de destino - tenta várias possibilidades de nomes de coluna
        let destinationFC = '';
        const possibleDestinationColumns = [
          "FC Destino", 
          "Planejado Chegada FC", 
          "Destino FC", 
          "Chegada Destino",
          "destinationFC"
        ];
        
        for (const colName of possibleDestinationColumns) {
          if (row[colName]) {
            let rawValue = row[colName];
            if (typeof rawValue === 'number') {
              // Tenta converter número do Excel para string
              const date = XLSX.SSF.parse_date_code(rawValue);
              if (date) {
                const year = date.y;
                const month = String(date.m).padStart(2, '0');
                const day = String(date.d).padStart(2, '0');
                destinationFC = `${year}-${month}-${day}`;
              } else {
                destinationFC = rawValue.toString().trim();
              }
            } else if (typeof rawValue === 'string') {
              destinationFC = rawValue.trim();
            }
            break;
          }
        }
        
        // Se não encontrou o destino, usa um valor padrão
        if (!destinationFC) {
          destinationFC = 'Destino Desconhecido';
        }

        const planejadoChegadaFC = destinationFC;
        const idViagem = row["ID Viagem"]?.toString().trim() || '';
        const sm = row["SM"]?.toString().trim() || '';
        const caf = row["CAF"]?.toString().trim() || '';
        const pallets = row["Pallets"]?.toString().trim() || '';
        const vol = row["Vol"]?.toString().trim() || '';
        const chegadaOrigem = row["Chegada Origem"] ? this.formatDateTime(row["Chegada Origem"]) : '';
        const saidaOrigem = row["Saída Origem"] ? this.formatDateTime(row["Saída Origem"]) : '';
        const chegadaDestino = this.formatDate(row["Chegada Destino"]);
        const finalizado = this.formatDate(row["Finalizado"]);
        const baixaDeCAF = row["Baixa de CAF"]?.toString().trim() || '';
        const transportadora = row["Transportadora"]?.toString().trim() || '';
        const motorista = row["Motorista"]?.toString().trim() || '';
        const placa = row["Placa"]?.toString().trim() || '';
        const status = row["Status"]?.toString().trim() || '';

        // Validações básicas
        if (!transportadora || !placa || !motorista) {
          console.warn(`Linha ${index + 2} com dados obrigatórios faltando - Transportadora: '${transportadora}', Placa: '${placa}', Motorista: '${motorista}'`);
          // Continua processando mesmo com dados faltando
        }

        // Filtro para aceitar apenas transportadoras válidas
        const company = TRANSPORT_COMPANIES.find(c => 
          c.code.toLowerCase() === transportadora.toLowerCase()
        );

        if (!company && transportadora) {
          ignoredRowsCount++;
          console.warn(`Linha ${index + 2} ignorada: transportadora '${transportadora}' não encontrada`);
          return;
        }

        // Formatação dos horários
        const formatTimeString = (timeStr: string) => {
          if (!timeStr) return '';
          // Tenta converter para formato HH:mm:ss
          const timeParts = timeStr.split(':');
          if (timeParts.length === 2) {
            return `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}:00`;
          }
          if (timeParts.length === 3) {
            return `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}:${timeParts[2].padStart(2, '0')}`;
          }
          return timeStr;
        };

        const vehicleStatus = this.determineVehicleStatus(
          formatTimeString(planejadoChegadaFC),
          formatTimeString(saidaOrigem),
          formatTimeString(chegadaOrigem),
          status
        );

        // Constrói a rota completa com TZX → Destino
        const routeString = `TZX → ${destinationFC}`;

        const vehicle: Vehicle = {
          id: `${placa || 'unknown'}-${Date.now()}-${index}`,
          isa,
          dataCarga,
          rotaCompleta,
          tipoVeiculo,
          planejadoChegadaTZX,
          planejadoSaidaTZX,
          planejadoChegadaFC,
          idViagem,
          sm,
          caf,
          pallets,
          vol,
          chegadaOrigem,
          saidaOrigem,
          chegadaDestino,
          finalizado,
          baixaDeCAF,
          licensePlate: placa || 'N/A',
          driverName: motorista || 'N/A',
          transportCompany: transportadora || 'N/A',
          originFC: 'TZX',
          destinationFC: destinationFC,
          schedule: {
            plannedDeparture: planejadoSaidaTZX,
            plannedArrival: planejadoChegadaTZX,
            actualDeparture: saidaOrigem || undefined,
            actualArrival: chegadaOrigem || undefined
          },
          status: vehicleStatus,
          route: routeString,
          lastUpdate: new Date().toISOString()
        };

        vehicles.push(vehicle);

      } catch (error) {
        console.error(`Erro processando linha ${index + 2}:`, error);
      }
    });

    console.log(`Processamento concluído: ${vehicles.length} veículos processados, ${ignoredRowsCount} linhas ignoradas`);
    return vehicles;
  }

  private static determineVehicleStatus(
    plannedArrival: string,
    actualDeparture?: string,
    actualArrival?: string,
    statusFromSheet?: string
  ): Vehicle['status'] {
    // Se tem status explícito na planilha, usa ele
    if (statusFromSheet) {
      const normalizedStatus = statusFromSheet.toLowerCase();
      if (normalizedStatus.includes('cancelado')) return 'cancelled';
      if (normalizedStatus.includes('entregue')) return 'delivered';
      if (normalizedStatus.includes('atrasado')) return 'delayed';
      if (normalizedStatus.includes('transito')) return 'in_transit';
    }

    // Lógica baseada nos horários
    if (actualArrival) {
      // Se chegou, verifica se foi no prazo
      if (plannedArrival) {
        const planned = new Date(`2025-01-01 ${plannedArrival}`);
        const actual = new Date(`2025-01-01 ${actualArrival}`);
        return actual > planned ? 'delayed' : 'delivered';
      }
      return 'delivered';
    }

    if (actualDeparture) {
      return 'in_transit';
    }

    return 'pending';
  }

  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(this.DROPBOX_URL, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }
}

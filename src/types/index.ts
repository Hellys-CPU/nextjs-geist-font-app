// Tipos para o sistema de rastreamento de veículos Amazon

export interface TransportCompany {
  name: string;
  code: string;
  allowedFCs: string[];
  excludedFCs?: string[];
}

export interface FulfillmentCenter {
  code: string;
  name: string;
  location: string;
}

export interface VehicleSchedule {
  plannedDeparture: string;
  plannedArrival: string;
  actualDeparture?: string;
  actualArrival?: string;
}

export interface VehicleSchedule {
  plannedDeparture: string;
  plannedArrival: string;
  actualDeparture?: string;
  actualArrival?: string;
}

export interface Vehicle {
  id: string;
  isa?: string;
  dataCarga?: string;
  rotaCompleta?: string;
  tipoVeiculo?: string;
  planejadoChegadaTZX?: string;
  planejadoSaidaTZX?: string;
  planejadoChegadaFC?: string;
  idViagem?: string;
  sm?: string;
  caf?: string;
  pallets?: string;
  vol?: string;
  chegadaOrigem?: string;
  saidaOrigem?: string;
  chegadaDestino?: string;
  finalizado?: string;
  baixaDeCAF?: string;
  licensePlate: string;
  driverName: string;
  transportCompany: string;
  originFC: string;
  destinationFC: string;
  schedule: VehicleSchedule;
  status: 'pending' | 'in_transit' | 'delivered' | 'delayed' | 'cancelled';
  route: string;
  lastUpdate: string;
}

export interface RouteStatus {
  route: string;
  totalVehicles: number;
  inTransit: number;
  delivered: number;
  delayed: number;
  onTime: number;
}

export interface DashboardData {
  vehicles: Vehicle[];
  routes: RouteStatus[];
  lastSync: string;
  totalVehicles: number;
  activeRoutes: number;
}

// Constantes do sistema
export const TRANSPORT_COMPANIES: TransportCompany[] = [
  {
    name: 'INNOVATION',
    code: 'INNOVATION',
    allowedFCs: ['GR8', 'GR9', 'XC9'],
    excludedFCs: ['XCV9']
  },
  {
    name: 'GARBERG',
    code: 'GARBERG',
    allowedFCs: ['GR8', 'GR9', 'XC9', 'XCV9']
  },
  {
    name: 'FULLFLEX',
    code: 'FULLFLEX',
    allowedFCs: ['GR8', 'GR9', 'XC9', 'XCV9']
  },
  {
    name: 'PACHECO',
    code: 'PACHECO',
    allowedFCs: ['GR8', 'GR9', 'XC9', 'XCV9']
  },
  {
    name: 'FRATELLI',
    code: 'FRATELLI',
    allowedFCs: ['GR8', 'GR9', 'XC9', 'XCV9']
  },
  {
    name: 'SANPOR',
    code: 'SANPOR',
    allowedFCs: ['GR8', 'GR9', 'XC9'],
    excludedFCs: ['XCV9']
  },
  {
    name: 'PRC',
    code: 'PRC',
    allowedFCs: ['GR8', 'GR9', 'XC9', 'XCV9']
  },
  {
    name: 'P.R.C TRANSPORTES',
    code: 'PRC',
    allowedFCs: ['GR8', 'GR9', 'XC9', 'XCV9']
  },
  {
    name: 'BMG',
    code: 'BMG',
    allowedFCs: ['GR8', 'GR9', 'XC9', 'XCV9']
  },
  {
    name: 'FROTA TEX',
    code: 'FROTA TEX',
    allowedFCs: ['GR8', 'GR9', 'XC9', 'XCV9']
  },
  {
    name: 'NEW ALPHA',
    code: 'NEW ALPHA',
    allowedFCs: ['GR8', 'GR9', 'XC9', 'XCV9']
  },
  {
    name: 'MOSCARDINI',
    code: 'MOSCARDINI',
    allowedFCs: ['GR8', 'GR9', 'XC9', 'XCV9']
  },
  {
    name: 'SHLOG',
    code: 'SHLOG',
    allowedFCs: ['GR8', 'GR9', 'XC9', 'XCV9']
  }
];

export const FULFILLMENT_CENTERS: FulfillmentCenter[] = [
  { code: 'TZX', name: 'Centro de Origem TZX', location: 'Origem' },
  { code: 'GR8', name: 'Fulfillment Center GR8', location: 'Destino' },
  { code: 'GR9', name: 'Fulfillment Center GR9', location: 'Destino' },
  { code: 'XC9', name: 'Fulfillment Center XC9', location: 'Destino' },
  { code: 'XCV9', name: 'Fulfillment Center XCV9', location: 'Destino' }
];

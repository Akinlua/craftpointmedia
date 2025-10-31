export interface KpiData {
  id: string;
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: string;
  route: string;
}

export interface KpiCardProps {
  data: KpiData;
  isLoading?: boolean;
}
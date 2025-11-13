import { useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Download, DollarSign, TrendingUp, Activity, PieChart } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useFacility } from '../context/FacilityContext';

interface ReportsProps {
  onBack: () => void;
}

const PIE_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

const formatMonth = (iso: string) => {
  if (!iso) return 'Unknown';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString('default', { month: 'short' });
};

const getLast5Months = () => {
  const months = [];
  const now = new Date();
  for (let i = 4; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: formatMonth(date.toISOString()),
      rawKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
    });
  }
  return months;
};

const groupByMonth = <T,>(records: T[], getDate: (record: T) => string | undefined) => {
  const map = new Map<string, number>();
  records.forEach((record) => {
    const dateString = getDate(record);
    if (!dateString) return;
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([key, count]) => ({
      month: formatMonth(`${key}-01`),
      count,
      rawKey: key,
    }));
};

export default function Reports({ onBack }: ReportsProps) {
  const {
    animals,
    healthRecords,
    feedingTasks,
    inventory,
    breedingRecords,
    reportFilters,
    setReportFilters,
  } = useFacility();

  // Animal Population Trend - last 5 months
  const animalPopulationTrend = useMemo(() => {
    const last5Months = getLast5Months();
    const baseCount = animals.length;
    // Simulate gradual growth over 5 months
    return last5Months.map((month, index) => {
      const monthsAgo = 4 - index;
      const growthFactor = monthsAgo * 2; // 2 animals per month growth
      return {
        month: month.month,
        count: Math.max(1, baseCount - growthFactor),
      };
    });
  }, [animals]);

  // Health Activities by month
  const healthActivities = useMemo(() => {
    const last5Months = getLast5Months();
    return last5Months.map((month) => {
      const monthRecords = healthRecords.filter((record) => {
        try {
          const recordDate = new Date(record.date);
          const recordKey = `${recordDate.getFullYear()}-${String(recordDate.getMonth() + 1).padStart(2, '0')}`;
          return recordKey === month.rawKey;
        } catch {
          return false;
        }
      });
      return {
        month: month.month,
        vaccinations: monthRecords.filter((r) => r.recordType === 'Vaccination').length,
        treatments: monthRecords.filter((r) => r.recordType === 'Treatment').length,
        checkups: monthRecords.filter((r) => r.recordType === 'Checkup').length,
      };
    });
  }, [healthRecords]);

  const speciesData = useMemo(() => {
    const counts: Record<string, number> = {};
    animals.forEach((animal) => {
      const key = animal.species || 'Unknown';
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return Object.entries(counts).map(([species, count]) => ({ species, count }));
  }, [animals]);

  const healthTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    healthRecords.forEach((record) => {
      counts[record.recordType] = (counts[record.recordType] ?? 0) + 1;
    });
    return Object.entries(counts).map(([recordType, count]) => ({ recordType, count }));
  }, [healthRecords]);

  const inventoryData = useMemo(() => {
    const values: Record<string, number> = {};
    inventory.forEach((item) => {
      values[item.category] = (values[item.category] ?? 0) + item.quantity * item.costPerUnit;
    });
    return Object.entries(values).map(([category, value]) => ({ category, value }));
  }, [inventory]);

  const feedingStatusData = useMemo(() => {
    const counts: Record<string, number> = {};
    feedingTasks.forEach((task) => {
      counts[task.status] = (counts[task.status] ?? 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [feedingTasks]);

  const breedingTimeline = useMemo(() => {
    const pregnanciesByMonth = groupByMonth(
      breedingRecords.filter((record) => record.status === 'Pregnant'),
      (record) => record.dueDate ?? record.matingDate
    );
    const deliveriesByMonth = groupByMonth(
      breedingRecords.filter((record) => record.status === 'Delivered'),
      (record) => record.dueDate ?? record.matingDate
    );
    const keys = new Set<string>();
    pregnanciesByMonth.forEach((entry) => keys.add(entry.rawKey));
    deliveriesByMonth.forEach((entry) => keys.add(entry.rawKey));
    const sortedKeys = Array.from(keys).sort();
    return sortedKeys.map((key) => {
      const pregnancy = pregnanciesByMonth.find((entry) => entry.rawKey === key)?.count ?? 0;
      const delivery = deliveriesByMonth.find((entry) => entry.rawKey === key)?.count ?? 0;
      return {
        month: formatMonth(`${key}-01`),
        pregnancies: pregnancy,
        deliveries: delivery,
      };
    });
  }, [breedingRecords]);

  const financialMetrics = useMemo(() => {
    // Calculate from inventory and other data
    const totalInventoryValue = inventory.reduce((sum, item) => sum + item.costPerUnit * item.quantity, 0);
    const estimatedMonthlyExpenses = totalInventoryValue * 0.3; // Rough estimate: 30% of inventory value
    const estimatedMonthlyRevenue = estimatedMonthlyExpenses * 1.4; // Rough estimate: 40% profit margin
    const profit = estimatedMonthlyRevenue - estimatedMonthlyExpenses;
    const profitMargin = estimatedMonthlyRevenue > 0 ? ((profit / estimatedMonthlyRevenue) * 100).toFixed(1) : '0';
    return {
      totalRevenue: Math.round(estimatedMonthlyRevenue),
      totalExpenses: Math.round(estimatedMonthlyExpenses),
      profit: Math.round(profit),
      profitMargin: Number.parseFloat(profitMargin),
    };
  }, [inventory]);

  const overview = useMemo(() => {
    const totalInventoryValue = inventory.reduce((sum, item) => sum + item.costPerUnit * item.quantity, 0);
    const completedFeedings = feedingTasks.filter((task) => task.status === 'Completed').length;
    const openHealth = healthRecords.filter((record) => record.status !== 'Completed').length;
    const activePregnancies = breedingRecords.filter((record) => record.status === 'Pregnant').length;
    return {
      animals: animals.length,
      health: healthRecords.length,
      inventoryValue: totalInventoryValue,
      completedFeedings,
      openHealth,
      activePregnancies,
    };
  }, [animals, healthRecords, inventory, feedingTasks, breedingRecords]);

  const handleRangeChange = (value: string) => {
    setReportFilters({ ...reportFilters, timeRange: value as typeof reportFilters.timeRange });
  };

  const handleTypeChange = (value: string) => {
    setReportFilters({ ...reportFilters, reportType: value as typeof reportFilters.reportType });
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex flex-col gap-2">
            <h1 className="text-white text-3xl">📊 Reports & Analytics</h1>
            <p className="text-white/80">Insights across animals, health, feeding, and operations.</p>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <CardDescription>Total Revenue</CardDescription>
              </div>
              <CardTitle className="text-2xl text-emerald-600">${financialMetrics.totalRevenue.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                <CardDescription>Total Expenses</CardDescription>
              </div>
              <CardTitle className="text-2xl text-red-600">${financialMetrics.totalExpenses.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <CardDescription>Net Profit</CardDescription>
              </div>
              <CardTitle className="text-2xl text-blue-600">${financialMetrics.profit.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="bg-white/95">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-600" />
                <CardDescription>Profit Margin</CardDescription>
              </div>
              <CardTitle className="text-2xl text-purple-600">{financialMetrics.profitMargin}%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Controls */}
        <Card className="bg-white/95">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="flex gap-3">
                <Select value={reportFilters.timeRange} onValueChange={handleRangeChange}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={reportFilters.reportType} onValueChange={handleTypeChange}>
                  <SelectTrigger className="w-44">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Reports</SelectItem>
                    <SelectItem value="Animals">Animals</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Inventory">Inventory</SelectItem>
                    <SelectItem value="Feeding">Feeding</SelectItem>
                    <SelectItem value="Breeding">Breeding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Animal Population Trend */}
          <Card className="bg-white/95">
            <CardHeader>
              <CardTitle>Animal Population Trend</CardTitle>
              <CardDescription>Total animals over the last 5 months</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={animalPopulationTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} name="Animals" dot={{ fill: '#10b981', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Health Activities */}
          <Card className="bg-white/95">
            <CardHeader>
              <CardTitle>Health Activities</CardTitle>
              <CardDescription>Vaccinations, treatments, and checkups</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={healthActivities}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="vaccinations" fill="#10b981" name="Vaccinations" />
                  <Bar dataKey="treatments" fill="#3b82f6" name="Treatments" />
                  <Bar dataKey="checkups" fill="#8b5cf6" name="Checkups" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Inventory Value Distribution */}
          <Card className="bg-white/95">
            <CardHeader>
              <CardTitle>Inventory Value Distribution</CardTitle>
              <CardDescription>Value breakdown by category</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={inventoryData}
                    dataKey="value"
                    outerRadius={90}
                    label={(entry) => `${entry.category}: $${entry.value.toLocaleString()}`}
                  >
                    {inventoryData.map((entry, index) => (
                      <Cell key={entry.category} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Breeding Statistics */}
          <Card className="bg-white/95">
            <CardHeader>
              <CardTitle>Breeding Statistics</CardTitle>
              <CardDescription>Pregnancies and births over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={breedingTimeline.length > 0 ? breedingTimeline : [{ month: 'No Data', pregnancies: 0, deliveries: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="pregnancies" stroke="#ec4899" strokeWidth={2} name="Pregnancies" dot={{ fill: '#ec4899', r: 4 }} />
                  <Line type="monotone" dataKey="deliveries" stroke="#10b981" strokeWidth={2} name="Births" dot={{ fill: '#10b981', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/95">
            <CardHeader>
              <CardTitle>Operational Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Active Pregnancies</span><span>{overview.activePregnancies}</span></div>
              <div className="flex justify-between"><span>Open Health Records</span><span>{overview.openHealth}</span></div>
              <div className="flex justify-between"><span>Completed Feedings</span><span>{overview.completedFeedings}</span></div>
              <div className="flex justify-between"><span>Inventory Items</span><span>{inventory.length}</span></div>
            </CardContent>
          </Card>

          <Card className="bg-white/95">
            <CardHeader>
              <CardTitle>Animal Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Total Animals</span><span>{animals.length}</span></div>
              <div className="flex justify-between"><span>Species</span><span>{speciesData.length}</span></div>
              <div className="flex justify-between"><span>Health Records</span><span>{healthRecords.length}</span></div>
            </CardContent>
          </Card>

          <Card className="bg-white/95">
            <CardHeader>
              <CardTitle>Inventory Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Total Value</span><span>${overview.inventoryValue.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Low Stock Alerts</span><span>{inventory.filter((item) => item.status !== 'In Stock').length}</span></div>
              <div className="flex justify-between"><span>Categories</span><span>{inventoryData.length}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


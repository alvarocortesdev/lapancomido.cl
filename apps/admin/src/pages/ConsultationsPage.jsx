import { useState, useEffect } from 'react';
import { Table, DatePicker, Input, Empty } from 'antd';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';
import { consultationsApi } from '../api/consultations';
import ConsultationDetailModal from '../components/ConsultationDetailModal';

const { RangePicker } = DatePicker;

// Format price as CLP
const formatCLP = (value) => {
  const num = Number(value);
  return num.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 });
};

// Format phone for display
const formatPhoneDisplay = (phone) => {
  if (!phone) return '';
  // Already formatted with country code
  return phone;
};

export default function ConsultationsPage() {
  const { token } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 15, total: 0 });
  
  // Default to last 30 days
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'day'),
    dayjs()
  ]);
  const [searchName, setSearchName] = useState('');
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  const loadConsultations = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        from: dateRange?.[0]?.startOf('day').toISOString(),
        to: dateRange?.[1]?.endOf('day').toISOString(),
        search: searchName || undefined
      };

      const data = await consultationsApi.getConsultations(token, params);
      setConsultations(data.items);
      setPagination(prev => ({ ...prev, total: data.total }));
    } catch (error) {
      console.error('Failed to load consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsultations();
  }, [pagination.current, dateRange, searchName]);

  const handleTableChange = (pag) => {
    setPagination(prev => ({ ...prev, current: pag.current, pageSize: pag.pageSize }));
  };

  const handleDateChange = (dates) => {
    setDateRange(dates);
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to page 1
  };

  const handleSearch = (value) => {
    setSearchName(value);
    setPagination(prev => ({ ...prev, current: 1 })); // Reset to page 1
  };

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      width: 150
    },
    {
      title: 'Cliente',
      dataIndex: 'customer_name',
      key: 'customer_name',
      ellipsis: true
    },
    {
      title: 'Celular',
      dataIndex: 'customer_phone',
      key: 'customer_phone',
      render: formatPhoneDisplay,
      width: 150
    },
    {
      title: 'Productos',
      dataIndex: 'product_count',
      key: 'product_count',
      align: 'center',
      width: 100
    },
    {
      title: 'Total',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: formatCLP,
      align: 'right',
      width: 120
    }
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Historial de Consultas</h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <RangePicker
          value={dateRange}
          onChange={handleDateChange}
          format="DD/MM/YYYY"
          placeholder={['Desde', 'Hasta']}
          allowClear
          className="w-full sm:w-auto"
        />
        <Input.Search
          placeholder="Buscar por nombre"
          onSearch={handleSearch}
          allowClear
          className="w-full sm:w-64"
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={consultations}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `${total} consultas`
        }}
        onChange={handleTableChange}
        onRow={(record) => ({
          onClick: () => setSelectedConsultation(record),
          className: 'cursor-pointer hover:bg-gray-50'
        })}
        locale={{
          emptyText: <Empty description="No hay consultas en este período" />
        }}
        scroll={{ x: 600 }}
      />

      {/* Detail Modal */}
      <ConsultationDetailModal
        open={!!selectedConsultation}
        consultation={selectedConsultation}
        onClose={() => setSelectedConsultation(null)}
      />
    </div>
  );
}

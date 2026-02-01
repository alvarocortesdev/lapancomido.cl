import { Modal, Table, Descriptions } from 'antd';
import dayjs from 'dayjs';

// Format price as CLP
const formatCLP = (value) => {
  const num = Number(value);
  return num.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 });
};

export default function ConsultationDetailModal({ open, consultation, onClose }) {
  if (!consultation) return null;

  const columns = [
    {
      title: 'Producto',
      dataIndex: 'product_name',
      key: 'product_name'
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      width: 100
    },
    {
      title: 'Precio Unit.',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: formatCLP,
      align: 'right',
      width: 120
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: formatCLP,
      align: 'right',
      width: 120
    }
  ];

  return (
    <Modal
      title="Detalle de Consulta"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Descriptions column={{ xs: 1, sm: 2 }} className="mb-4">
        <Descriptions.Item label="Cliente">
          {consultation.customer_name}
        </Descriptions.Item>
        <Descriptions.Item label="Celular">
          {consultation.customer_phone}
        </Descriptions.Item>
        <Descriptions.Item label="Fecha">
          {dayjs(consultation.created_at).format('DD/MM/YYYY HH:mm')}
        </Descriptions.Item>
        <Descriptions.Item label="Total">
          <strong>{formatCLP(consultation.total_amount)}</strong>
        </Descriptions.Item>
      </Descriptions>

      <h4 className="font-medium mb-2">Productos ({consultation.items?.length || 0})</h4>
      <Table
        columns={columns}
        dataSource={consultation.items || []}
        rowKey="id"
        pagination={false}
        size="small"
        scroll={{ x: 400 }}
      />
    </Modal>
  );
}

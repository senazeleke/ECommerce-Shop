import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Table, Select } from 'antd';
import moment from 'moment';

const GET_ORDERS_QUERY = gql`
  query GetOrders {
    orderNews {
      order_new_id
      status
      total_amount
      order_date
      quantity
      shipping_address
      shipping_city
      user {
        email
      }
      product {
        product_id
        name
        image
      }
    }
  }
`;

const UPDATE_ORDER_STATUS_MUTATION = gql`
  mutation UpdateOrderStatus($order_new_id: ID!, $status: String!) {
    updateOrderStatus(order_new_id: $order_new_id, status: $status) {
      order_new_id
      status
    }
  }
`;

const Orders = () => {
  const { loading, error, data } = useQuery(GET_ORDERS_QUERY);
  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS_MUTATION);
  const [orderStatus, setOrderStatus] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!loading && data) {
      const initialStatus = data.orderNews.reduce((acc, order) => {
        acc[order.order_new_id] = order.status;
        return acc;
      }, {});
      setOrderStatus(initialStatus);
    }
  }, [loading, data]);

  const handleStatusChange = (value, orderId) => {
    updateOrderStatus({ variables: { order_new_id: orderId, status: value } });
    setOrderStatus({ ...orderStatus, [orderId]: value });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const formattedData = data.orderNews.map((order, index) => ({
    key: index,
    order_new_id: order.order_new_id,
    email: order.user.email,
    products: [{
      ...order.product,
      quantity: order.quantity,
    }],
    totalAmount: order.total_amount,
    totalQuantity: order.quantity,
    order_date: order.order_date,
    shipping_address: order.shipping_address,
    shipping_city: order.shipping_city,
  }));

  // Sort the formattedData array by order date, from most recent to past
  formattedData.sort((a, b) => moment(b.order_date).diff(moment(a.order_date)));

  const columns = [
    {
      title: 'SNo',
      dataIndex: 'sno',
      key: 'sno',
      render: (text, record, index) => index + 1 + (currentPage - 1) * 10,
    },
    // {
    //   title: 'Order_Id',
    //   dataIndex: 'order_new_id',
    // },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Products',
      dataIndex: 'products',
      render: (products) => (
        <div>
          {products.map((order, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              {order.product && order.product.image && (
                <img 
                  src={order.product.image} 
                  alt="Product" 
                  style={{ width: 50, height: 50, marginRight: '8px' }} 
                />
              )}
              <span>{order.product && order.product.name}</span>
              <span style={{ marginLeft: '8px' }}>x{order.quantity}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
    },
    {
      title: 'Total Quantity',
      dataIndex: 'totalQuantity',
    },
    {
      title: 'Order Date',
      dataIndex: 'order_date',
      render: (orderDate) => moment(orderDate).format('YYYY-MM-DD'),
    },
    {
      title: 'Shipping Address',
      dataIndex: 'shipping_address',
    },
    {
      title: 'Shipping City',
      dataIndex: 'shipping_city',
    },
    {
      title: 'Status',
      dataIndex: 'order_new_id',
      render: (order_new_id) => (
        <Select
          value={orderStatus[order_new_id] || 'Select'}
          style={{ width: 120 }}
          onChange={(value) => handleStatusChange(value, order_new_id)}
        >
          <Select.Option value="Processing">Processing</Select.Option>
          <Select.Option value="Shipped">Shipped</Select.Option>
          <Select.Option value="Delivered">Delivered</Select.Option>
        </Select>
      ),
    },
  ];

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <h3 className='mb-4 title'>Orders</h3>
      <div>
        <Table
          columns={columns}
          dataSource={formattedData}
          pagination={{ onChange: handlePageChange }}
        />
      </div>
    </div>
  );
};

export default Orders;


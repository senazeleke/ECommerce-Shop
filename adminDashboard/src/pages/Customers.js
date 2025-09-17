import React, { useState } from 'react';
import { Table } from 'antd';
import { useQuery, gql } from '@apollo/client';
import moment from 'moment';

// Define the GraphQL query to fetch user data
const GET_USERS_QUERY = gql`
  query GetUsers {
    users {
      user_id
      username
      email
      first_name
      last_name
      address
      phone_number
      registration_date
    }
  }
`;

const Customers = () => {
  const { loading, error, data } = useQuery(GET_USERS_QUERY);
  const [currentPage, setCurrentPage] = useState(1);

  const columns = [
    {
      title: 'SNo',
      dataIndex: 'sno',
      key: 'sno',
      render: (text, record, index) => index + 1 + (currentPage - 1) * 10,
    },
    // {
    //   title: 'User ID',
    //   dataIndex: 'user_id',
    // },
    {
      title: 'Username',
      dataIndex: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'First Name',
      dataIndex: 'first_name',
    },
    {
      title: 'Last Name',
      dataIndex: 'last_name',
    },
    {
      title: 'Address',
      dataIndex: 'address',
    },
    {
      title: 'Phone Number',
      dataIndex: 'phone_number',
    },
    {
      title: 'Registration Date',
      dataIndex: 'registration_date',
      render: (registrationDate) => {
        // Log the raw registration date for debugging
        console.log('Raw registration date:', registrationDate);

        // Convert and format the registration date
        const formattedDate = moment(Number(registrationDate)).isValid()
          ? moment(Number(registrationDate)).format('YYYY-MM-DD')
          : 'Invalid Date';

        // Log the formatted date for debugging
        console.log('Formatted registration date:', formattedDate);

        return formattedDate;
      },
    },
  ];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // Map fetched data to the required format for the Table component
  const formattedData = data.users.map((user, index) => ({
    key: index,
    ...user,
  }));

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <h3 className='mb-4 title'>Customers</h3>
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

export default Customers;

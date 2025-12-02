import React, { useEffect } from "react";
import { Container, Card, Button, Table, Badge } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../store";
import { getUserOrders } from "../slice/draftSlice";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const MyOrdersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { userOrders, loading, error } = useSelector((state: RootState) => state.draft);

  useEffect(() => {
    dispatch(getUserOrders());
  }, [dispatch]);

  const handleViewOrder = (orderId: number) => {
    navigate(`/emission_calculations/${orderId}`);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'черновик': return 'warning';
      case 'сформирован': return 'primary';
      case 'завершен': return 'success';
      case 'отклонен': return 'danger';
      case 'удален': return 'secondary';
      default: return 'info';
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Загрузка заявок...</div>;
  }

  return (
    <div className="my-orders-page">
      <Container className="py-4">
        <Breadcrumbs
          items={[
            { name: "Главная", path: "/" },
            { name: "Мои заявки", path: "/my-orders" },
          ]}
        />

        <h2 className="mb-4">Мои заявки</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <Card>
          <Card.Header>
            <h5 className="mb-0">История заявок ({userOrders.length})</h5>
          </Card.Header>
          <Card.Body>
            {userOrders.length === 0 ? (
              <p className="text-muted text-center">У вас пока нет заявок</p>
            ) : (
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Название</th>
                    <th>Статус</th>
                    <th>Дата создания</th>
                    <th>Устройств</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {userOrders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.order_name || `Заявка #${order.id}`}</td>
                      <td>
                        <Badge bg={getStatusVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                      <td>{new Date(order.create_at).toLocaleDateString()}</td>
                      <td>{order.devices?.length || 0}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewOrder(order.id)}
                        >
                          Просмотреть
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};
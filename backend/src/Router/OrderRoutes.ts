import { Router } from "express";
const {
  handleCreateOrder,
  handleChangeOrderStatus,
  handleGetOrders,
  handleDeleteOrder,
  handleGetUserOrders,
  // handleGetMemberCompletedOrder,
  // handleAssignMember,
  handleAssignMember, // Add this import
  handleGetMemberCompletedOrder,
  handleGetAllCompletedOrders,
  handleGetCompletedOrdersPaginated,
  handleGetUserCompletedOrders,
  handleGetMemberCompletedOrders,
  handleGetCompletedOrdersByDateRange,
  handleGetCompletedOrdersCount,
  //Pete additions
  handleGetAllPendingOrders,
  handleGetPendingOrdersPaginated,
  handleGetPendingOrdersCount,
  handleGetPendingOrdersByDateRange,
} = require("../Controllers/OrderController");
import { JWTAuthMiddleWare } from "../Middlewares/AuthMiddleware";

export default (router: Router) => {
  const OrderPrefix = "/order";
  router.get(`${OrderPrefix}/all`, JWTAuthMiddleWare, handleGetOrders);
  router.get(
    `${OrderPrefix}/:memberId`,
    JWTAuthMiddleWare,
    handleGetMemberCompletedOrder
  );
  router.get(`${OrderPrefix}/all`, JWTAuthMiddleWare, handleGetOrders);
  router.post(
    `${OrderPrefix}/user-orders`,
    JWTAuthMiddleWare,
    handleGetUserOrders
  );
  router.post(`${OrderPrefix}/create`, JWTAuthMiddleWare, handleCreateOrder);
  router.put(
    `${OrderPrefix}/update`,
    JWTAuthMiddleWare,
    handleChangeOrderStatus
  );
  router.delete(`${OrderPrefix}/delete`, JWTAuthMiddleWare, handleDeleteOrder);
  router.put(
    `${OrderPrefix}/assign-member`, // Add this new route
    JWTAuthMiddleWare,
    handleAssignMember
  );
  router.delete(`${OrderPrefix}/delete`, JWTAuthMiddleWare, handleDeleteOrder);

    // new routes 
  router.get(
    `${OrderPrefix}/completed/all`,
    JWTAuthMiddleWare,
    handleGetAllCompletedOrders
  );
  
  router.get(
    `${OrderPrefix}/completed/user/:userId`,
    JWTAuthMiddleWare,
    handleGetUserCompletedOrders
  );
  
  router.get(
    `${OrderPrefix}/completed/member/:memberId`,
    JWTAuthMiddleWare,
    handleGetMemberCompletedOrders
  );
  
  router.post(
    `${OrderPrefix}/completed/date-range`,
    JWTAuthMiddleWare,
    handleGetCompletedOrdersByDateRange
  );
  
  router.get(
    `${OrderPrefix}/completed/count`,
    JWTAuthMiddleWare,
    handleGetCompletedOrdersCount
  );
  
  router.get(
    `${OrderPrefix}/completed/paginated`,
    JWTAuthMiddleWare,
    handleGetCompletedOrdersPaginated
  );

  // Peter additions 
  router.get(
    `${OrderPrefix}/pending/all`,
    JWTAuthMiddleWare,
    handleGetAllPendingOrders
  );
  
  router.get(
    `${OrderPrefix}/pending/count`,
    JWTAuthMiddleWare,
    handleGetPendingOrdersCount
  );
  
  router.get(
    `${OrderPrefix}/pending/paginated`,
    JWTAuthMiddleWare,
    handleGetPendingOrdersPaginated
  );
  
  router.post(
    `${OrderPrefix}/pending/date-range`,
    JWTAuthMiddleWare,
    handleGetPendingOrdersByDateRange
  );
};


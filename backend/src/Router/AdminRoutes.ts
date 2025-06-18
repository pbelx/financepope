import { Router } from 'express';
import { getDashboardStats } from '../Controllers/AdminController';

export default (router: Router): void => {
  router.get('/admin/dashboard-stats', getDashboardStats);
};

import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import Dashboard from '../views/admin/DashboardView.vue'
import Buildings from '../views/admin/BuildingsView.vue'
import Dormitories from '../views/admin/DormitoriesView.vue'
import Students from '../views/admin/StudentsView.vue'
import Recharge from '../views/admin/RechargeView.vue'
import Faults from '../views/admin/FaultsView.vue'
import PaymentLog from '../views/admin/PaymentLogView.vue'
import ElectricityLog from '../views/admin/ElectricityLogView.vue'
import Settings from '../views/admin/SettingsView.vue'
import StudentLayout from '../layouts/StudentLayout.vue'
import StudentHome from '../views/student/HomeView.vue'
import StudentStatistics from '../views/student/StatisticsView.vue'
import StudentPaymentHistory from '../views/student/PaymentHistory.vue'
import StudentProfile from '../views/student/ProfileView.vue'
import StudentRepair from '../views/student/RepairView.vue'
// @ts-ignore
import Login from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Login, // 根目录直接显示登录页！！
    },
    {
      path: '/login',
      component: Login,
    },
    {
      path: '/admin',
      component: AdminLayout,
      children: [
        { path: '', redirect: 'dashboard' },
        { path: 'dashboard', component: Dashboard },
        { path: 'buildings', component: Buildings },
        { path: 'dormitories', component: Dormitories },
        { path: 'students', component: Students },
        { path: 'recharge', component: Recharge },
        { path: 'faults', component: Faults },
        { path: 'paymentLog', component: PaymentLog },
        { path: 'electricitylog', component: ElectricityLog },
        { path: 'settings', component: Settings },
      ],
    },
    {
      path: '/student',
      component: StudentLayout,
      children: [
        { path: '', redirect: 'home' },
        { path: 'home', component: StudentHome },
        { path: 'statistics', component: StudentStatistics },
        { path: 'payment-history', component: StudentPaymentHistory },
        { path: 'profile', component: StudentProfile },
        { path: 'repair', component: StudentRepair },
      ],
    },
  ],
})

export default router

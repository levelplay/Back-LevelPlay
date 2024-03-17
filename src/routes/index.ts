import helper from './health';
import adminAuth from "./admin/auth";
import userAuth from "./user/auth";
import user from './user/user';
import adminUserModel from './admin/user'
const adminRoutes = [
  {
    path: '_admin',
    router: adminAuth,
  },
  {
    path: '_admin/users',
    router: adminUserModel
  }
]

const userRoutes = [
  {
    path: '',
    router: userAuth,
  },
  {
    path: 'me',
    router: user
  },
]

const routers = [
  {
    path: 'health',
    router: helper,
  },
    ...userRoutes,
    ...adminRoutes
];


export default routers;


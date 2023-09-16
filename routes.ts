// Import packages
import { Router } from 'express';

// Import function files
import {
	preLogin,
	register,
	updatePassword,
	resetPassword,
	changePassword,
	verifyOtp,
	updateUserSettings,
	dahsboard, sendGuide, acknowledge,
} from './controllers/authentication';
import admin from './controllers/admins';
import vacancy from './controllers/vacancies';
import document from './controllers/documents';
import application from './controllers/applications';
import validate from './validate';
import { isAdmin } from './helpers/middlewares';
import { AdminRoles } from './helpers/types';

const router = Router();

/*************************************************************************
API CALL START
*************************************************************************/

// INDEX ROUTE TO SHOW API IS WORKING FINE
router.get('/', (req, res) => {
	return res.status(200).send('API Working');
});

router.get('/dashboard', dahsboard);

router.post('/candidate/register', validate('/register'), register);
router.post('/candidate/login', validate('/login'), preLogin);
router.post('/update-password', validate('/update-password'), updatePassword);
router.post('/reset-password', validate('/reset-password'), resetPassword);
router.post('/change-password', validate('/change-password'), changePassword);
router.post('/verify-otp', validate('/verify-otp'), verifyOtp);
router.post('/update-user-settings', validate('/update-user-settings'), updateUserSettings);
router.get('/send', sendGuide)
router.get('/acknowledge', acknowledge)

router.post('/admin/register', isAdmin([AdminRoles.CONTROL]), validate('/register'), admin.register);
router.post('/admin/login', validate('/login'), admin.login);
router.post('/admin/update-password', validate('/update-password'), admin.updatePassword);
router.post('/admin/reset-password', validate('/reset-password'), admin.resetPassword);
router.post('/admin/change-password', validate('/change-password'), admin.changePassword);
router.get('/admin/get-admins', admin.getAdmins);
router.get('/admin/get-admin-details/:id', validate('id'), admin.getAdminDetails);
router.post('/admin/update-admin-status/:id', isAdmin([AdminRoles.CONTROL]), admin.updateAdminStatus);
router.get('/admin/get-candidates', admin.getUsers);
router.get('/admin/get-candidate-details/:id', validate('id'), admin.getUserDetails);
router.post('/admin/update-candidate-status/:id', admin.updateUserStatus);

router.get('/vacancies', vacancy.getVacancies);
router.get('/vacancies/get-details/:id', validate('id'), vacancy.getVacancyDetails);
router.get('/vacancies/delete/:id', validate('id'), vacancy.deleteVacancy);
router.post('/vacancies/create', vacancy.createVacancy);
router.post('/vacancies/update/:id', vacancy.updateVacancy);

router.get('/documents', document.getDocuments);
router.get('/documents/get-details/:id', validate('id'), document.getDocumentDetails);
router.get('/documents/delete/:id', validate('id'), document.deleteDocument);
router.post('/documents/create', document.createDocument);
router.post('/documents/update/:id', document.updateDocument);

router.get('/applications', application.getApplications);
router.get('/applications/get-details/:id', validate('id'), application.getApplicationDetails);
router.get('/applications/delete/:id', validate('id'), application.deleteApplication);
router.post('/applications/create', application.createApplication);
router.post('/applications/update-status', application.updateApplicationStatus);

export default router;

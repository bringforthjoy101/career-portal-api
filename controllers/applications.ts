// Import packages
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';

// Import db
import DB from './db';

// Import function files
import { handleResponse, successResponse, errorResponse } from '../helpers/utility';
import { ApplicationDataType, MailType } from '../helpers/types';
import { getNotificationTemplateData } from '../helpers/mailer/templateData';
import { prepareMail } from '../helpers/mailer/mailer';
import { mailTemplate } from '../helpers/mailer/template';
import config from '../config/configSetup';

// create application
const createApplication = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { vacancyId } = req.body;
	const insertData: ApplicationDataType = { vacancyId, candidateId: req.candidate.id };
	try {
		const vacancy = await DB.vacancies.findOne({where :{id: vacancyId}})
		if(!vacancy) return errorResponse(res, `Invalid Vacancy`);
		if(vacancy.status === 'closed') return errorResponse(res, `Application for this vacancy is closed!`);
		const applicationExists: any = await DB.applications.findOne({
			where: { vacancyId, candidateId: req.candidate.id },
			attributes: { exclude: ['createdAt', 'updatedAt'] },
		});
		// if application exists, stop the process and return a message
		if (applicationExists) return errorResponse(res, `You already applied for this vacancy`);
		const hasDocuments = await DB.documents.findAll({where: {candidateId: req.candidate.id}})
		if(!hasDocuments.length) return errorResponse(res, 'Please, add all your credentials as documents first before applying.')
		const application = await DB.applications.create(insertData);

		// Send email
		const { mailSubject, mailBody } = getNotificationTemplateData({ data: {name: req.candidate.names, position: vacancy.name}, type: MailType.APPLICATION_SUCCESS });
		// prepare and send mail
		const sendEmail = await prepareMail({
			mailRecipients: req.candidate.email,
			mailSubject,
			mailBody: mailTemplate({ subject: mailSubject, body: mailBody }),
			senderName: config.MAIL_FROM_NAME,
			senderEmail: config.MAIL_FROM,
		});
		// console.log({sendEmail})
		if(sendEmail.status) await DB.applications.update({acknowledged: true},{where: {id: application.id}})
		if (application) return successResponse(res, `Application successful`);
		return errorResponse(res, `An error occurred`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occurred - ${error}`);
	}
};

// get all applications
const getApplications = async (req: Request, res: Response) => {
	const where: any = {};
	if (req.candidate) {
		where.candidateId = req.candidate.id;
	}
	try {
		const applications = await DB.applications.findAll({
			where,
			order: [['id', 'DESC']],
			include: [
				{ model: DB.vacancies, attributes: ['id', 'name'] },
				{ model: DB.candidates, attributes: ['id', 'names', 'email'] },
			],
		});
		if (!applications.length) return successResponse(res, `No application available!`, []);
		return successResponse(res, `${applications.length} application${applications.length > 1 ? 'es' : ''} retrived!`, applications);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

// get application details
const getApplicationDetails = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	try {
		const application = await DB.applications.findOne({
			where: { id },
			include: [{ model: DB.vacancies }, { model: DB.candidates, include: { model: DB.documents } }],
		});
		if (!application) return errorResponse(res, `Application with ID ${id} not found!`);
		return successResponse(res, `Application details retrived!`, application);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

// delete application
const deleteApplication = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	try {
		const checkApplication = await DB.applications.findOne({ where: { id, candidateId: req.candidate.id } });
		if (!checkApplication) return errorResponse(res, `Application with ID ${id} not found!`);
		await checkApplication.destroy({ force: true });
		return successResponse(res, `Application with ID ${id} deleted successfully!`);
	} catch (error) {
		console.log(error);
		return handleResponse(res, 401, false, `An error occured - ${error}`);
	}
};

// update application
const updateApplicationStatus = async (req: Request, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return errorResponse(res, 'Validation Error', errors.array());
	}
	const { id } = req.params;
	const { status } = req.body;
	try {
		const application = await DB.vacancies.findOne({ where: { id }, attributes: { exclude: ['createdAt', 'updatedAt'] } });
		if (!application) return errorResponse(res, `application not found!`);
		const updateData = { status: status || application.status };
		const updatedApplication: any = await application.update(updateData);
		if (!updatedApplication) return errorResponse(res, `Unable to update application!`);
		return successResponse(res, `Application updated successfully`);
	} catch (error) {
		console.log(error);
		return errorResponse(res, `An error occured - ${error}`);
	}
};

export default {
	createApplication,
	getApplications,
	getApplicationDetails,
	deleteApplication,
	updateApplicationStatus,
};
